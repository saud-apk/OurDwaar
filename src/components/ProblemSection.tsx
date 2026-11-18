/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Clock, FileX, EyeOff } from "lucide-react";

export const ProblemSection: React.FC = () => {
  const problems = [
    {
      id: "outdated-prices",
      title: "Outdated prices",
      subtitle: "Old files linger on buyer phones",
      description:
        "When rates change, sent PDFs stay saved on devices. Discrepancies cause friction, lost trust, and awkward negotiation calls.",
      icon: Clock,
    },
    {
      id: "heavy-pdfs",
      title: "Heavy, unreadable PDFs",
      subtitle: "35MB downloads kill interest",
      description:
        "Large PDFs freeze on mobile networks. Pinching and zooming to inspect floor plans on small screens frustrates prospects.",
      icon: FileX,
    },
    {
      id: "no-view-tracking",
      title: "Zero visibility",
      subtitle: "No idea who opened the file",
      description:
        "Sent a PDF brochure? You have no way of knowing if the client opened it, forwarded it to family, or simply deleted it.",
      icon: EyeOff,
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-[#F5EBDA]/45 border-b border-[#0A1530]/8 relative">
      
      {/* Subtle Arch Section Divider Accent at top */}
      <div 
        aria-hidden="true" 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-5 rounded-b-full bg-[#0A1530]/5 pointer-events-none"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16 sm:mb-20">
          <p className="text-xs sm:text-sm font-bold tracking-wider text-[#0A1530]/70 uppercase mb-3">
            The Problem
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#0A1530] text-balance mb-4">
            PDF brochures don't work on phones.
          </h2>
          <p className="text-base sm:text-lg text-[#0A1530]/75 leading-relaxed font-normal">
            Real estate buyers expect instant, clean mobile links. PDFs slow down sales momentum before conversations start.
          </p>
        </div>

        {/* 3 Problem Cards with Arch-motif Icon Containers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {problems.map((problem) => {
            const Icon = problem.icon;
            return (
              <div
                key={problem.id}
                className="group bg-white rounded-2xl p-7 sm:p-8 border border-[#0A1530]/8 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Arch-shaped icon background motif */}
                  <div className="w-12 h-14 rounded-t-full rounded-b-lg bg-[#F5EBDA] flex items-center justify-center mb-6 group-hover:bg-[#F6DDB0] transition-colors border border-[#0A1530]/5">
                    <Icon className="w-6 h-6 text-[#0A1530]" />
                  </div>

                  <h3 className="text-xl font-bold text-[#0A1530] tracking-tight mb-1.5">
                    {problem.title}
                  </h3>

                  <p className="text-xs font-bold text-[#0A1530]/60 uppercase tracking-wide mb-3">
                    {problem.subtitle}
                  </p>

                  <p className="text-sm text-[#0A1530]/75 leading-relaxed font-normal">
                    {problem.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#0A1530]/5 text-xs font-semibold text-rose-800 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span>Cost: Buyer drop-off & confusion</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
