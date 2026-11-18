/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot, 
  increment,
  serverTimestamp
} from "firebase/firestore";
import { db, getProjectPublicUrl } from "./firebase.ts";

export interface Project {
  id: string; // Document ID, identical to slug
  slug: string;
  ownerId: string;
  name: string;
  builder?: string;
  location: string;
  mapLink?: string;
  rera?: string;
  reraId?: string; // compatibility alias
  price: number | string;
  priceUnit: "Lakh" | "Crore";
  bhk: string[];
  configurations?: string[]; // compatibility alias
  carpetArea?: string | number;
  status: "available" | "sold";
  amenities: string[];
  whatsapp: string;
  views: number;
  coverImage?: string; // compatibility alias
  description?: string; // compatibility alias
  createdAt: string;
  updatedAt?: string;
}

export interface ProjectInput {
  name: string;
  builder?: string;
  location: string;
  mapLink?: string;
  rera?: string;
  price: number | string;
  priceUnit: "Lakh" | "Crore";
  bhk: string[];
  carpetArea?: string | number;
  status: "available" | "sold";
  amenities: string[];
  whatsapp: string;
}

/**
 * Generate a unique 4-character random lowercase alphanumeric suffix
 */
function generateRandomSuffix(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Convert project name into a clean, URL-safe slug
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start
    .replace(/-+$/, ""); // Trim - from end
}

/**
 * Strips any undefined fields from an object before writing to Firestore.
 */
export function sanitizeFirestoreData<T extends Record<string, any>>(data: T): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      clean[key] = value;
    }
  }
  return clean;
}

/**
 * Generate a unique slug in format: {slugified-name}-{4-random-chars}
 * Verifies that document ID does not already exist in Firestore projects collection.
 */
export async function generateUniqueProjectSlug(projectName: string): Promise<string> {
  const baseSlug = slugify(projectName) || "project";
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    const randomCode = generateRandomSuffix();
    const candidateSlug = `${baseSlug}-${randomCode}`;

    try {
      const docRef = doc(db, "projects", candidateSlug);
      const existingSnap = await getDoc(docRef);

      if (!existingSnap.exists()) {
        return candidateSlug;
      }
    } catch (readErr) {
      console.warn("Could not check candidate slug existence via getDoc:", readErr);
      return candidateSlug;
    }
    attempts++;
  }

  // Fallback with timestamp if collisions persist
  return `${baseSlug}-${Date.now().toString(36).slice(-4)}`;
}

/**
 * Format project price for display in Indian format (e.g. ₹85 Lakh or ₹1.50 Crore)
 */
export function formatProjectPrice(price: number | string, unit?: "Lakh" | "Crore"): string {
  if (typeof price === "string" && (price.includes("₹") || price.includes("Lakh") || price.includes("Cr"))) {
    return price;
  }
  const num = typeof price === "number" ? price : parseFloat(price);
  if (isNaN(num)) return "Price on request";

  const resolvedUnit = unit || (num >= 100 ? "Crore" : "Lakh");
  return `₹${num} ${resolvedUnit}`;
}

class ProjectService {
  /**
   * Subscribe to real-time changes of all projects owned by the specified user
   */
  public subscribeToUserProjects(
    ownerId: string,
    onSuccess: (projects: Project[]) => void,
    onError: (err: Error) => void
  ): () => void {
    if (!ownerId) {
      onSuccess([]);
      return () => {};
    }

    try {
      const q = query(
        collection(db, "projects"),
        where("ownerId", "==", ownerId)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const projects: Project[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            projects.push({
              id: docSnap.id,
              slug: data.slug || docSnap.id,
              ownerId: data.ownerId,
              name: data.name || "Untitled Project",
              builder: data.builder || undefined,
              location: data.location || "Location on request",
              mapLink: data.mapLink || undefined,
              rera: data.rera || data.reraId || undefined,
              price: data.price !== undefined ? data.price : "Price on request",
              priceUnit: data.priceUnit === "Crore" ? "Crore" : "Lakh",
              bhk: Array.isArray(data.bhk) ? data.bhk : (data.configurations || []),
              carpetArea: data.carpetArea || undefined,
              status: (data.status === "sold" ? "sold" : "available"),
              amenities: Array.isArray(data.amenities) ? data.amenities : [],
              whatsapp: data.whatsapp || "",
              views: typeof data.views === "number" ? data.views : 0,
              createdAt: data.createdAt || new Date().toISOString(),
              updatedAt: data.updatedAt || undefined,
            });
          });

          // Sort in memory by createdAt descending
          projects.sort((a, b) => {
            const timeA = new Date(a.createdAt).getTime() || 0;
            const timeB = new Date(b.createdAt).getTime() || 0;
            return timeB - timeA;
          });

          onSuccess(projects);
        },
        (error) => {
          console.error("Firestore projects onSnapshot error:", error);
          onError(error);
        }
      );

