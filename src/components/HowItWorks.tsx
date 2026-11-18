/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { PlusCircle, QrCode, Share2, ArrowRight } from "lucide-react";
import { WHATSAPP_URL } from "../constants.ts";

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: "01",
      title: "Add project details",
      description: "Enter configurations (1, 2, 3 BHK), carpet area, starting price slabs, and verified RERA ID in under 3 minutes.",
      badge: "Simple form",
      icon: PlusCircle,
    },
    {
      step: "02",
      title: "Get your link & QR",
      description: "Receive your dedicated instant project page (dwwaar.link/project) and print-ready vector QR code.",
      badge: "Instant generation",
      icon: QrCode,
    },
    {
      step: "03",
      title: "Share on everywhere",
      description: "Send on WhatsApp, SMS, email, social bio, or print the QR on site hoardings, sales galleries, and newspaper ads.",
      badge: "Omnichannel",
      icon: Share2,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-[#FBF7F0] border-b border-[#0A1530]/8 relative">
      
      {/* Arch Section Divider Accent */}
      <div 
        aria-hidden="true" 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-5 rounded-b-full bg-[#0A1530]/5 pointer-events-none"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header - Centered */}
        <div className="max-w-3xl mx-auto text-center mb-16 sm:mb-20">
          <p className="text-xs sm:text-sm font-bold tracking-wider text-[#0A1530]/70 uppercase mb-3">
            How It Works
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#0A1530] text-balance mb-4">
            Live in 3 simple steps.
          </h2>
          <p className="text-base sm:text-lg text-[#0A1530]/75 leading-relaxed font-normal">
            No technical knowledge or developers needed. Turn any real estate project into a live smart link.
          </p>
        </div>

        {/* 3 Step Cards with Arch Motif details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="group relative bg-[#F5EBDA]/45 rounded-2xl p-7 sm:p-8 border border-[#0A1530]/8 flex flex-col justify-between hover:bg-[#F5EBDA]/75 transition-all duration-200 hover:-translate-y-1 hover:shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl font-extrabold text-[#0A1530]/30 font-mono tracking-tight group-hover:text-[#0A1530]/50 transition-colors">
                      {item.step}
                    </span>
                    {/* Arch-shaped step badge */}
                    <div className="w-11 h-12 rounded-t-full rounded-b-md bg-white flex items-center justify-center text-[#0A1530] shadow-2xs border border-[#0A1530]/8">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-[#0A1530] tracking-tight mb-2.5">
                    {item.title}
                  </h3>

                  <p className="text-sm text-[#0A1530]/75 leading-relaxed mb-6 font-normal">
                    {item.description}
                  </p>
                </div>

                {/* Mini Preview Box */}
                <div className="pt-4 border-t border-[#0A1530]/8">
                  {idx === 0 && (
                    <div className="bg-white rounded-xl p-3 border border-[#0A1530]/5 text-xs text-[#0A1530]/80 shadow-2xs">
                      <div className="flex items-center justify-between text-[11px] font-bold text-[#0A1530]">
                        <span>Project Upload</span>
                        <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">Verified</span>
                      </div>
                      <div className="text-[11px] text-[#0A1530]/60 mt-0.5">2 & 3 BHK · RERA Registered</div>
                    </div>
                  )}

                  {idx === 1 && (
                    <div className="bg-white rounded-xl p-3 border border-[#0A1530]/5 text-xs text-[#0A1530]/80 flex items-center justify-between shadow-2xs">
                      <div className="truncate pr-2">
                        <div className="text-[11px] font-mono text-[#0A1530] font-bold truncate">
                          dwwaar.link/project
                        </div>
                        <div className="text-[10px] text-[#0A1530]/60">Print-ready vector QR</div>
                      </div>
                      <div className="w-7 h-7 bg-[#0A1530] text-[#F6DDB0] rounded-md flex items-center justify-center shrink-0">
                        <QrCode className="w-4 h-4" />
                      </div>
                    </div>
                  )}

                  {idx === 2 && (
                    <div className="bg-white rounded-xl p-3 border border-[#0A1530]/5 text-xs text-[#0A1530]/80 flex items-center gap-2 shadow-2xs">
                      <div className="w-6 h-6 rounded-full bg-[#0A1530] text-[#F6DDB0] flex items-center justify-center shrink-0 text-[10px] font-bold">
                        ✓
                      </div>
                      <div className="text-[11px] text-[#0A1530]">
                        <span className="font-bold text-[#0A1530]">Share on everywhere: </span>
                        Chats, SMS, social bio & print
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom helper */}
        <div className="mt-12 text-center">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#0A1530] hover:text-[#18316c] transition-colors group"
          >
            <span>Have questions about your real estate project? Chat with us</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

      </div>
    </section>
  );
};
