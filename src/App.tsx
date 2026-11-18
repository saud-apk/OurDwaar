/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "./components/Navbar.tsx";
import { Hero } from "./components/Hero.tsx";
import { ProblemSection } from "./components/ProblemSection.tsx";
import { ComparisonSection } from "./components/ComparisonSection.tsx";
import { HowItWorks } from "./components/HowItWorks.tsx";
import { FeaturesSection } from "./components/FeaturesSection.tsx";
import { PricingSection } from "./components/PricingSection.tsx";
import { FaqSection } from "./components/FaqSection.tsx";
import { CtaBand } from "./components/CtaBand.tsx";
import { Footer } from "./components/Footer.tsx";
import { AuthPage } from "./components/AuthPage.tsx";
import { Dashboard } from "./components/Dashboard.tsx";
import { PublicProjectPage } from "./components/PublicProjectPage.tsx";
import { DwwaarUser, authService } from "./services/authService.ts";

export default function App() {
  const [currentUser, setCurrentUser] = useState<DwwaarUser | null>(() => {
    return authService.getCurrentUser();
  });

  const [currentPage, setCurrentPage] = useState<"landing" | "auth" | "dashboard" | "public_project">("landing");
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");
  const [publicProjectSlug, setPublicProjectSlug] = useState<string>("");
  const [dashboardSubRoute, setDashboardSubRoute] = useState<{
    type: "list" | "new" | "edit" | "profile" | "plan" | "help";
    slug?: string;
  }>({
    type: "list",
  });

  // Parse location and sync page state
  const syncRouteWithLocation = useCallback(() => {
    const hash = window.location.hash.toLowerCase();
    const rawHash = window.location.hash;
    const path = window.location.pathname.toLowerCase();
    const rawPath = window.location.pathname;
    const user = authService.getCurrentUser();
    setCurrentUser(user);

    // 1. Check for public project route: /p/:slug or #/p/:slug
    if (hash.startsWith("#/p/")) {
      const slug = rawHash.slice(4).split("?")[0].trim();
      if (slug) {
        setPublicProjectSlug(slug);
        setCurrentPage("public_project");
        return;
      }
    }
    if (path.startsWith("/p/")) {
      const slug = rawPath.slice(3).split("?")[0].trim();
      if (slug) {
        setPublicProjectSlug(slug);
        setCurrentPage("public_project");
        return;
      }
    }

    // 2. Check for dashboard routes
    if (hash === "#/dashboard/new" || path === "/dashboard/new") {
      if (user) {
        setDashboardSubRoute({ type: "new" });
        setCurrentPage("dashboard");
      } else {
        window.location.hash = "#/login";
        setCurrentPage("auth");
        setAuthTab("login");
      }
      return;
    }

    if (hash.startsWith("#/dashboard/edit/")) {
      const slug = rawHash.slice(17).split("?")[0].trim();
      if (user) {
        setDashboardSubRoute({ type: "edit", slug });
        setCurrentPage("dashboard");
      } else {
        window.location.hash = "#/login";
        setCurrentPage("auth");
        setAuthTab("login");
      }
      return;
    }

    if (path.startsWith("/dashboard/edit/")) {
      const slug = rawPath.slice(16).split("?")[0].trim();
      if (user) {
        setDashboardSubRoute({ type: "edit", slug });
        setCurrentPage("dashboard");
      } else {
        window.location.hash = "#/login";
        setCurrentPage("auth");
        setAuthTab("login");
      }
      return;
    }

    if (hash === "#/dashboard/profile" || path === "/dashboard/profile") {
      if (user) {
        setDashboardSubRoute({ type: "profile" });
        setCurrentPage("dashboard");
      } else {
        window.location.hash = "#/login";
        setCurrentPage("auth");
        setAuthTab("login");
      }
      return;
    }

    if (hash === "#/dashboard/plan" || path === "/dashboard/plan") {
      if (user) {
        setDashboardSubRoute({ type: "plan" });
        setCurrentPage("dashboard");
      } else {
        window.location.hash = "#/login";
        setCurrentPage("auth");
        setAuthTab("login");
      }
      return;
    }

    if (hash === "#/dashboard/help" || path === "/dashboard/help") {
      if (user) {
        setDashboardSubRoute({ type: "help" });
        setCurrentPage("dashboard");
      } else {
        window.location.hash = "#/login";
        setCurrentPage("auth");
        setAuthTab("login");
      }
      return;
    }

    if (hash === "#/dashboard" || hash === "#dashboard" || path === "/dashboard") {
      if (user) {
        setDashboardSubRoute({ type: "list" });
        setCurrentPage("dashboard");
      } else {
        window.location.hash = "#/login";
        setCurrentPage("auth");
        setAuthTab("login");
      }
      return;
    }

    // 3. Check for Auth routes
    if (hash === "#/login" || hash === "#login" || path === "/login") {
      if (user) {
        window.location.hash = "#/dashboard";
        setDashboardSubRoute({ type: "list" });
        setCurrentPage("dashboard");
      } else {
        setCurrentPage("auth");
        setAuthTab("login");
      }
      return;
    }

    if (hash === "#/signup" || hash === "#signup" || path === "/signup") {
      if (user) {
        window.location.hash = "#/dashboard";
        setDashboardSubRoute({ type: "list" });
        setCurrentPage("dashboard");
      } else {
        setCurrentPage("auth");
        setAuthTab("signup");
      }
      return;
    }

    if (hash === "#/auth" || hash === "#auth" || path === "/auth") {
      if (user) {
        window.location.hash = "#/dashboard";
        setDashboardSubRoute({ type: "list" });
        setCurrentPage("dashboard");
      } else {
        setCurrentPage("auth");
        setAuthTab("login");
      }
      return;
    }

    // 4. Default: Landing page (preserve hash anchors like #features, #pricing, etc.)
    if (!hash.startsWith("#/")) {
      setCurrentPage("landing");
    }
  }, []);

  // Listen to hash and popstate changes
  useEffect(() => {
    syncRouteWithLocation();
    window.addEventListener("hashchange", syncRouteWithLocation);
    window.addEventListener("popstate", syncRouteWithLocation);

    // Subscribe to Firebase auth state changes
    const unsubscribeAuth = authService.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });

    return () => {
      window.removeEventListener("hashchange", syncRouteWithLocation);
      window.removeEventListener("popstate", syncRouteWithLocation);
      unsubscribeAuth();
    };
  }, [syncRouteWithLocation]);

  const handleOpenAuth = (tab: "login" | "signup") => {
    if (currentUser) {
      window.location.hash = "#/dashboard";
      setDashboardSubRoute({ type: "list" });
      setCurrentPage("dashboard");
      return;
    }
    setAuthTab(tab);
    window.location.hash = tab === "login" ? "#/login" : "#/signup";
    setCurrentPage("auth");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenDashboard = () => {
    if (currentUser) {
      window.location.hash = "#/dashboard";
      setDashboardSubRoute({ type: "list" });
      setCurrentPage("dashboard");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      handleOpenAuth("login");
    }
  };

  const handleAuthSuccess = (user: DwwaarUser) => {
    setCurrentUser(user);
    window.location.hash = "#/dashboard";
    setDashboardSubRoute({ type: "list" });
    setCurrentPage("dashboard");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    window.location.hash = "";
    setCurrentPage("landing");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavigateHome = () => {
    window.location.hash = "";
    setCurrentPage("landing");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavigateRoute = (targetRoute: string) => {
    // Update hash for iframe compatibility
    window.location.hash = `#${targetRoute.startsWith("/") ? targetRoute : "/" + targetRoute}`;
    syncRouteWithLocation();
  };

  // Render Public Project Smart Link Page
  if (currentPage === "public_project" && publicProjectSlug) {
    return (
      <PublicProjectPage
        slug={publicProjectSlug}
        onNavigateHome={handleNavigateHome}
      />
    );
  }

  // Render Dashboard
  if (currentPage === "dashboard" && currentUser) {
    return (
      <Dashboard
        user={currentUser}
        onLogout={handleLogout}
        onNavigateHome={handleNavigateHome}
        initialSubRoute={dashboardSubRoute}
        onNavigateRoute={handleNavigateRoute}
      />
    );
  }

  // Render Auth Page
  if (currentPage === "auth") {
    return (
      <AuthPage
        initialTab={authTab}
        onAuthSuccess={handleAuthSuccess}
        onNavigateHome={handleNavigateHome}
      />
    );
  }

  // Render Landing Page (Strictly Preserved)
  return (
    <div className="min-h-screen bg-[#FBF7F0] text-[#0A1530] flex flex-col selection:bg-[#F6DDB0] selection:text-[#0A1530]">
      {/* 1. Sticky Navbar with Login and Get Started triggers */}
      <Navbar
        onOpenAuth={handleOpenAuth}
        currentUser={currentUser}
        onOpenDashboard={handleOpenDashboard}
      />

      {/* Main Landing Page Content (Unchanged) */}
      <main className="flex-1">
        {/* 2. Hero Section */}
        <Hero onGetStarted={() => handleOpenAuth("signup")} />

        {/* 3. Problem Section */}
        <ProblemSection />

        {/* Brochure vs Dwwaar Side-by-Side Comparison */}
        <ComparisonSection />

        {/* 4. How It Works */}
        <HowItWorks />

        {/* 5. Features Grid */}
        <FeaturesSection />

        {/* 6. Pricing Section */}
        <PricingSection onGetStarted={() => handleOpenAuth("signup")} />

        {/* 7. FAQ Section */}
        <FaqSection />

        {/* 8. Final CTA Band */}
        <CtaBand />
      </main>

      {/* 9. Footer */}
      <Footer />
    </div>
  );
}