      return unsubscribe;
    } catch (err: any) {
      console.error("Failed to initialize projects subscription:", err);
      onError(err);
      return () => {};
    }
  }

  /**
   * Create a new project document in Firestore.
   * Document ID is the unique slug.
   */
  public async createProject(
    params: ProjectInput,
    ownerId: string
  ): Promise<Project> {
    const slug = await generateUniqueProjectSlug(params.name);
    const now = new Date().toISOString();

    const newProject: Project = {
      id: slug,
      slug,
      ownerId,
      name: params.name.trim(),
      builder: params.builder?.trim() || "",
      location: params.location.trim(),
      mapLink: params.mapLink?.trim() || "",
      rera: params.rera?.trim() || "",
      price: params.price,
      priceUnit: params.priceUnit,
      bhk: params.bhk,
      carpetArea: params.carpetArea || "",
      status: params.status,
      amenities: params.amenities,
      whatsapp: params.whatsapp.trim(),
      views: 0,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = doc(db, "projects", slug);
    await setDoc(docRef, sanitizeFirestoreData({
      ...newProject,
      serverCreatedAt: serverTimestamp(),
    }));

    return newProject;
  }

  /**
   * Update an existing project in Firestore. Only the owner can modify it.
   */
  public async updateProject(
    slug: string,
    params: Partial<ProjectInput>,
    ownerId: string
  ): Promise<void> {
    const docRef = doc(db, "projects", slug);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      throw new Error("Project not found.");
    }

    const existingData = snap.data();
    if (existingData.ownerId !== ownerId) {
      throw new Error("You do not have permission to edit this project.");
    }

    const updates: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    if (params.name !== undefined) updates.name = params.name.trim();
    if (params.builder !== undefined) updates.builder = params.builder.trim() || null;
    if (params.location !== undefined) updates.location = params.location.trim();
    if (params.mapLink !== undefined) updates.mapLink = params.mapLink.trim() || null;
    if (params.rera !== undefined) updates.rera = params.rera.trim() || null;
    if (params.price !== undefined) updates.price = params.price;
    if (params.priceUnit !== undefined) updates.priceUnit = params.priceUnit;
    if (params.bhk !== undefined) updates.bhk = params.bhk;
    if (params.carpetArea !== undefined) updates.carpetArea = params.carpetArea || null;
    if (params.status !== undefined) updates.status = params.status;
    if (params.amenities !== undefined) updates.amenities = params.amenities;
    if (params.whatsapp !== undefined) updates.whatsapp = params.whatsapp.trim();

    await updateDoc(docRef, updates);
  }

  /**
   * Toggle project status between 'available' and 'sold'
   */
  public async toggleProjectStatus(slug: string, newStatus: "available" | "sold"): Promise<void> {
    const docRef = doc(db, "projects", slug);
    await updateDoc(docRef, {
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Delete a project document permanently from Firestore
   */
  public async deleteProject(slug: string): Promise<void> {
    const docRef = doc(db, "projects", slug);
    await deleteDoc(docRef);
  }

  /**
   * Fetch a single project by its slug
   */
  public async getProjectBySlug(slug: string): Promise<Project | null> {
    try {
      const docRef = doc(db, "projects", slug);
      const snap = await getDoc(docRef);
      if (!snap.exists()) {
        return null;
      }
      const data = snap.data();
      return {
        id: snap.id,
        slug: data.slug || snap.id,
        ownerId: data.ownerId,
        name: data.name || "Untitled Project",
        builder: data.builder || undefined,
        location: data.location || "Location on request",
        mapLink: data.mapLink || undefined,
        rera: data.rera || data.reraId || undefined,
        price: data.price !== undefined ? data.price : "Price on request",
        priceUnit: data.priceUnit === "Crore" ? "Crore" : "Lakh",
        bhk: Array.isArray(data.bhk) ? data.bhk : (data.configurations || []),
        carpetArea: data.carpetArea || undefined,
        status: data.status === "sold" ? "sold" : "available",
        amenities: Array.isArray(data.amenities) ? data.amenities : [],
        whatsapp: data.whatsapp || "",
        views: typeof data.views === "number" ? data.views : 0,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || undefined,
      };
    } catch (err) {
      console.error("Error fetching project by slug:", err);
      return null;
    }
  }

  /**
   * Increment the view counter when a prospective buyer opens the smart link
   */
  public async incrementProjectViews(slug: string): Promise<void> {
    try {
      const docRef = doc(db, "projects", slug);
      await updateDoc(docRef, {
        views: increment(1),
        lastViewedAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn("Could not increment project views:", err);
    }
  }

  /**
   * Get public link for a project: {BASE_URL}/p/{slug}
   */
  public getPublicUrl(slug: string, _legacyFallback?: boolean): string {
    return getProjectPublicUrl(slug, _legacyFallback);
  }
}

export const projectService = new ProjectService();
