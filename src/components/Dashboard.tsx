/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { 
  Building2, 
  MapPin, 
  Plus, 
  ExternalLink, 
  Copy, 
  QrCode as QrIcon, 
  Edit3, 
  Trash2, 
  LogOut, 
  Eye, 
  Check, 
  X, 
  AlertTriangle, 
  RefreshCw, 
  ArrowLeft, 
  Sparkles,
  MessageCircle,
  Download,
  ChevronRight,
  User,
  HelpCircle,
  CreditCard,
  Instagram,
  ShieldCheck,
  ChevronDown,
  Mail,
  Phone,
  KeyRound,
  Calendar,
  Lock,
  Layers
} from "lucide-react";
import { DwwaarUser, authService } from "../services/authService.ts";
import { Project, projectService, formatProjectPrice } from "../services/projectService.ts";
import { ProjectForm } from "./ProjectForm.tsx";
import { ShareModal, copyTextSafely } from "./ShareModal.tsx";
import { LOGO_PATH, WHATSAPP_URL } from "../constants.ts";

export type DashboardTab = "projects" | "profile" | "plan" | "help";

interface DashboardProps {
  user: DwwaarUser;
  onLogout: () => void;
  onNavigateHome: () => void;
  initialSubRoute?: {
    type: "list" | "new" | "edit" | "profile" | "plan" | "help";
    slug?: string;
  };
  onNavigateRoute: (path: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  onLogout,
  onNavigateHome,
  initialSubRoute = { type: "list" },
  onNavigateRoute,
}) => {
  const [currentUser, setCurrentUser] = useState<DwwaarUser>(user);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active Tab state: "projects" | "profile" | "plan" | "help"
  const getInitialTab = (): DashboardTab => {
    if (initialSubRoute.type === "profile") return "profile";
    if (initialSubRoute.type === "plan") return "plan";
    if (initialSubRoute.type === "help") return "help";
    return "projects";
  };

  const [activeTab, setActiveTab] = useState<DashboardTab>(getInitialTab());

  // Sub-route state: "list" | "new" | "edit"
  const [subRoute, setSubRoute] = useState<"list" | "new" | "edit">(
    initialSubRoute.type === "new" || initialSubRoute.type === "edit"
      ? initialSubRoute.type
      : "list"
  );
  const [editSlug, setEditSlug] = useState<string | undefined>(initialSubRoute.slug);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Share & QR Modal State (opens on QR click, Copy link click, and after save)
  const [shareModalProject, setShareModalProject] = useState<Project | null>(null);

  // Delete Confirmation Modal State
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Upgrade Modal State (When 2 project limit is reached)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Profile Form State
  const [profileName, setProfileName] = useState(currentUser.fullName || currentUser.name || "");
  const [profileMobile, setProfileMobile] = useState(currentUser.mobile || "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileErrors, setProfileErrors] = useState<{ name?: string; mobile?: string }>({});
  const [isSendingReset, setIsSendingReset] = useState(false);

  // Help FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Detect if we should use hash routing for public links (in case path routing is blocked in iframe)
  const isIframePreview = typeof window !== "undefined" && window.self !== window.top;

  // Extract first name for personalized greeting
  const firstName = (currentUser.fullName || currentUser.name || "Partner").trim().split(" ")[0];

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  // Keep local user in sync if prop changes
  useEffect(() => {
    setCurrentUser(user);
    setProfileName(user.fullName || user.name || "");
    setProfileMobile(user.mobile || "");
  }, [user]);

  // Subscribe to real-time Firestore updates for projects
  const loadProjects = () => {
    setLoading(true);
    setError(null);

    const unsubscribe = projectService.subscribeToUserProjects(
      currentUser.id,
      (fetchedProjects) => {
        setProjects(fetchedProjects);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore projects error:", err);
        setError("Failed to load your projects. Please check your connection or permissions.");
        setLoading(false);
      }
    );

    return unsubscribe;
  };

  useEffect(() => {
    const unsub = loadProjects();
    return () => unsub();
  }, [currentUser.id]);

  // Sync subRoute and activeTab if initialSubRoute prop changes
  useEffect(() => {
    if (initialSubRoute.type === "new" || initialSubRoute.type === "edit") {
      setSubRoute(initialSubRoute.type);
      setEditSlug(initialSubRoute.slug);
      setActiveTab("projects");
    } else if (initialSubRoute.type === "profile") {
      setActiveTab("profile");
      setSubRoute("list");
    } else if (initialSubRoute.type === "plan") {
      setActiveTab("plan");
      setSubRoute("list");
    } else if (initialSubRoute.type === "help") {
      setActiveTab("help");
      setSubRoute("list");
    } else {
      setActiveTab("projects");
      setSubRoute("list");
    }
  }, [initialSubRoute]);


  // Computed Stats from Real Firestore Data
  const totalProjects = projects.length;
  const totalViews = projects.reduce((acc, p) => acc + (p.views || 0), 0);
  const maxFreeLinks = 2;
  const linksUsedPercentage = Math.min(100, Math.round((totalProjects / maxFreeLinks) * 100));

  // Switch Tab Handler
  const handleTabSwitch = (tab: DashboardTab) => {
    setActiveTab(tab);
    setSubRoute("list");
    if (tab === "projects") {
      onNavigateRoute("/dashboard");
    } else {
      onNavigateRoute(`/dashboard/${tab}`);
    }
  };

  // Handle + New project click
  const handleNewProjectClick = () => {
    if (totalProjects >= maxFreeLinks) {
      setShowUpgradeModal(true);
      return;
    }
    onNavigateRoute("/dashboard/new");
    setSubRoute("new");
  };

  // Handle Edit project click
  const handleEditProjectClick = (slug: string) => {
    onNavigateRoute(`/dashboard/edit/${slug}`);
    setEditSlug(slug);
    setSubRoute("edit");
  };

  // Handle Available / Sold toggle directly on card
  const handleToggleStatus = async (project: Project) => {
    const newStatus = project.status === "available" ? "sold" : "available";
    try {
      await projectService.toggleProjectStatus(project.slug, newStatus);
      triggerToast(`Status changed to ${newStatus === "available" ? "Available" : "Sold Out"}`);
    } catch (err) {
      console.error("Failed to toggle status:", err);
      triggerToast("Failed to update status. Please try again.");
    }
  };

  // Handle Copy public link & open Share modal
  const handleCopyLink = async (project: Project) => {
    const url = projectService.getPublicUrl(project.slug);
    try {
      await copyTextSafely(url);
      triggerToast("Link copied to clipboard!");
    } catch (err: any) {
      console.error("Copy link error:", err);
      const errMsg = err?.message || "Permission denied";
      triggerToast(`Could not copy link: ${errMsg}`);
    }
    // As required: open the Share modal on Copy link action
    setShareModalProject(project);
  };

  // Handle Delete Confirmation
  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    try {
      await projectService.deleteProject(projectToDelete.slug);
      triggerToast("Project deleted successfully");
      setProjectToDelete(null);
    } catch (err) {
      console.error("Failed to delete project:", err);
      triggerToast("Could not delete project. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Profile: Mobile input sanitization (10 digits starting 6-9)
  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const digitsOnly = raw.replace(/\D/g, "");
    // If user pasted +91... or 91...
    let clean = digitsOnly;
    if (clean.length > 10 && clean.startsWith("91")) {
      clean = clean.slice(2);
    }
    const finalVal = clean.slice(0, 10);
    setProfileMobile(finalVal);
    if (profileErrors.mobile) {
      setProfileErrors((prev) => ({ ...prev, mobile: undefined }));
    }
  };

  // Profile: Save Changes Handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { name?: string; mobile?: string } = {};

    const cleanName = profileName.trim();
    if (cleanName.length < 2) {
      errors.name = "Full name must be at least 2 characters";
    }

    const cleanMobile = profileMobile.replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      errors.mobile = "Mobile number must be exactly 10 digits starting with 6-9";
    }

    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      return;
    }

    setIsSavingProfile(true);
    setProfileErrors({});
    try {
      const updated = await authService.updateUserProfile(currentUser.id, {
        fullName: cleanName,
        mobile: cleanMobile,
      });
      setCurrentUser(updated);
      triggerToast("Profile updated successfully");
    } catch (err: any) {
      console.error("Profile save error:", err);
      triggerToast(err.message || "Failed to update profile. Please try again.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Profile: Password Reset Email Handler
  const handleSendPasswordReset = async () => {
    if (isGoogleUser) return;
    setIsSendingReset(true);
    try {
      await authService.sendPasswordReset(currentUser.email);
      triggerToast(`Password reset link sent to ${currentUser.email}`);
    } catch (err: any) {
      console.error("Password reset error:", err);
      triggerToast(err.message || "Could not send reset email. Please try again.");
    } finally {
      setIsSendingReset(false);
    }
  };

  // Determine if Google authenticated
  const isGoogleUser = currentUser.provider === "google";

  // Format member since date
  const memberSinceFormatted = useMemo(() => {
    if (!currentUser.createdAt) return "Recent Member";
    try {
      const date = new Date(currentUser.createdAt);
      if (isNaN(date.getTime())) return "Recent Member";
      return `Member since ${date.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`;
    } catch {
      return "Recent Member";
    }
  }, [currentUser.createdAt]);

  // User Initial for avatar
  const userInitial = (currentUser.fullName || currentUser.name || currentUser.email || "D")
    .trim()[0]
    .toUpperCase();

  // FAQ Accordion items
  const faqs = [
    {
      q: "How do Dwwaar links replace PDF brochures?",
      a: "Instead of sending heavy 35MB PDFs that get saved locally and become outdated, you share a single, lightning-fast web link and QR code. You can update prices and unit availability anytime without re-sending anything.",
    },
    {
      q: "Where can I use my project's QR code?",
      a: "You can download the high-resolution vector QR code and print it anywhere: site hoardings, booth standees, visiting cards, sales lounge reception desks, and newspaper advertisements.",
    },
    {
      q: "What happens when I reach the Free plan limit of 2 projects?",
      a: "The Free plan allows you to create up to 2 active project smart links forever. To add more projects or manage an entire brokerage/builder portfolio, you can join the Dwwaar Pro waitlist.",
    },
    {
      q: "How fast do changes appear when I edit a project or toggle availability?",
      a: "All updates reflect instantly in real time. Anyone scanning the QR code or opening the smart link will immediately see the latest availability status, price revisions, and details.",
    },
  ];

  // =========================================================================
  // SUB-ROUTE SCREEN: /dashboard/new or /dashboard/edit/{slug}
  // =========================================================================
  if (subRoute === "new" || subRoute === "edit") {
    return (
      <div className="min-h-screen bg-[#FBF7F0] text-[#0A1530] flex flex-col p-4 sm:p-8 lg:p-12 relative">
        {/* Toast Notification Container */}
        {toastMessage && (
          <div className="fixed bottom-6 right-4 sm:right-6 z-50 bg-[#0A1530] text-[#F5EBDA] px-4 py-2.5 rounded-xl shadow-2xl border border-[#F6DDB0]/30 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="max-w-6xl mx-auto w-full">
          <ProjectForm
            mode={subRoute === "new" ? "create" : "edit"}
            slug={editSlug}
            currentUser={currentUser}
            currentProjectCount={totalProjects}
            onSuccess={() => {
              // Real-time listener handles project list update
            }}
            onCancel={() => {
              setSubRoute("list");
              onNavigateRoute("/dashboard");
            }}
            onShowUpgradeModal={() => setShowUpgradeModal(true)}
            onShowToast={triggerToast}
          />
        </div>

        {/* Upgrade Modal */}
        {showUpgradeModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#0A1530] text-[#F5EBDA] rounded-3xl max-w-md w-full p-7 sm:p-8 border border-[#F6DDB0]/35 shadow-2xl relative text-center">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="absolute top-4 right-4 text-[#F5EBDA]/60 hover:text-white p-1"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-[#152349] text-[#F6DDB0] flex items-center justify-center mx-auto mb-4 border border-[#F6DDB0]/25">
                <Sparkles className="w-6 h-6" />
              </div>

              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0A1530] bg-[#F6DDB0] px-2.5 py-0.5 rounded-md">
                Pro is coming soon
              </span>

              <h3 className="text-2xl font-extrabold tracking-tight mt-3 text-[#F5EBDA]">
                You've reached the Free Limit
              </h3>

              <p className="text-xs sm:text-sm text-[#F5EBDA]/80 mt-2 leading-relaxed font-normal">
                You are currently using 2 of 2 smart links on the Free plan. The Pro tier with unlimited links, view analytics, and multi-broker routing will launch shortly.
              </p>

              <div className="mt-6 pt-5 border-t border-[#F5EBDA]/10 space-y-3">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[#F5EBDA] text-[#0A1530] font-bold text-xs hover:bg-[#F6DDB0] transition-colors shadow-md min-h-[44px]"
                >
                  <MessageCircle className="w-4 h-4 text-[#0A1530] fill-current" />
                  <span>Contact Founder on WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={() => setShowUpgradeModal(false)}
                  className="w-full text-xs text-[#F5EBDA]/60 hover:text-white font-medium py-1"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // MAIN DASHBOARD LAYOUT
  // Desktop Sidebar + Mobile Top Bar + Mobile Slim Bottom Tab Bar
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#FBF7F0] text-[#0A1530] flex flex-col lg:flex-row selection:bg-[#F6DDB0] selection:text-[#0A1530]">
      
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-50 bg-[#0A1530] text-[#F5EBDA] px-4 py-2.5 rounded-xl shadow-2xl border border-[#F6DDB0]/30 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =================================================================== */}
      {/* 1. DESKTOP SIDEBAR (Fixed left, Dwwaar theme)                         */}
      {/* Items: Projects, Profile, Plan, Help. Logo top, Logout bottom.       */}
      {/* =================================================================== */}
      <aside className="hidden lg:flex w-64 bg-[#0A1530] text-[#F5EBDA] flex-col justify-between p-6 shrink-0 border-r border-[#F6DDB0]/15 sticky top-0 h-screen">
        <div>
          {/* Logo + Brand Wordmark */}
          <div className="flex items-center gap-3 pb-6 border-b border-[#F5EBDA]/10 mb-6">
            <button
              onClick={() => handleTabSwitch("projects")}
              className="flex items-center gap-2.5 focus:outline-none group text-left"
              title="Dwwaar Dashboard"
            >
              <img
                src={LOGO_PATH}
                alt="Dwwaar Emblem"
                className="w-10 h-10 rounded-full object-cover border border-[#F6DDB0]/40 group-hover:scale-105 transition-transform"
              />
              <div>
                <span className="text-xl font-extrabold tracking-tight text-[#F5EBDA] block leading-tight">
                  Dwwaar
                </span>
                <span className="text-[10px] text-[#F6DDB0]/80 font-medium">
                  Real Estate Smart Links
                </span>
              </div>
            </button>
          </div>

          {/* Navigation Links: Projects, Profile, Plan, Help */}
          <nav className="space-y-1.5" aria-label="Main Navigation">
            {/* 1. Projects */}
            <button
              type="button"
              onClick={() => handleTabSwitch("projects")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all text-left ${
                activeTab === "projects"
                  ? "bg-[#142347] text-[#F6DDB0] font-bold border border-[#F6DDB0]/25 shadow-xs"
                  : "text-[#F5EBDA]/75 hover:text-[#F5EBDA] hover:bg-white/5"
              }`}
            >
              <Building2 className={`w-4 h-4 ${activeTab === "projects" ? "text-[#F6DDB0]" : "text-[#F5EBDA]/60"}`} />
              <span>Projects</span>
            </button>

            {/* 2. Profile */}
            <button
              type="button"
              onClick={() => handleTabSwitch("profile")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all text-left ${
                activeTab === "profile"
                  ? "bg-[#142347] text-[#F6DDB0] font-bold border border-[#F6DDB0]/25 shadow-xs"
                  : "text-[#F5EBDA]/75 hover:text-[#F5EBDA] hover:bg-white/5"
              }`}
            >
              <User className={`w-4 h-4 ${activeTab === "profile" ? "text-[#F6DDB0]" : "text-[#F5EBDA]/60"}`} />
              <span>Profile</span>
            </button>

            {/* 3. Plan */}
            <button
              type="button"
              onClick={() => handleTabSwitch("plan")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all text-left ${
                activeTab === "plan"
                  ? "bg-[#142347] text-[#F6DDB0] font-bold border border-[#F6DDB0]/25 shadow-xs"
                  : "text-[#F5EBDA]/75 hover:text-[#F5EBDA] hover:bg-white/5"
              }`}
            >
              <Sparkles className={`w-4 h-4 ${activeTab === "plan" ? "text-[#F6DDB0]" : "text-[#F5EBDA]/60"}`} />
              <span>Plan</span>
            </button>

            {/* 4. Help */}
            <button
              type="button"
              onClick={() => handleTabSwitch("help")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all text-left ${
                activeTab === "help"
                  ? "bg-[#142347] text-[#F6DDB0] font-bold border border-[#F6DDB0]/25 shadow-xs"
                  : "text-[#F5EBDA]/75 hover:text-[#F5EBDA] hover:bg-white/5"
              }`}
            >
              <HelpCircle className={`w-4 h-4 ${activeTab === "help" ? "text-[#F6DDB0]" : "text-[#F5EBDA]/60"}`} />
              <span>Help</span>
            </button>
          </nav>
        </div>

        {/* Bottom: Logout */}
        <div className="pt-4 border-t border-[#F5EBDA]/10">
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center justify-between gap-3 p-3 rounded-xl bg-[#132349]/70 hover:bg-rose-500/15 border border-[#F5EBDA]/10 hover:border-rose-400/30 text-rose-300 hover:text-white transition-all text-left group"
            title="Log out of Dwwaar"
          >
            <div className="flex items-center gap-2.5 truncate">
              <LogOut className="w-4 h-4 text-rose-300 group-hover:scale-105 transition-transform" />
              <span className="font-semibold text-xs">Log Out</span>
            </div>
            <span className="text-[10px] text-[#F5EBDA]/40 group-hover:text-rose-200 uppercase font-mono">
              Exit
            </span>
          </button>
        </div>
      </aside>

      {/* =================================================================== */}
      {/* 2. MOBILE TOP BAR (clean, slim header for < 1024px)                  */}
      {/* =================================================================== */}
      <header className="lg:hidden bg-[#0A1530] text-[#F5EBDA] px-4 py-3 flex items-center justify-between border-b border-[#F6DDB0]/15 sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <img src={LOGO_PATH} alt="Dwwaar" className="w-8 h-8 rounded-full object-cover" />
          <div>
            <span className="font-extrabold text-base tracking-tight block leading-tight">Dwwaar</span>
            <span className="text-[10px] text-[#F6DDB0]/80 font-medium capitalize">
              {activeTab}
            </span>
          </div>
        </div>

        {/* User Initial Circle */}
        <button
          type="button"
          onClick={() => handleTabSwitch("profile")}
          className="w-8 h-8 rounded-full bg-[#142347] border border-[#F6DDB0]/30 text-[#F6DDB0] flex items-center justify-center font-bold text-xs"
          title="Go to Profile"
        >
          {userInitial}
        </button>
      </header>

      {/* =================================================================== */}
      {/* 3. MAIN CONTENT CONTAINER (Extra bottom padding for mobile bar)      */}
      {/* =================================================================== */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-10 w-full pb-28 lg:pb-12">
        
        {/* ================================================================= */}
        {/* VIEW 1: PROJECTS TAB                                              */}
        {/* ================================================================= */}
        {activeTab === "projects" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Top Header: Greeting & "+ New project" Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0A1530]">
                  Namaste, {firstName}
                </h1>
                <p className="text-xs sm:text-sm text-[#0A1530]/70 mt-1 font-normal">
                  Manage your real estate project smart links and print QR pages.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleNewProjectClick}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0A1530] text-[#F5EBDA] font-bold text-xs sm:text-sm hover:bg-[#14234d] border border-[#F6DDB0]/30 shadow-sm active:scale-[0.98] transition-all min-h-[44px]"
                >
                  <Plus className="w-4 h-4 text-[#F6DDB0]" />
                  <span>+ New project</span>
                </button>
              </div>
            </div>

            {/* 3 Stat Cards (Computed from Real Firestore Data) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              {/* Stat 1: Total projects */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#0A1530]/8 shadow-xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#0A1530]/60 mb-1">
                  Total Projects
                </div>
                <div className="text-3xl font-extrabold text-[#0A1530] tabular-nums">
                  {loading ? "..." : totalProjects}
                </div>
                <p className="text-[11px] text-[#0A1530]/65 mt-1.5">
                  Live smart links published
                </p>
              </div>

              {/* Stat 2: Total views */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#0A1530]/8 shadow-xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#0A1530]/60 mb-1">
                  Total Views
                </div>
                <div className="text-3xl font-extrabold text-[#0A1530] tabular-nums">
                  {loading ? "..." : totalViews}
                </div>
                <p className="text-[11px] text-[#0A1530]/65 mt-1.5">
                  Inbound prospect page views
                </p>
              </div>

              {/* Stat 3: Plan (Free, progress bar) */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#0A1530]/8 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#0A1530]/60 mb-1">
                    <span>Plan</span>
                    <span className="text-[#0A1530] font-bold lowercase bg-[#F5EBDA] px-2 py-0.5 rounded-md">
                      Free
                    </span>
                  </div>
                  <div className="text-sm font-bold text-[#0A1530] mt-1">
                    {totalProjects} / {maxFreeLinks} links used
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="w-full h-2 bg-[#F5EBDA] rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        totalProjects >= maxFreeLinks ? "bg-amber-500" : "bg-[#0A1530]"
                      }`}
                      style={{ width: `${linksUsedPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section Heading */}
            <div className="flex items-center justify-between pt-2">
              <h2 className="text-lg font-bold text-[#0A1530] tracking-tight">
                Your Project Smart Links
              </h2>
              <span className="text-xs text-[#0A1530]/60">
                Realtime sync with Firestore
              </span>
            </div>

            {/* PROJECTS SECTION: Skeleton / Error / Empty State / Project Cards */}
            {/* 1. SKELETON LOADER */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl p-6 border border-[#0A1530]/8 shadow-xs animate-pulse space-y-4"
                  >
                    <div className="w-full h-36 bg-gray-200 rounded-xl" />
                    <div className="h-5 bg-gray-200 rounded w-2/3" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-10 bg-gray-100 rounded-xl" />
                  </div>
                ))}
              </div>
            )}

            {/* 2. ERROR STATE WITH RETRY */}
            {!loading && error && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center text-rose-800 space-y-3">
                <AlertTriangle className="w-8 h-8 mx-auto text-rose-600" />
                <h3 className="font-bold text-base">Error Loading Projects</h3>
                <p className="text-xs sm:text-sm text-rose-700 max-w-md mx-auto">
                  {error}
                </p>
                <button
                  type="button"
                  onClick={loadProjects}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-colors shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry</span>
                </button>
              </div>
            )}

            {/* 3. REAL EMPTY STATE */}
            {!loading && !error && projects.length === 0 && (
              <div className="rounded-3xl border-2 border-dashed border-[#0A1530]/15 p-10 sm:p-14 text-center bg-white/60">
                <div className="w-14 h-14 rounded-2xl bg-[#F5EBDA] text-[#0A1530] flex items-center justify-center mx-auto mb-4 border border-[#0A1530]/10 shadow-xs">
                  <Building2 className="w-7 h-7" />
                </div>

                <h3 className="text-xl font-bold text-[#0A1530] tracking-tight mb-2">
                  Create your first smart link
                </h3>

                <p className="text-xs sm:text-sm text-[#0A1530]/75 max-w-md mx-auto mb-6 leading-relaxed">
                  Replace 35MB PDF brochures with a blazing-fast project link and print-ready QR code. Real buyers, zero download friction.
                </p>

                <button
                  type="button"
                  onClick={handleNewProjectClick}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#0A1530] text-[#F5EBDA] font-bold text-sm hover:bg-[#14234d] border border-[#F6DDB0]/30 shadow-md active:scale-[0.98] transition-all"
                >
                  <Plus className="w-4 h-4 text-[#F6DDB0]" />
                  <span>+ Create First Smart Link</span>
                </button>
              </div>
            )}

            {/* 4. REAL PROJECT CARDS GRID */}
            {!loading && !error && projects.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((project) => {
                  const publicUrl = projectService.getPublicUrl(project.slug);
                  const isAvailable = project.status === "available";

                  return (
                    <div
                      key={project.id}
                      className="bg-white rounded-2xl border border-[#0A1530]/10 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
                    >
                      <div>
                        {/* Neutral arch placeholder matching Dwwaar arch logo (No photos) */}
                        <div className="relative h-40 bg-gradient-to-br from-[#0A1530] via-[#0E1C3E] to-[#15244c] flex items-center justify-center overflow-hidden">
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(246,221,176,0.2)_0%,transparent_70%)]" />
                          <div className="flex flex-col items-center justify-center text-[#F5EBDA]/70 select-none relative z-0">
                            <div className="w-20 h-24 rounded-t-full border-2 border-[#F6DDB0]/30 bg-[#0E1B38]/80 flex items-center justify-center relative shadow-inner">
                              <Building2 className="w-6 h-6 text-[#F6DDB0]/80" />
                            </div>
                            <span className="text-[10px] mt-2 font-medium tracking-wide uppercase text-[#F6DDB0]/70">
                              Dwwaar Smart Link
                            </span>
                          </div>

                          {/* Top Tag: Available / Sold toggle chip */}
                          <div className="absolute top-3 left-3 z-10">
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(project)}
                              title="Click to toggle status in real-time"
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer ${
                                isAvailable
                                  ? "bg-emerald-500 text-white hover:bg-emerald-600"
                                  : "bg-rose-600 text-white hover:bg-rose-700"
                              }`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  isAvailable ? "bg-white animate-pulse" : "bg-white/80"
                                }`}
                              />
                              <span>{isAvailable ? "Available" : "Sold Out"}</span>
                            </button>
                          </div>

                          {/* Top Right: Views badge */}
                          <div className="absolute top-3 right-3 z-10 bg-black/60 backdrop-blur-xs text-white px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5 text-[#F6DDB0]" />
                            <span>{project.views || 0} views</span>
                          </div>
                        </div>

                        {/* Project Info */}
                        <div className="p-5">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-extrabold text-lg text-[#0A1530] tracking-tight group-hover:text-[#183272] transition-colors">
                                {project.name}
                              </h3>
                              {project.builder && (
                                <p className="text-[11px] text-[#0A1530]/70 font-semibold mt-0.5">
                                  by {project.builder}
                                </p>
                              )}
                              <p className="text-xs text-[#0A1530]/65 mt-0.5 flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-[#0A1530]/50 shrink-0" />
                                <span>{project.location}</span>
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-extrabold text-[#0A1530] block">
                                {formatProjectPrice(project.price, project.priceUnit)}
                              </span>
                              {project.rera && (
                                <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded inline-block mt-0.5">
                                  RERA
                                </span>
                              )}
                            </div>
                          </div>

                          {/* BHK and Carpet Area chips */}
                          {((project.bhk && project.bhk.length > 0) || project.carpetArea) && (
                            <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2.5 border-t border-[#0A1530]/6">
                              {project.bhk?.map((b, i) => (
                                <span
                                  key={i}
                                  className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#0A1530]/5 text-[#0A1530]"
                                >
                                  {b}
                                </span>
                              ))}
                              {project.carpetArea && (
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#0A1530]/5 text-[#0A1530]/75">
                                  {project.carpetArea} sq.ft
                                </span>
                              )}
                            </div>
                          )}

                          {/* Public URL display (Without "View page" button) */}
                          <div className="mt-3.5 p-2 rounded-xl bg-[#FBF7F0] border border-[#0A1530]/8 flex items-center justify-between text-xs font-mono text-[#0A1530]/80">
                            <span className="truncate pr-2 select-all">{publicUrl}</span>
                            <button
                              type="button"
                              onClick={() => handleCopyLink(project)}
                              className="text-[#0A1530]/60 hover:text-[#0A1530] p-1 rounded hover:bg-white cursor-pointer"
                              title="Copy link and open share options"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Card Actions Footer */}
                      <div className="px-5 py-3.5 bg-gray-50/80 border-t border-[#0A1530]/8 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopyLink(project)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#0A1530]/15 text-xs font-bold text-[#0A1530] hover:bg-[#F5EBDA] transition-colors cursor-pointer"
                            title="Copy link and open share modal"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy link</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setShareModalProject(project)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#0A1530]/15 text-xs font-bold text-[#0A1530] hover:bg-[#F5EBDA] transition-colors cursor-pointer"
                            title="Open QR Code and Share"
                          >
                            <QrIcon className="w-3.5 h-3.5" />
                            <span>QR Code</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleEditProjectClick(project.slug)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-[#0A1530] hover:bg-white transition-colors"
                            title="Edit project"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setProjectToDelete(project)}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                            title="Delete project"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* VIEW 2: PROFILE PAGE (Real Firebase Data)                          */}
        {/* ================================================================= */}
        {activeTab === "profile" && (
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
            {/* Page Header */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0A1530]">
                Account & Profile
              </h1>
              <p className="text-xs sm:text-sm text-[#0A1530]/70 mt-1">
                Manage your builder identity, verified contact number, and credentials.
              </p>
            </div>

            {/* Profile Overview Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#0A1530]/10 shadow-xs">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                {/* Avatar with User's Initial */}
                <div className="w-20 h-20 rounded-full bg-[#0A1530] text-[#F5EBDA] border-2 border-[#F6DDB0] flex items-center justify-center font-extrabold text-3xl shadow-sm shrink-0">
                  {userInitial}
                </div>

                <div className="flex-1 text-center sm:text-left space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <h2 className="text-xl font-bold text-[#0A1530]">
                      {currentUser.fullName || currentUser.name || "Dwwaar Partner"}
                    </h2>
                    {isGoogleUser && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 self-center sm:self-auto">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                        Signed in with Google
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-[#0A1530]/65 font-mono">
                    {currentUser.email}
                  </p>

                  <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-[#0A1530]/55 pt-1">
                    <Calendar className="w-3.5 h-3.5 text-[#0A1530]/40" />
                    <span>{memberSinceFormatted}</span>
                  </div>
                </div>
              </div>

              {/* Edit Details Form */}
              <form onSubmit={handleSaveProfile} className="mt-8 pt-6 border-t border-[#0A1530]/8 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A1530]/70 mb-3">
                  Personal Details
                </h3>

                {/* Full Name Field */}
                <div>
                  <label htmlFor="profile-fullname" className="block text-xs font-bold text-[#0A1530] mb-1">
                    Full Name *
                  </label>
                  <input
                    id="profile-fullname"
                    type="text"
                    value={profileName}
                    onChange={(e) => {
                      setProfileName(e.target.value);
                      if (profileErrors.name) setProfileErrors((p) => ({ ...p, name: undefined }));
                    }}
                    placeholder="Enter your full name"
                    className={`w-full h-11 px-3.5 rounded-xl bg-[#FBF7F0] border text-sm text-[#0A1530] font-medium outline-none focus:ring-2 ${
                      profileErrors.name
                        ? "border-rose-500 focus:ring-rose-200"
                        : "border-[#0A1530]/15 focus:ring-[#0A1530]/20"
                    }`}
                  />
                  {profileErrors.name && (
                    <p className="text-xs text-rose-600 font-medium mt-1">{profileErrors.name}</p>
                  )}
                </div>

                {/* Mobile Number Field (Fixed +91, 10 digits starting 6-9) */}
                <div>
                  <label htmlFor="profile-mobile" className="block text-xs font-bold text-[#0A1530] mb-1">
                    Mobile Number (WhatsApp) *
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-xs font-bold text-[#0A1530]/60 select-none">
                      +91
                    </span>
                    <input
                      id="profile-mobile"
                      type="tel"
                      value={profileMobile}
                      onChange={handleMobileChange}
                      placeholder="9876543210"
                      maxLength={10}
                      className={`w-full h-11 pl-12 pr-3.5 rounded-xl bg-[#FBF7F0] border text-sm text-[#0A1530] font-medium outline-none focus:ring-2 font-mono ${
                        profileErrors.mobile
                          ? "border-rose-500 focus:ring-rose-200"
                          : "border-[#0A1530]/15 focus:ring-[#0A1530]/20"
                      }`}
                    />
                  </div>
                  {profileErrors.mobile ? (
                    <p className="text-xs text-rose-600 font-medium mt-1">{profileErrors.mobile}</p>
                  ) : (
                    <p className="text-[11px] text-[#0A1530]/50 mt-1">
                      10 digits starting with 6, 7, 8, or 9. Used for prospective buyer routing.
                    </p>
                  )}
                </div>

                {/* Email (Read-Only) */}
                <div>
                  <label className="block text-xs font-bold text-[#0A1530] mb-1">
                    Email Address <span className="text-[11px] font-normal text-[#0A1530]/50">(Read-only)</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="email"
                      readOnly
                      disabled
                      value={currentUser.email}
                      className="w-full h-11 px-3.5 rounded-xl bg-gray-100 border border-gray-200 text-sm text-[#0A1530]/60 font-mono cursor-not-allowed select-none"
                    />
                    <Lock className="w-4 h-4 text-gray-400 absolute right-3.5" />
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#0A1530] text-[#F5EBDA] font-bold text-xs sm:text-sm hover:bg-[#14234d] disabled:opacity-50 transition-all shadow-sm flex items-center justify-center gap-2 min-h-[44px]"
                  >
                    {isSavingProfile ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-[#F6DDB0]" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 text-[#F6DDB0]" />
                        <span>Save Profile Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Password Reset Card (Only for email/password users, hidden for Google users) */}
            {!isGoogleUser && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#0A1530]/10 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-sm text-[#0A1530]">Change Password</h3>
                  <p className="text-xs text-[#0A1530]/65 mt-0.5">
                    We will send a secure password reset link to <span className="font-mono text-[#0A1530] font-semibold">{currentUser.email}</span>.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSendPasswordReset}
                  disabled={isSendingReset}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#0A1530]/20 bg-[#FBF7F0] text-[#0A1530] font-bold text-xs hover:bg-[#F5EBDA] transition-colors shadow-xs flex items-center justify-center gap-2 min-h-[44px] shrink-0"
                >
                  <KeyRound className="w-4 h-4 text-[#0A1530]/70" />
                  <span>{isSendingReset ? "Sending Link..." : "Change password"}</span>
                </button>
              </div>
            )}

            {/* Logout Card */}
            <div className="bg-white rounded-3xl p-6 border border-rose-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-sm text-rose-800">Account Session</h3>
                <p className="text-xs text-rose-700/70 mt-0.5">
                  Sign out of your Dwwaar dashboard on this browser session.
                </p>
              </div>

              <button
                type="button"
                onClick={onLogout}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-600 hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 min-h-[44px] shrink-0"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* VIEW 3: PLAN PAGE (Real Data)                                      */}
        {/* ================================================================= */}
        {activeTab === "plan" && (
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
            {/* Page Header */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0A1530]">
                Subscription & Usage
              </h1>
              <p className="text-xs sm:text-sm text-[#0A1530]/70 mt-1">
                Monitor your project link allocation and explore upcoming Pro features.
              </p>
            </div>

            {/* Current Plan Card (Free) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#0A1530]/10 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                    Current Active Plan
                  </span>
                  <h2 className="text-2xl font-extrabold text-[#0A1530] mt-1.5">Free Plan</h2>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-black text-[#0A1530]">₹0</span>
                  <span className="text-xs text-[#0A1530]/50 block">Forever free</span>
                </div>
              </div>

              {/* Progress Bar with Real Data */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#0A1530]">
                  <span>Link Allocation</span>
                  <span className="font-mono">{totalProjects} / {maxFreeLinks} links used</span>
                </div>
                <div className="w-full h-3 bg-[#F5EBDA] rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      totalProjects >= maxFreeLinks ? "bg-amber-500" : "bg-[#0A1530]"
                    }`}
                    style={{ width: `${linksUsedPercentage}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#0A1530]/60">
                  {totalProjects >= maxFreeLinks
                    ? "You have utilized all 2 smart links on your free tier."
                    : `You have ${maxFreeLinks - totalProjects} project link slot remaining.`}
                </p>
              </div>

              {/* What's Included */}
              <div className="pt-4 border-t border-[#0A1530]/8 space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A1530]/70">
                  Included in Free Plan
                </h3>
                <ul className="text-xs text-[#0A1530]/80 space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Up to 2 active project smart links</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Print-ready vector QR code generation (PNG)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Live Available / Sold inventory toggle</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Instant mobile speed with zero PDF downloads</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Pro Card (Coming Soon) */}
            <div className="bg-[#0A1530] text-[#F5EBDA] rounded-3xl p-6 sm:p-8 border border-[#F6DDB0]/35 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_top_right,rgba(246,221,176,0.15)_0%,transparent_70%)] pointer-events-none" />

              <div className="relative space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-[#142347] border border-[#F6DDB0]/25 flex items-center justify-center text-[#F6DDB0]">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-extrabold text-[#F5EBDA] tracking-tight">Dwwaar Pro</h2>
                      <span className="text-[10px] text-[#F6DDB0] font-medium tracking-wide">
                        For Developer Sales Teams & Large Brokerages
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0A1530] bg-[#F6DDB0] px-2.5 py-1 rounded-md shadow-xs shrink-0">
                    Coming soon
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#F5EBDA]/80 leading-relaxed font-normal">
                  Scale your property marketing with unlimited smart links, live unit inventory, and deep prospect engagement metrics.
                </p>

                {/* Pro Feature Highlights */}
                <div className="space-y-2.5 pt-2 border-t border-[#F5EBDA]/10">
                  <ul className="text-xs text-[#F5EBDA]/90 space-y-2">
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-[#F6DDB0] shrink-0" />
                      <span className="font-semibold text-white">Unlimited project links & QR codes</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-[#F6DDB0] shrink-0" />
                      <span className="font-semibold text-white">Live availability updates & multi-tower unit inventory</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-[#F6DDB0] shrink-0" />
                      <span className="font-semibold text-white">Real-time prospect view tracking & engagement analytics</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-[#F6DDB0] shrink-0" />
                      <span>Custom project subdomains & branded URL links</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-[#F6DDB0] shrink-0" />
                      <span>Direct founder priority onboarding</span>
                    </li>
                  </ul>
                </div>

                {/* Get Notified on WhatsApp CTA */}
                <div className="pt-3">
                  <a
                    href="https://wa.me/917378633612?text=Hi%2C%20I%20want%20to%20know%20about%20Dwwaar%20Pro."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#25D366] text-white font-bold text-xs sm:text-sm hover:bg-[#20BD5A] transition-all shadow-md min-h-[44px]"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>Get notified on WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* VIEW 4: HELP PAGE (Support Cards & Short FAQ Accordion)           */}
        {/* ================================================================= */}
        {activeTab === "help" && (
          <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-200">
            {/* Page Header */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0A1530]">
                Help & Support
              </h1>
              <p className="text-xs sm:text-sm text-[#0A1530]/70 mt-1">
                Have questions or need assistance? Reach out directly or check the FAQ.
              </p>
            </div>

            {/* Two Clean Support Cards: WhatsApp & Instagram */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card 1: WhatsApp */}
              <div className="bg-white rounded-3xl p-6 border border-[#0A1530]/10 shadow-xs flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#25D366]/10 text-[#25D366] flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 fill-current" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                      WhatsApp only
                    </span>
                  </div>
                  <h3 className="font-extrabold text-base text-[#0A1530]">WhatsApp Support</h3>
                  <p className="text-xs text-[#0A1530]/65 mt-1 font-mono">
                    +91 73786 33612
                  </p>
                  <p className="text-xs text-[#0A1530]/75 mt-2 leading-relaxed">
                    Fast direct support for link setups, broker onboarding, and project questions.
                  </p>
                </div>

                <a
                  href="https://wa.me/917378633612"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] text-white font-bold text-xs hover:bg-[#20BD5A] transition-colors shadow-xs min-h-[44px]"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Message on WhatsApp</span>
                </a>
              </div>

              {/* Card 2: Instagram */}
              <div className="bg-white rounded-3xl p-6 border border-[#0A1530]/10 shadow-xs flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center">
                      <Instagram className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-md font-mono">
                      @_flx.saud
                    </span>
                  </div>
                  <h3 className="font-extrabold text-base text-[#0A1530]">Instagram</h3>
                  <p className="text-xs text-[#0A1530]/65 mt-1 font-mono">
                    @_flx.saud
                  </p>
                  <p className="text-xs text-[#0A1530]/75 mt-2 leading-relaxed">
                    Follow founder product updates, real estate marketing insights, and releases.
                  </p>
                </div>

                <a
                  href="https://instagram.com/_flx.saud"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0A1530] text-[#F5EBDA] font-bold text-xs hover:bg-[#14234d] transition-colors shadow-xs min-h-[44px]"
                >
                  <Instagram className="w-4 h-4" />
                  <span>Follow on Instagram</span>
                </a>
              </div>
            </div>

            {/* Short FAQ Accordion (4 questions) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#0A1530]/10 shadow-xs space-y-4">
              <div>
                <h3 className="font-extrabold text-lg text-[#0A1530] tracking-tight">
                  Frequently Asked Questions
                </h3>
                <p className="text-xs text-[#0A1530]/65 mt-0.5">
                  Clear answers about links, QR codes, and managing your projects.
                </p>
              </div>

              <div className="divide-y divide-[#0A1530]/8 pt-2">
                {faqs.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div key={idx} className="py-3.5">
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        aria-expanded={isOpen}
                        className="w-full flex items-center justify-between text-left gap-3 focus:outline-none group"
                      >
                        <span className="font-bold text-xs sm:text-sm text-[#0A1530] group-hover:text-[#19326f] transition-colors">
                          {faq.q}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-[#0A1530]/60 shrink-0 transition-transform duration-200 ${
                            isOpen ? "rotate-180 text-[#0A1530]" : ""
                          }`}
                        />
                      </button>

                      {isOpen && (
                        <p className="text-xs text-[#0A1530]/75 mt-2 leading-relaxed pr-6 animate-in fade-in duration-150">
                          {faq.a}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* =================================================================== */}
      {/* 4. SLIM MOBILE BOTTOM TAB BAR (< 1024px)                             */}
      {/* 4 tabs: Projects, Profile, Plan, Help. Active item highlighted.      */}
      {/* =================================================================== */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0A1530] text-[#F5EBDA] border-t border-[#F6DDB0]/15 flex items-center justify-around py-2 px-1 backdrop-blur-md shadow-2xl safe-area-pb"
        aria-label="Mobile Navigation"
      >
        {/* Projects Tab */}
        <button
          type="button"
          onClick={() => handleTabSwitch("projects")}
          className={`flex-1 min-h-[44px] flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            activeTab === "projects"
              ? "text-[#F6DDB0] font-bold"
              : "text-[#F5EBDA]/60 hover:text-[#F5EBDA]"
          }`}
          aria-current={activeTab === "projects" ? "page" : undefined}
        >
          <Building2 className={`w-4 h-4 ${activeTab === "projects" ? "text-[#F6DDB0]" : "text-[#F5EBDA]/60"}`} />
          <span className="text-[10px] mt-1 font-medium tracking-tight">Projects</span>
        </button>

        {/* Profile Tab */}
        <button
          type="button"
          onClick={() => handleTabSwitch("profile")}
          className={`flex-1 min-h-[44px] flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            activeTab === "profile"
              ? "text-[#F6DDB0] font-bold"
              : "text-[#F5EBDA]/60 hover:text-[#F5EBDA]"
          }`}
          aria-current={activeTab === "profile" ? "page" : undefined}
        >
          <User className={`w-4 h-4 ${activeTab === "profile" ? "text-[#F6DDB0]" : "text-[#F5EBDA]/60"}`} />
          <span className="text-[10px] mt-1 font-medium tracking-tight">Profile</span>
        </button>

        {/* Plan Tab */}
        <button
          type="button"
          onClick={() => handleTabSwitch("plan")}
          className={`flex-1 min-h-[44px] flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            activeTab === "plan"
              ? "text-[#F6DDB0] font-bold"
              : "text-[#F5EBDA]/60 hover:text-[#F5EBDA]"
          }`}
          aria-current={activeTab === "plan" ? "page" : undefined}
        >
          <Sparkles className={`w-4 h-4 ${activeTab === "plan" ? "text-[#F6DDB0]" : "text-[#F5EBDA]/60"}`} />
          <span className="text-[10px] mt-1 font-medium tracking-tight">Plan</span>
        </button>

        {/* Help Tab */}
        <button
          type="button"
          onClick={() => handleTabSwitch("help")}
          className={`flex-1 min-h-[44px] flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            activeTab === "help"
              ? "text-[#F6DDB0] font-bold"
              : "text-[#F5EBDA]/60 hover:text-[#F5EBDA]"
          }`}
          aria-current={activeTab === "help" ? "page" : undefined}
        >
          <HelpCircle className={`w-4 h-4 ${activeTab === "help" ? "text-[#F6DDB0]" : "text-[#F5EBDA]/60"}`} />
          <span className="text-[10px] mt-1 font-medium tracking-tight">Help</span>
        </button>
      </nav>

      {/* =================================================================== */}
      {/* MODAL 1: QR CODE MODAL (PNG download & copy link)                   */}
      {/* =================================================================== */}
      {/* MODAL 1: SHARE & QR CODE MODAL                                      */}
      {/* =================================================================== */}
      <ShareModal
        project={shareModalProject}
        isOpen={!!shareModalProject}
        onClose={() => setShareModalProject(null)}
        onShowToast={triggerToast}
      />

      {/* =================================================================== */}
      {/* MODAL 2: DELETE CONFIRMATION MODAL                                  */}
      {/* =================================================================== */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border border-rose-200 shadow-2xl relative text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-[#0A1530] tracking-tight">
              Delete Project?
            </h3>

            <p className="text-xs text-[#0A1530]/75 mt-1.5 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-[#0A1530]">{projectToDelete.name}</span>? This will permanently remove the smart link and deactivate the QR code.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setProjectToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 text-[#0A1530] font-semibold text-xs hover:bg-gray-200"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDeleteProject}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 disabled:opacity-50 flex items-center justify-center gap-1"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 3: UPGRADE MODAL ("Pro is coming soon")                        */}
      {/* =================================================================== */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0A1530] text-[#F5EBDA] rounded-3xl max-w-md w-full p-7 sm:p-8 border border-[#F6DDB0]/35 shadow-2xl relative text-center">
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-4 right-4 text-[#F5EBDA]/60 hover:text-white p-1"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-[#152349] text-[#F6DDB0] flex items-center justify-center mx-auto mb-4 border border-[#F6DDB0]/25">
              <Sparkles className="w-6 h-6" />
            </div>

            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0A1530] bg-[#F6DDB0] px-2.5 py-0.5 rounded-md">
              Pro is coming soon
            </span>

            <h3 className="text-2xl font-extrabold tracking-tight mt-3 text-[#F5EBDA]">
              You've reached the Free Limit
            </h3>

            <p className="text-xs sm:text-sm text-[#F5EBDA]/80 mt-2 leading-relaxed font-normal">
              You are currently using 2 of 2 smart links on the Free plan. The Pro tier with unlimited links, view analytics, and multi-broker routing will launch shortly.
            </p>

            <div className="mt-6 pt-5 border-t border-[#F5EBDA]/10 space-y-3">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[#F5EBDA] text-[#0A1530] font-bold text-xs hover:bg-[#F6DDB0] transition-colors shadow-md min-h-[44px]"
              >
                <MessageCircle className="w-4 h-4 text-[#0A1530] fill-current" />
                <span>Contact Founder on WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="w-full text-xs text-[#F5EBDA]/60 hover:text-white font-medium py-1"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
