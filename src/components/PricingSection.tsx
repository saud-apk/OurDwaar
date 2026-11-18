/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Check, ArrowUpRight } from "lucide-react";
import { WHATSAPP_URL } from "../constants.ts";

interface PricingSectionProps {
  onGetStarted: () => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onGetStarted }) => {
  return (
    <section id="pricing" className="py-20 sm:py-28 bg-[#FBF7F0] border-b border-[#0A1530]/8 relative">
      
      {/* Arch Section Divider Accent */}
      <div 
        aria-hidden="true" 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-5 rounded-b-full bg-[#0A1530]/5 pointer-events-none"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16 sm:mb-20">
          <p className="text-xs sm:text-sm font-bold tracking-wider text-[#0A1530]/70 uppercase mb-3">
            Pricing
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#0A1530] text-balance mb-4">
            Start free. Upgrade as you scale.
          </h2>
          <p className="text-base sm:text-lg text-[#0A1530]/75 leading-relaxed font-normal">
            No credit card needed to launch smart links for your current projects.
          </p>
        </div>

        {/* 2 Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          
          {/* Free Tier */}
          <div className="rounded-2xl p-8 sm:p-10 bg-white text-[#0A1530] border border-[#0A1530]/10 shadow-xs hover:shadow-md flex flex-col justify-between transition-all duration-200">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Free
                </h3>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#F5EBDA] text-[#0A1530]">
                  For Single Projects
                </span>
              </div>

              <p className="text-sm text-[#0A1530]/70 leading-relaxed mb-6 font-normal">
                Everything required to replace PDF brochures for up to 2 active projects.
              </p>

              <div className="mb-8 pb-6 border-b border-[#0A1530]/10">
                <div className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#0A1530]">
                  ₹0
                </div>
                <p className="text-xs font-semibold text-[#0A1530]/60 mt-1">
                  Free forever · No credit card required
                </p>
              </div>

              <div className="space-y-3.5 mb-8">
                <div className="text-xs font-bold uppercase tracking-wider text-[#0A1530]/60 mb-2">
                  What's included:
                </div>
                {[
                  "2 smart project links",
                  "Print-ready QR code generation",
                  "Share on everywhere (Chats, SMS, Bio, Print)",
                  "Photos & basic floor plans",
                  "RERA compliance badge",
                  "Standard dwwaar.link shareable address",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm font-medium">
                    <div className="w-5 h-5 rounded-full bg-[#F5EBDA] text-[#0A1530] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={onGetStarted}
              className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-bold text-sm sm:text-base bg-[#0A1530] text-[#F5EBDA] hover:bg-[#14234d] border border-[#0A1530] shadow-sm hover:shadow-[0_0_20px_rgba(10,21,48,0.25)] transition-all duration-200 active:scale-[0.98] min-h-[48px] cursor-pointer"
            >
              <span>Get Started Free</span>
              <ArrowUpRight className="w-4 h-4 shrink-0 text-[#F6DDB0]" />
            </button>
          </div>

          {/* Pro Tier (Coming Soon) */}
          <div className="rounded-2xl p-8 sm:p-10 bg-[#0A1530] text-[#F5EBDA] border border-[#F6DDB0]/35 shadow-xl relative overflow-hidden flex flex-col justify-between transition-all duration-200">
            {/* Arch Motif in background */}
            <div className="absolute top-0 right-4 w-36 h-40 arch-top border border-[#F6DDB0]/15 pointer-events-none" />
            <div className="absolute -top-10 -right-10 w-44 h-44 bg-[radial-gradient(circle,rgba(246,221,176,0.18)_0%,transparent_70%)] pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F5EBDA]">
                  Pro
                </h3>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#18284e] text-[#F6DDB0] border border-[#F6DDB0]/30">
                  Coming soon
                </span>
              </div>

              <p className="text-sm text-[#F5EBDA]/75 leading-relaxed mb-6 font-normal">
                For established developers, multi-agent teams, and large brokerage firms.
              </p>

              <div className="mb-8 pb-6 border-b border-[#F5EBDA]/10">
                <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F6DDB0]">
                  Coming soon
                </div>
                <p className="text-xs font-semibold text-[#F5EBDA]/60 mt-1">
                  Join the priority early-access waitlist
                </p>
              </div>

              <div className="space-y-3.5 mb-8">
                <div className="text-xs font-bold uppercase tracking-wider text-[#F6DDB0] mb-2">
                  Everything in Free, plus:
                </div>
                {[
                  "Unlimited smart project links",
                  "Live availability updates",
                  "Real-time view tracking & analytics",
                  "Multi-channel broker lead distribution",
                  "Custom branded project domains",
                  "Priority onboarding & setup support",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm font-medium">
                    <div className="w-5 h-5 rounded-full bg-[#17284f] text-[#F6DDB0] flex items-center justify-center shrink-0 mt-0.5 border border-[#F6DDB0]/20">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[#F5EBDA]/95">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-extrabold text-sm sm:text-base bg-[#F5EBDA] text-[#0A1530] border border-[#F6DDB0] shadow-[0_0_20px_rgba(246,221,176,0.3)] hover:shadow-[0_0_32px_rgba(246,221,176,0.55)] hover:bg-[#F6DDB0] transition-all duration-200 active:scale-[0.98] min-h-[48px]"
              >
                <span>Join Pro Waitlist</span>
                <ArrowUpRight className="w-4 h-4 shrink-0 text-[#0A1530]" />
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
