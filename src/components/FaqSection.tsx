/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "How is a Dwwaar link better than a PDF brochure?",
      answer:
        "PDFs are 30MB+ downloads that lag on mobile data and become outdated whenever prices or units change. A Dwwaar link loads in under a second in any phone browser, lets you update prices and availability live, and gives buyers a direct one-tap button to message you on WhatsApp.",
    },
    {
      question: "Can I update prices and floor plans after sharing the link?",
      answer:
        "Yes. Any updates you make to pricing, availability status, or floor plans update immediately on your existing link and printed QR code. You never need to re-send files to prospects.",
    },
    {
      question: "Do buyers need to download any app to view the link?",
      answer:
        "No app or signup is needed. When clients tap your link in WhatsApp or scan your QR code with their camera, the page opens instantly in their mobile browser.",
    },
    {
      question: "Where can I use the generated QR code?",
      answer:
        "Anywhere you market: site hoardings, building barricades, print newspaper ads, property expos, reception standees, and visiting cards.",
    },
    {
      question: "Can brokers use Dwwaar for multiple builder projects?",
      answer:
        "Yes. Brokers and channel partners can manage separate smart links for each property they represent, with lead inquiries routed straight to their own WhatsApp.",
    },
  ];

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 sm:py-28 bg-[#F5EBDA]/30 border-b border-[#0A1530]/8 relative">
      
      {/* Arch Section Divider Accent */}
      <div 
        aria-hidden="true" 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-5 rounded-b-full bg-[#0A1530]/5 pointer-events-none"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16 sm:mb-20">
          <p className="text-xs sm:text-sm font-bold tracking-wider text-[#0A1530]/70 uppercase mb-3">
            Common Questions
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#0A1530] text-balance mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-base sm:text-lg text-[#0A1530]/75 leading-relaxed font-normal">
            Everything you need to know about switching from PDF brochures to Dwwaar smart links.
          </p>
        </div>

        {/* Clean Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.question}
                className="bg-white rounded-2xl border border-[#0A1530]/8 overflow-hidden shadow-2xs transition-all duration-200 hover:border-[#0A1530]/20"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full py-5 px-6 sm:px-8 text-left flex items-center justify-between gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A1530] min-h-[56px]"
                  aria-expanded={isOpen}
                >
                  <span className="text-base sm:text-lg font-bold text-[#0A1530] tracking-tight">
                    {faq.question}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 bg-[#0A1530] text-[#F5EBDA]" : "bg-[#F5EBDA] text-[#0A1530]"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 sm:px-8 sm:pb-7 pt-1 text-sm sm:text-base text-[#0A1530]/80 leading-relaxed border-t border-[#0A1530]/5">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
