/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { XCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { WHATSAPP_URL } from "../constants.ts";

export const ComparisonSection: React.FC = () => {
  const brochurePoints = [
    {
      title: "Heavy 25MB–40MB downloads",
      desc: "Stalls on mobile data, fills buyer storage, and causes high drop-offs before opening.",
    },
    {
      title: "Prices go outdated immediately",
      desc: "Revisions leave old rate sheets lingering on buyer phones, creating awkward disputes.",
    },
    {
      title: "Clunky pinch-and-zoom layout",
      desc: "Built for print; frustrating and hard to read on vertical smartphone screens.",
    },
    {
      title: "Zero visibility after sending",
      desc: "No way to know if the prospect opened, forwarded, or deleted the file.",
    },
  ];

  const dwwaarPoints = [
    {
      title: "Instant 1-second browser load",
      desc: "Zero app download. Opens immediately on any phone, browser, or message app.",
    },
    {
      title: "Live pricing & inventory updates",
      desc: "Update price slabs or mark units sold. Everyone sees accurate details instantly.",
    },
    {
      title: "Touch-first mobile layout",
      desc: "Interactive BHK chips, floor plans, and photo galleries that fit any phone.",
    },
    {
      title: "Share on everywhere with 1 tap",
      desc: "Works seamlessly on WhatsApp, SMS, email, social bios, and printed QR codes.",
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-[#FBF7F0] border-b border-[#0A1530]/8 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header - Centered */}
        <div className="max-w-3xl mx-auto text-center mb-16 sm:mb-20">
          <p className="text-xs sm:text-sm font-bold tracking-wider text-[#0A1530]/70 uppercase mb-3">
            Direct Comparison
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#0A1530] text-balance mb-4">
            Brochure vs. Dwwaar
          </h2>
          <p className="text-base sm:text-lg text-[#0A1530]/75 leading-relaxed font-normal">
            See how replacing static PDFs with a live smart link transforms the buyer experience.
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
          
          {/* Column 1: The Old PDF Brochure */}
          <div className="rounded-2xl p-7 sm:p-9 bg-white border border-rose-900/10 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-rose-900/10 mb-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md">
                    Traditional Way
                  </span>
                  <h3 className="text-2xl font-bold text-[#0A1530] mt-2 tracking-tight">
                    PDF Brochure
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
                  <XCircle className="w-6 h-6" />
                </div>
              </div>

              <div className="space-y-6">
                {brochurePoints.map((item) => (
                  <div key={item.title} className="flex items-start gap-3.5">
                    <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-base font-bold text-[#0A1530] leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-sm text-[#0A1530]/70 mt-1 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-rose-900/10 text-xs font-semibold text-rose-700">
              Disadvantage: Heavy friction, lost leads, and outdated details
            </div>
          </div>

          {/* Column 2: Dwwaar Smart Link */}
          <div className="rounded-2xl p-7 sm:p-9 bg-[#0A1530] text-[#F5EBDA] border border-[#F6DDB0]/35 shadow-xl relative overflow-hidden flex flex-col justify-between">
            {/* Arch Motif in card header background */}
            <div className="absolute top-0 right-6 w-32 h-20 arch-top border-t border-x border-[#F6DDB0]/15 pointer-events-none" />

            <div>
              <div className="flex items-center justify-between pb-6 border-b border-[#F5EBDA]/10 mb-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0A1530] bg-[#F6DDB0] px-2.5 py-1 rounded-md">
                    The Modern Standard
                  </span>
                  <h3 className="text-2xl font-bold text-[#F5EBDA] mt-2 tracking-tight">
                    Dwwaar Smart Link
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>

              <div className="space-y-6">
                {dwwaarPoints.map((item) => (
                  <div key={item.title} className="flex items-start gap-3.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-base font-bold text-[#F5EBDA] leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-sm text-[#F5EBDA]/80 mt-1 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-[#F5EBDA]/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span className="text-xs font-semibold text-[#F6DDB0]">
                Outcome: Instant engagement across any channel or device
              </span>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F5EBDA] hover:text-[#F6DDB0] transition-colors"
              >
                <span>Upgrade now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
