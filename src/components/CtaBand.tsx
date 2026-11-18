/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { WHATSAPP_URL, WHATSAPP_PHONE } from "../constants.ts";

export const CtaBand: React.FC = () => {
  return (
    <section className="relative bg-[#0A1530] text-[#F5EBDA] py-20 sm:py-28 overflow-hidden">
      
      {/* Central Arch Outline with warm door light glow */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[500px] h-[440px] sm:h-[600px] rounded-t-[250px] border border-[#F6DDB0]/20 bg-[radial-gradient(ellipse_at_center,rgba(246,221,176,0.2)_0%,rgba(246,221,176,0.05)_50%,transparent_75%)] pointer-events-none"
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Subtle Tagline */}
        <p className="text-xs sm:text-sm font-bold tracking-wider text-[#F6DDB0] uppercase mb-4">
          Ready for Real Estate Builders & Brokers
        </p>

        {/* Headline */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#F5EBDA] text-balance mb-5 leading-tight">
          Ready to retire the brochure?
        </h2>

        {/* Sharper subtext */}
        <p className="text-base sm:text-lg text-[#F5EBDA]/80 max-w-xl mx-auto leading-relaxed mb-9 font-normal">
          One smart link. One print QR code. Share on everywhere and give prospective home buyers instant clarity.
        </p>

        {/* Refined CTA Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-[#F5EBDA] text-[#0A1530] font-extrabold text-base border border-[#F6DDB0] shadow-[0_0_24px_rgba(246,221,176,0.35)] hover:shadow-[0_0_36px_rgba(246,221,176,0.6)] hover:bg-[#F6DDB0] transition-all duration-200 active:scale-[0.98] min-h-[48px]"
          >
            <span>Create Your Project Link</span>
            <ArrowUpRight className="w-4 h-4 text-[#0A1530]" />
          </a>
        </div>

        <p className="mt-5 text-xs text-[#F5EBDA]/60">
          Fast direct onboarding · WhatsApp {WHATSAPP_PHONE}
        </p>

      </div>
    </section>
  );
};
