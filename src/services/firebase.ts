/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, initializeFirestore } from "firebase/firestore";

/**
 * ---------------------------------------------------------------------------
 * CUSTOM DOMAIN OVERRIDE
 * Set this to your custom domain if desired (e.g., "https://dwwaar.link").
 * When empty, it automatically defaults to window.location.origin.
 * ---------------------------------------------------------------------------
 */
export const CUSTOM_DOMAIN: string = "";

/**
 * ---------------------------------------------------------------------------
 * FIREBASE WEB CONFIGURATION
 * Paste your Firebase web app credentials here.
 * ---------------------------------------------------------------------------
 */
export const firebaseConfig = {
  apiKey: "AIzaSyCTzEZpO1IaVgV8rFcKQE_Zm8r-IKlMZ6k",
  authDomain: "bit-saas-3198f.firebaseapp.com",
  projectId: "bit-saas-3198f",
  storageBucket: "bit-saas-3198f.firebasestorage.app",
  messagingSenderId: "1055134295250",
  appId: "1:1055134295250:web:1b35b71d38378ad88eb90b"
};

// Initialize or retrieve Firebase App instance
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Firebase Auth & Firestore instances (Modular SDK v9+)
export const auth = getAuth(app);

// Use initializeFirestore with ignoreUndefinedProperties so undefined fields never crash Firestore operations
let firestoreDb: any;
try {
  firestoreDb = initializeFirestore(app, {
    ignoreUndefinedProperties: true,
  });
} catch {
  firestoreDb = getFirestore(app);
}
export const db = firestoreDb;

// Google Auth Provider configured for account selection
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account"
});

/**
 * Helper to get the canonical base URL for public project links.
 * Checks CUSTOM_DOMAIN first; otherwise window.location.origin.
 * If origin is empty or "null" (common in sandboxed iframes), falls back
 * to window.location.href stripped of its path/query/hash.
 */
export function getBaseUrl(): string {
  if (CUSTOM_DOMAIN && CUSTOM_DOMAIN.trim() !== "") {
    return CUSTOM_DOMAIN.trim().replace(/\/+$/, "");
  }

  if (typeof window !== "undefined" && window.location) {
    const origin = window.location.origin;
    if (origin && origin !== "null" && origin.trim() !== "") {
      return origin.replace(/\/+$/, "");
    }

    // Fall back to window.location.href without the path
    try {
      if (window.location.href) {
        const parsed = new URL(window.location.href);
        if (parsed.protocol && parsed.host) {
          return `${parsed.protocol}//${parsed.host}`.replace(/\/+$/, "");
        }
      }
    } catch {
      // Ignore URL parse error and try regex
    }

    if (window.location.protocol && window.location.host) {
      return `${window.location.protocol}//${window.location.host}`.replace(/\/+$/, "");
    }

    if (window.location.href) {
      const match = window.location.href.match(/^(https?:\/\/[^\/?#]+)/i);
      if (match && match[1]) {
        return match[1].replace(/\/+$/, "");
      }
    }
  }

  return "https://dwwaar.link";
}

/**
 * Build project public link as {BASE_URL}/p/{slug}
 */
export function getProjectPublicUrl(slug: string, _legacyFallback?: boolean): string {
  const base = getBaseUrl();
  const cleanSlug = (slug || "").trim();
  return `${base}/p/${cleanSlug}`;
}
