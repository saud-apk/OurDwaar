/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Activity, 
  ShieldCheck, 
  Share2, 
  QrCode, 
  Layout, 
  Smartphone 
} from "lucide-react";

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      title: "Live availability",
      description: "Mark units as available or sold out. Your brokers and buyers always see accurate inventory.",
      icon: Activity,
    },
    {
      title: "RERA badge",
      description: "Display registered RERA numbers and statutory certificates prominently to build immediate trust.",
      icon: ShieldCheck,
    },
    {
      title: "Share anywhere",
      description: "Works seamlessly across WhatsApp chats, SMS, emails, social bio links, and print QR codes.",
      icon: Share2,
    },
    {
      title: "Print-ready QR code",
      description: "Auto-generated vector QR code for site hoardings, booth standees, print ads, and business cards.",
      icon: QrCode,
    },
    {
      title: "Photos and floor plans",
      description: "Interactive floor plan viewers and high-res photo galleries that load instantly on any phone.",
      icon: Layout,
    },
    {
      title: "Mobile-first pages",
      description: "Zero download lag, 60fps scrolling, and optimized for India's 4G and 5G mobile networks.",
      icon: Smartphone,
    },
  ];

  return (
    <section id="features" className="py-20 sm:py-28 bg-[#F5EBDA]/35 border-b border-[#0A1530]/8 relative">
      
      {/* Arch Section Divider Accent */}
      <div 
        aria-hidden="true" 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-5 rounded-b-full bg-[#0A1530]/5 pointer-events-none"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header - Centered */}
        <div className="max-w-3xl mx-auto text-center mb-16 sm:mb-20">
          <p className="text-xs sm:text-sm font-bold tracking-wider text-[#0A1530]/70 uppercase mb-3">
            Core Features
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#0A1530] text-balance mb-4">
            Everything brochures couldn't do.
          </h2>
          <p className="text-base sm:text-lg text-[#0A1530]/75 leading-relaxed font-normal">
            Designed specifically for modern real estate developers, brokers, and homebuyers.
          </p>
        </div>

        {/* 6 Feature Cards Grid with Arch-shaped Icon Backgrounds */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group bg-white rounded-2xl p-7 sm:p-8 border border-[#0A1530]/8 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Arch-shaped icon background motif */}
                  <div className="w-12 h-14 rounded-t-full rounded-b-md bg-[#F5EBDA] flex items-center justify-center mb-5 text-[#0A1530] group-hover:bg-[#F6DDB0] transition-colors border border-[#0A1530]/5">
                    <Icon className="w-6 h-6 text-[#0A1530]" />
                  </div>

                  <h3 className="text-xl font-bold text-[#0A1530] tracking-tight mb-2">
                    {feature.title}
                  </h3>

                  <p className="text-sm text-[#0A1530]/75 leading-relaxed font-normal">
                    {feature.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#0A1530]/5 flex items-center gap-2 text-xs text-[#0A1530]/60 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Standard on every project link</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
