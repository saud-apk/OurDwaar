/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ArrowUpRight, ChevronDown, Check, Smartphone, Globe, Share2, RefreshCw } from "lucide-react";

interface HeroProps {
  onGetStarted: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onGetStarted }) => {
  return (
    <section className="relative bg-[#0A1530] text-[#F5EBDA] overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28 lg:pt-32 lg:pb-36 flex flex-col items-center justify-center text-center">
      
      {/* Centered Archway with Door Opening Warm Light Glow Effect */}
      <div 
        aria-hidden="true" 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[520px] md:w-[680px] h-[520px] sm:h-[680px] md:h-[800px] pointer-events-none -z-0 flex flex-col items-center justify-center"
      >
        {/* Arch outline matching Dwwaar logo geometry */}
        <div className="relative w-full h-full rounded-t-[340px] border border-[#F6DDB0]/20 bg-gradient-to-b from-[#14234b]/30 via-[#0e1c3e]/20 to-transparent overflow-hidden">
          
          {/* Door opening light beam expanding from center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[480px] h-[450px] sm:h-[650px] rounded-t-[240px] bg-gradient-to-b from-[#F6DDB0]/35 via-[#F6DDB0]/12 to-transparent animate-door-expand pointer-events-none" />
          
          {/* Inner arch perspective line */}
          <div className="absolute inset-x-8 sm:inset-x-14 top-10 sm:top-14 bottom-0 rounded-t-[220px] border-t border-x border-[#F6DDB0]/15" />
          
          {/* Soft floor glow */}
          <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#F6DDB0]/25 to-transparent blur-xl" />
        </div>
      </div>

      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] sm:w-[900px] h-[400px] sm:h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(246,221,176,0.12)_0%,transparent_70%)] pointer-events-none -z-0"
      />

      {/* Hero Content - Perfectly Centered, Minimal & Real Estate Ready */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        
        {/* Subtle Real Estate Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#132349]/90 border border-[#F6DDB0]/30 text-[#F6DDB0] text-xs sm:text-sm font-semibold mb-8 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#F6DDB0] animate-pulse" />
          <span>Real estate smart links & QR infrastructure</span>
        </div>

        {/* Main Headline - Short, Creative & Aesthetic */}
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight text-[#F5EBDA] leading-[1.04] text-balance mb-6">
          One link. <br />
          <span className="text-[#F6DDB0]">Everywhere.</span>
        </h1>

        {/* Short & Aesthetic Subtext */}
        <p className="text-base sm:text-lg lg:text-xl text-[#F5EBDA]/85 leading-relaxed max-w-xl mx-auto mb-10 font-normal">
          The whole project in a single tap. Live prices, floor plans, and RERA details — shared anywhere with zero PDFs.
        </p>

        {/* Centered Action Buttons */}
        <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <button
            type="button"
            onClick={onGetStarted}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-[#F5EBDA] text-[#0A1530] font-extrabold text-base border border-[#F6DDB0] shadow-[0_0_24px_rgba(246,221,176,0.3)] hover:shadow-[0_0_36px_rgba(246,221,176,0.6)] hover:bg-[#F6DDB0] transition-all duration-200 active:scale-[0.98] min-h-[48px] cursor-pointer"
          >
            <span>Get Started Free</span>
            <ArrowUpRight className="w-4 h-4 text-[#0A1530]" />
          </button>

          <a
            href="#how-it-works"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-transparent text-[#F5EBDA] font-semibold text-base border border-[#F5EBDA]/35 hover:bg-[#F5EBDA]/10 transition-colors min-h-[48px]"
          >
            <span>See How It Works</span>
            <ChevronDown className="w-4 h-4 text-[#F6DDB0]" />
          </a>
        </div>

        {/* Micro-Proof for Real Estate */}
        <div className="flex items-center justify-center gap-2 text-xs text-[#F5EBDA]/75">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Free for builders & brokers · 2 active projects included</span>
        </div>

      </div>

      {/* Slim Trust Strip - Centered, Minimal & Aesthetic */}
      <div className="w-full mt-16 sm:mt-24 border-t border-[#F5EBDA]/10 bg-[#081126]/80 backdrop-blur-sm py-5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 text-center">
            
            <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-[#F5EBDA]/90 font-medium py-1">
              <div className="w-6 h-6 rounded-lg bg-[#142347] flex items-center justify-center text-[#F6DDB0] shrink-0">
                <Smartphone className="w-3.5 h-3.5" />
              </div>
              <span className="whitespace-nowrap">No app needed</span>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-[#F5EBDA]/90 font-medium py-1">
              <div className="w-6 h-6 rounded-lg bg-[#142347] flex items-center justify-center text-[#F6DDB0] shrink-0">
                <Globe className="w-3.5 h-3.5" />
              </div>
              <span className="whitespace-nowrap">Works on every phone</span>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-[#F5EBDA]/90 font-medium py-1">
              <div className="w-6 h-6 rounded-lg bg-[#142347] flex items-center justify-center text-[#F6DDB0] shrink-0">
                <Share2 className="w-3.5 h-3.5" />
              </div>
              <span className="whitespace-nowrap">Share on everywhere</span>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-[#F5EBDA]/90 font-medium py-1">
              <div className="w-6 h-6 rounded-lg bg-[#142347] flex items-center justify-center text-[#F6DDB0] shrink-0">
                <RefreshCw className="w-3.5 h-3.5" />
              </div>
              <span className="whitespace-nowrap">Always up to date</span>
            </div>

          </div>
        </div>
      </div>

    </section>
  );
};
