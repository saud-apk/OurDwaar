/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Building2, 
  MapPin, 
  ShieldCheck, 
  Share2, 
  Check, 
  ExternalLink, 
  MessageCircle, 
  ArrowLeft,
  Sparkles,
  PhoneCall,
  Calendar,
  Layers,
  ChevronRight,
  Info
} from "lucide-react";
import { Project, projectService } from "../services/projectService.ts";
import { LOGO_PATH, WHATSAPP_URL } from "../constants.ts";

interface PublicProjectPageProps {
  slug: string;
  onNavigateHome: () => void;
}

export const PublicProjectPage: React.FC<PublicProjectPageProps> = ({ slug, onNavigateHome }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "configurations" | "contact">("overview");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function fetchProject() {
      setLoading(true);
      setNotFound(false);
      try {
        const data = await projectService.getProjectBySlug(slug);
        if (!mounted) return;

        if (data) {
          setProject(data);
          // Increment views atomically in Firestore
          projectService.incrementProjectViews(slug);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error("Error loading project:", err);
        if (mounted) setNotFound(true);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (slug) {
      fetchProject();
    } else {
      setNotFound(true);
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [slug]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: project?.name || "Dwwaar Project",
          text: `Explore ${project?.name} - ${project?.price} in ${project?.location}`,
          url,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback copy
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getWhatsAppInquiryUrl = () => {
    if (!project) return WHATSAPP_URL;
    const msg = encodeURIComponent(
      `Hello! I am inquiring about *${project.name}* (${project.location}) listed at *${project.price}*. Could you please share more details?`
    );
    return `https://wa.me/?text=${msg}`;
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF7F0] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-[#0A1530]/5 flex items-center justify-center mb-4 animate-pulse">
          <img src={LOGO_PATH} alt="Dwwaar" className="w-10 h-10 object-contain animate-spin" style={{ animationDuration: "3s" }} />
        </div>
        <p className="text-sm font-medium text-[#0A1530]/60">Opening project smart link...</p>
      </div>
    );
  }

  // Not found / 404 state
  if (notFound || !project) {
    return (
      <div className="min-h-screen bg-[#FBF7F0] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-2xl bg-[#0A1530]/5 border border-[#0A1530]/10 flex items-center justify-center mb-5">
          <Building2 className="w-10 h-10 text-[#0A1530]/40" />
        </div>
        <h1 className="text-2xl font-bold text-[#0A1530] tracking-tight mb-2">Project Not Found</h1>
        <p className="text-sm text-[#0A1530]/70 max-w-sm mb-6">
          This Dwwaar link is inactive, has been updated, or does not exist.
        </p>
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0A1530] text-[#F5EBDA] font-medium text-sm hover:bg-[#12224A] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dwwaar
        </button>
      </div>
    );
  }

  const isAvailable = project.status === "available";

  return (
    <div className="min-h-screen bg-[#FBF7F0] text-[#0A1530] flex flex-col selection:bg-[#F6DDB0]">
      {/* Top Bar / Branding */}
      <header className="sticky top-0 z-40 bg-[#FBF7F0]/90 backdrop-blur-md border-b border-[#0A1530]/8 px-4 py-3 sm:px-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2.5 group text-left"
          >
            <img
              src={LOGO_PATH}
              alt="Dwwaar"
              className="w-8 h-8 rounded-full border border-[#0A1530]/10 shadow-xs group-hover:scale-105 transition-transform"
            />
            <div>
              <span className="text-base font-bold tracking-tight text-[#0A1530]">Dwwaar</span>
              <span className="block text-[10px] text-[#0A1530]/50 font-medium tracking-wider uppercase">
                Verified Smart Link
              </span>
            </div>
          </button>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#0A1530]/15 bg-white/70 text-xs font-semibold text-[#0A1530] hover:bg-white hover:border-[#0A1530]/30 transition-all shadow-xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-[#0A1530]/70" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area: Mobile-first card container */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-5 sm:px-6 sm:py-8 space-y-6">
        {/* Project Card */}
        <div className="bg-white rounded-3xl border border-[#0A1530]/10 shadow-sm overflow-hidden">
          {/* Cover Area / Arch Motif */}
          <div className="relative w-full aspect-16/9 bg-gradient-to-b from-[#0A1530] to-[#12224A] overflow-hidden flex items-center justify-center">
            {project.coverImage ? (
              <img
                src={project.coverImage}
                alt={project.name}
                className="w-full h-full object-cover"
              />
            ) : (
              // Architectural Arch Motif
              <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(246,221,176,0.18)_0%,transparent_70%)]" />
                
                {/* Arch Outline Motif */}
                <div className="w-32 h-44 rounded-t-full border border-[#F6DDB0]/20 flex flex-col items-center justify-center p-3 relative">
                  <div className="w-24 h-36 rounded-t-full border border-[#F6DDB0]/35 flex flex-col items-center justify-center p-2">
                    <Building2 className="w-8 h-8 text-[#F6DDB0]/80 mb-2" />
                    <span className="text-[11px] font-medium text-[#F5EBDA]/70 text-center tracking-wide">
                      {project.name}
                    </span>
                  </div>
                </div>

                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white/60 text-xs">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#F6DDB0]" />
                    Official Project Page
                  </span>
                  <span>dwwaar.link</span>
                </div>
              </div>
            )}

            {/* Status Badge overlay */}
            <div className="absolute top-4 left-4">
              {isAvailable ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/95 text-white shadow-md backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  Available Units
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-600/95 text-white shadow-md backdrop-blur-sm">
                  Sold Out
                </span>
              )}
            </div>

            {/* RERA Badge overlay */}
            {project.reraId && (
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/90 text-[#0A1530] shadow-md backdrop-blur-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  RERA Registered
                </span>
              </div>
            )}
          </div>

          {/* Project Details Body */}
          <div className="p-5 sm:p-7 space-y-6">
            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A1530]">
                  {project.name}
                </h1>
                <div className="text-xl sm:text-2xl font-black text-[#0A1530]">
                  {project.price}
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-sm font-medium text-[#0A1530]/70">
                <MapPin className="w-4 h-4 text-[#0A1530]/50 shrink-0" />
                <span>{project.location}</span>
              </div>
            </div>

            {/* Configurations Pills */}
            {project.configurations && project.configurations.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1 border-t border-[#0A1530]/8">
                {project.configurations.map((cfg, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1 rounded-lg bg-[#F5EBDA]/70 border border-[#0A1530]/10 text-xs font-semibold text-[#0A1530]"
                  >
                    {cfg}
                  </span>
                ))}
              </div>
            )}

            {/* Tab navigation */}
            <div className="flex rounded-xl bg-[#0A1530]/5 p-1 text-xs font-semibold">
              <button
                onClick={() => setActiveTab("overview")}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  activeTab === "overview"
                    ? "bg-white text-[#0A1530] shadow-xs font-bold"
                    : "text-[#0A1530]/60 hover:text-[#0A1530]"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("configurations")}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  activeTab === "configurations"
                    ? "bg-white text-[#0A1530] shadow-xs font-bold"
                    : "text-[#0A1530]/60 hover:text-[#0A1530]"
                }`}
              >
                Specifications
              </button>
              <button
                onClick={() => setActiveTab("contact")}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  activeTab === "contact"
                    ? "bg-white text-[#0A1530] shadow-xs font-bold"
                    : "text-[#0A1530]/60 hover:text-[#0A1530]"
                }`}
              >
                Inquire
              </button>
            </div>

            {/* Tab: Overview */}
            {activeTab === "overview" && (
              <div className="space-y-4 text-sm text-[#0A1530]/80">
                {project.description ? (
                  <p className="leading-relaxed whitespace-pre-line text-sm text-[#0A1530]/85">
                    {project.description}
                  </p>
                ) : (
                  <p className="leading-relaxed text-sm text-[#0A1530]/70">
                    Welcome to {project.name}. Premium residential property located in {project.location}. Featuring modern architecture, curated amenities, and verified RERA approvals.
                  </p>
                )}

                {/* Statutory verification strip */}
                <div className="p-3.5 rounded-2xl bg-[#F5EBDA]/40 border border-[#0A1530]/8 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold text-[#0A1530] block">
                      RERA Registration
                    </span>
                    <span className="text-[#0A1530]/70 break-all">
                      {project.reraId ? project.reraId : "Verified Statutory Details on Request"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Specifications */}
            {activeTab === "configurations" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-[#0A1530]/3 border border-[#0A1530]/8">
                    <span className="text-[11px] text-[#0A1530]/50 font-medium block">Starting Price</span>
                    <span className="text-sm font-bold text-[#0A1530]">{project.price}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0A1530]/3 border border-[#0A1530]/8">
                    <span className="text-[11px] text-[#0A1530]/50 font-medium block">Location</span>
                    <span className="text-sm font-bold text-[#0A1530] truncate block">{project.location}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0A1530]/3 border border-[#0A1530]/8">
                    <span className="text-[11px] text-[#0A1530]/50 font-medium block">Status</span>
                    <span className={`text-sm font-bold ${isAvailable ? "text-emerald-700" : "text-rose-700"}`}>
                      {isAvailable ? "Available" : "Sold Out"}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0A1530]/3 border border-[#0A1530]/8">
                    <span className="text-[11px] text-[#0A1530]/50 font-medium block">Format</span>
                    <span className="text-sm font-bold text-[#0A1530]">Smart Web Brochure</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Contact */}
            {activeTab === "contact" && (
              <div className="space-y-4">
                <p className="text-xs text-[#0A1530]/70">
                  Connect directly with the sales desk or authorized channel partner for verified floor plans, site visit schedules, and inventory holds.
                </p>
                <a
                  href={getWhatsAppInquiryUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl bg-[#25D366] text-white font-bold text-sm hover:bg-[#20BD5A] transition-colors shadow-sm"
                >
                  <MessageCircle className="w-5 h-5" />
                  Chat on WhatsApp for Pricing
                </a>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-[#0A1530]/8 flex flex-col sm:flex-row gap-3">
              <a
                href={getWhatsAppInquiryUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-[#0A1530] text-[#F5EBDA] font-semibold text-sm hover:bg-[#12224A] transition-all shadow-md group"
              >
                <MessageCircle className="w-4 h-4 text-[#F6DDB0]" />
                <span>Contact Sales Desk</span>
                <ChevronRight className="w-4 h-4 text-[#F5EBDA]/50 group-hover:translate-x-0.5 transition-transform" />
              </a>

              <button
                onClick={handleShare}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl border border-[#0A1530]/15 bg-white text-xs font-semibold text-[#0A1530] hover:bg-[#0A1530]/5 transition-colors"
              >
                <Share2 className="w-4 h-4 text-[#0A1530]/70" />
                <span>Share Everywhere</span>
              </button>
            </div>
          </div>
        </div>

        {/* Trust badge */}
        <div className="text-center space-y-1.5 py-4">
          <p className="text-xs text-[#0A1530]/50 font-medium">
            Shared via <span className="font-semibold text-[#0A1530]">Dwwaar</span> • The smart upgrade to real estate brochures
          </p>
          <button
            onClick={onNavigateHome}
            className="text-xs text-[#0A1530]/60 underline hover:text-[#0A1530] transition-colors"
          >
            Create a smart link for your project →
          </button>
        </div>
      </main>
    </div>
  );
};
