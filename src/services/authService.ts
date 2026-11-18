/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  updateProfile,
  onAuthStateChanged,
  sendPasswordResetEmail,
  User as FirebaseUser
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "./firebase.ts";

export interface DwwaarUser {
  id: string;
  fullName: string;
  name: string; // alias for compatibility
  email: string;
  mobile?: string;
  plan: "free" | "pro";
  avatarUrl?: string;
  provider: "email" | "google";
  createdAt: string;
}

const STORAGE_KEY_CURRENT_USER = "dwwaar_auth_current_user";

class AuthService {
  private authStateListeners: Array<(user: DwwaarUser | null) => void> = [];

  constructor() {
    if (typeof window !== "undefined") {
      // Check for redirect result on mobile Google sign-in
      getRedirectResult(auth)
        .then(async (result) => {
          if (result && result.user) {
            const user = await this.mapFirebaseUserToDwwaarUser(result.user);
            this.saveSession(user);
            this.notifyListeners(user);
          }
        })
        .catch((err) => {
          console.warn("Firebase redirect auth result:", err);
        });

      // Keep local session strictly synced with real Firebase Auth state
      onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          const user = await this.mapFirebaseUserToDwwaarUser(firebaseUser);
          this.saveSession(user);
          this.notifyListeners(user);
        } else {
          this.clearSession();
          this.notifyListeners(null);
        }
      });
    }
  }

  public onAuthChange(callback: (user: DwwaarUser | null) => void): () => void {
    this.authStateListeners.push(callback);
    return () => {
      this.authStateListeners = this.authStateListeners.filter((cb) => cb !== callback);
    };
  }

  public onAuthStateChanged(callback: (user: DwwaarUser | null) => void): () => void {
    return this.onAuthChange(callback);
  }

  private notifyListeners(user: DwwaarUser | null) {
    this.authStateListeners.forEach((cb) => {
      try {
        cb(user);
      } catch (e) {
        console.error("Auth listener error:", e);
      }
    });
  }

  /**
   * Get current authenticated user from Firebase Auth or session cache
   */
  public getCurrentUser(): DwwaarUser | null {
    if (auth.currentUser) {
      const cached = this.getCachedSession();
      if (cached && cached.id === auth.currentUser.uid) {
        return cached;
      }
      return {
        id: auth.currentUser.uid,
        fullName: auth.currentUser.displayName || auth.currentUser.email?.split("@")[0] || "User",
        name: auth.currentUser.displayName || auth.currentUser.email?.split("@")[0] || "User",
        email: auth.currentUser.email || "",
        mobile: auth.currentUser.phoneNumber || undefined,
        plan: "free",
        avatarUrl: auth.currentUser.photoURL || undefined,
        provider: auth.currentUser.providerData[0]?.providerId === "google.com" ? "google" : "email",
        createdAt: auth.currentUser.metadata.creationTime || new Date().toISOString(),
      };
    }
    return this.getCachedSession();
  }

  /**
   * Log in with Email & Password via Firebase Auth
   */
  public async loginWithEmail(email: string, password: string): Promise<DwwaarUser> {
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
      const user = await this.mapFirebaseUserToDwwaarUser(userCredential.user);
      this.saveSession(user);
      return user;
    } catch (err: any) {
      throw this.transformFirebaseError(err);
    }
  }

  /**
   * Register a new user with Email, Password, Name, and Mobile.
   * Stores doc in Firestore: users/{uid} with fields: fullName, mobile, email, plan: "free", createdAt
   */
  public async signupWithEmail(
    fullName: string,
    mobile: string,
    email: string,
    password: string
  ): Promise<DwwaarUser> {
    const normalizedEmail = email.trim().toLowerCase();
    const cleanMobile = mobile.replace(/\D/g, "").slice(-10);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      
      // Update displayName on Firebase Auth profile
      await updateProfile(userCredential.user, {
        displayName: fullName.trim(),
      });

      const now = new Date().toISOString();

      // Save user doc to Firestore users/{uid}
      try {
        await setDoc(doc(db, "users", userCredential.user.uid), {
          fullName: fullName.trim(),
          mobile: cleanMobile,
          email: normalizedEmail,
          plan: "free",
          createdAt: now,
        });
      } catch (firestoreErr) {
        console.warn("Firestore user document creation note:", firestoreErr);
      }

      const newUser: DwwaarUser = {
        id: userCredential.user.uid,
        fullName: fullName.trim(),
        name: fullName.trim(),
        email: normalizedEmail,
        mobile: cleanMobile,
        plan: "free",
        provider: "email",
        createdAt: now,
      };

      this.saveSession(newUser);
      return newUser;
    } catch (err: any) {
      throw this.transformFirebaseError(err);
    }
  }

  /**
   * Sign in with Google account.
   * Uses signInWithPopup, with fallback to signInWithRedirect on mobile or when popup fails.
   */
  public async loginWithGoogle(): Promise<{ user: DwwaarUser; isNewUser: boolean }> {
    const isMobileDevice = typeof window !== "undefined" && 
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    try {
      let firebaseUser: FirebaseUser;

      try {
        const result = await signInWithPopup(auth, googleProvider);
        firebaseUser = result.user;
      } catch (popupErr: any) {
        // Fallback to signInWithRedirect if popup is blocked or on mobile
        if (
          isMobileDevice ||
          popupErr.code === "auth/popup-blocked" ||
          popupErr.code === "auth/cancelled-popup-request"
        ) {
          await signInWithRedirect(auth, googleProvider);
          // Wait for redirect to commence
          return new Promise(() => {});
        }
        throw popupErr;
      }

      // Check if user already exists in Firestore users/{uid}
      let existingMobile: string | undefined = undefined;
      let existingPlan: "free" | "pro" = "free";
      let existingCreatedAt: string = firebaseUser.metadata.creationTime || new Date().toISOString();
      let existingFullName: string = firebaseUser.displayName || "Google User";

      try {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          existingMobile = data.mobile;
          existingPlan = data.plan || "free";
          existingFullName = data.fullName || existingFullName;
          existingCreatedAt = data.createdAt || existingCreatedAt;
        } else {
          // Initialize document in Firestore
          await setDoc(doc(db, "users", firebaseUser.uid), {
            fullName: existingFullName,
            email: firebaseUser.email || "",
            plan: "free",
            createdAt: existingCreatedAt,
          }, { merge: true });
        }
      } catch (e) {
        // Fallback to local session cache if Firestore read fails
        const cached = this.getCachedSession();
        if (cached && cached.id === firebaseUser.uid && cached.mobile) {
          existingMobile = cached.mobile;
        }
      }

      const user: DwwaarUser = {
        id: firebaseUser.uid,
        fullName: existingFullName,
        name: existingFullName,
        email: firebaseUser.email || "",
        mobile: existingMobile,
        plan: existingPlan,
        avatarUrl: firebaseUser.photoURL || undefined,
        provider: "google",
        createdAt: existingCreatedAt,
      };

      this.saveSession(user);

      // Prompt for mobile number if not yet saved on user doc
      const isNewUser = !existingMobile;
      return { user, isNewUser };
    } catch (err: any) {
      throw this.transformFirebaseError(err);
    }
  }

  /**
   * Save 10-digit mobile number to users/{uid} in Firestore
   */
  public async saveMobile(userId: string, mobile: string): Promise<DwwaarUser> {
    const cleanMobile = mobile.replace(/\D/g, "").slice(-10);

    const currentUser = this.getCurrentUser();
    if (!currentUser || currentUser.id !== userId) {
      throw new Error("Active user session not found.");
    }

    try {
      await setDoc(doc(db, "users", userId), {
        fullName: currentUser.fullName,
        email: currentUser.email,
        mobile: cleanMobile,
        plan: currentUser.plan || "free",
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (firestoreErr) {
      console.warn("Firestore saveMobile note:", firestoreErr);
    }

    const updatedUser: DwwaarUser = {
      ...currentUser,
      mobile: cleanMobile,
    };

    this.saveSession(updatedUser);
    return updatedUser;
  }

  /**
   * Update full name and mobile number in Firestore users/{uid} and Firebase Auth
   */
  public async updateUserProfile(userId: string, data: { fullName: string; mobile: string }): Promise<DwwaarUser> {
    const cleanName = data.fullName.trim();
    const cleanMobile = data.mobile.replace(/\D/g, "").slice(-10);

    const currentUser = this.getCurrentUser();
    if (!currentUser || currentUser.id !== userId) {
      throw new Error("Active user session not found.");
    }

    // 1. Update Firestore users/{uid}
    try {
      await setDoc(doc(db, "users", userId), {
        fullName: cleanName,
        mobile: cleanMobile,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (firestoreErr) {
      console.warn("Firestore updateUserProfile error:", firestoreErr);
      throw new Error("Failed to save profile changes to database.");
    }

    // 2. Update Firebase Auth displayName
    if (auth.currentUser) {
      try {
        await updateProfile(auth.currentUser, {
          displayName: cleanName,
        });
      } catch (authErr) {
        console.warn("Firebase Auth updateProfile displayName note:", authErr);
      }
    }

    // 3. Update session cache and notify listeners
    const updatedUser: DwwaarUser = {
      ...currentUser,
      fullName: cleanName,
      name: cleanName,
      mobile: cleanMobile,
    };

    this.saveSession(updatedUser);
    this.notifyListeners(updatedUser);
    return updatedUser;
  }

  /**
   * Send Firebase password reset email to user's registered email
   */
  public async sendPasswordReset(email: string): Promise<void> {
    const targetEmail = (email || this.getCurrentUser()?.email || "").trim().toLowerCase();
    if (!targetEmail) {
      throw new Error("Email address is required.");
    }
    try {
      await sendPasswordResetEmail(auth, targetEmail);
    } catch (err: any) {
      throw this.transformFirebaseError(err);
    }
  }

  /**
   * Sign out current user
   */
  public async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Firebase signOut error", err);
    } finally {
      this.clearSession();
      this.notifyListeners(null);
    }
  }

  private async mapFirebaseUserToDwwaarUser(firebaseUser: FirebaseUser): Promise<DwwaarUser> {
    let mobile: string | undefined = undefined;
    let fullName: string = firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User";
    let plan: "free" | "pro" = "free";
    let createdAt: string = firebaseUser.metadata.creationTime || new Date().toISOString();

    try {
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        mobile = data.mobile;
        fullName = data.fullName || fullName;
        plan = data.plan || "free";
        createdAt = data.createdAt || createdAt;
      }
    } catch {
      const cached = this.getCachedSession();
      if (cached && cached.id === firebaseUser.uid) {
        mobile = cached.mobile;
        fullName = cached.fullName || fullName;
        plan = cached.plan || "free";
      }
    }

    return {
      id: firebaseUser.uid,
      fullName,
      name: fullName,
      email: firebaseUser.email || "",
      mobile,
      plan,
      avatarUrl: firebaseUser.photoURL || undefined,
      provider: firebaseUser.providerData[0]?.providerId === "google.com" ? "google" : "email",
      createdAt,
    };
  }

  private transformFirebaseError(err: any): Error {
    const code = err.code || "";
    const originalMessage = err.message || "";

    if (code === "auth/email-already-in-use") {
      const e: any = new Error("Email already registered, try logging in");
      e.code = "auth/email-already-in-use";
      return e;
    }

    if (
      code === "auth/invalid-credential" ||
      code === "auth/user-not-found" ||
      code === "auth/wrong-password" ||
      code === "auth/invalid-login-credentials"
    ) {
      return new Error("Wrong email or password");
    }

    if (code === "auth/network-request-failed") {
      return new Error("Network error. Please check your internet connection.");
    }

    if (code === "auth/popup-closed-by-user") {
      return new Error("Google sign-in was cancelled.");
    }

    if (code === "auth/popup-blocked") {
      return new Error("Popup blocked by browser. Please allow popups for Google sign-in.");
    }

    if (code === "auth/too-many-requests") {
      return new Error("Too many failed attempts. Please wait a moment and try again.");
    }

    return new Error(originalMessage || "Authentication failed. Please try again.");
  }

  private saveSession(user: DwwaarUser) {
    try {
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
    } catch (err) {
      console.error("Failed to save session", err);
    }
  }

  private getCachedSession(): DwwaarUser | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CURRENT_USER) || localStorage.getItem("dwaar_auth_current_user");
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  private clearSession() {
    try {
      localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    } catch {
      // ignore
    }
  }
}

export const authService = new AuthService();
