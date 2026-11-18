/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { MessageCircle, Instagram, ArrowUpRight } from "lucide-react";
import { 
  LOGO_PATH, 
  NAV_LINKS, 
  WHATSAPP_URL, 
  WHATSAPP_PHONE, 
  INSTAGRAM_URL, 
  INSTAGRAM_HANDLE 
} from "../constants.ts";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#060c1d] text-[#F5EBDA] border-t border-[#F5EBDA]/10 py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 pb-12 border-b border-[#F5EBDA]/10">
          
          {/* Brand & Tagline */}
          <div className="md:col-span-5 flex flex-col items-start">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={LOGO_PATH}
                alt="Dwwaar"
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover border border-[#F6DDB0]/30"
              />
              <span className="text-xl font-bold tracking-tight text-[#F5EBDA]">
                Dwwaar
              </span>
            </div>
            
            <p className="text-sm text-[#F5EBDA]/75 leading-relaxed max-w-sm mb-6 font-normal">
              One smart link and QR page per project. Replace heavy, outdated PDF brochures with live, mobile-first real estate pages.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111e3b] text-xs text-[#F6DDB0] border border-[#F6DDB0]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Built for builders and brokers</span>
            </div>
          </div>

          {/* Quick Nav Links */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F6DDB0] mb-4">
              Navigation
            </h4>
            <ul className="space-y-3 text-sm">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-[#F5EBDA]/75 hover:text-[#F5EBDA] transition-colors py-1 inline-block"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact (Instagram & WhatsApp only) */}
          <div className="md:col-span-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F6DDB0] mb-4">
              Direct Contact
            </h4>
            <ul className="space-y-3.5 text-sm">
              {/* WhatsApp Only (no calls) */}
              <li>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 text-[#F5EBDA]/85 hover:text-[#F6DDB0] transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#111e3b] flex items-center justify-center shrink-0 text-[#25D366] group-hover:bg-[#1a2c54] transition-colors">
                    <MessageCircle className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-[#F5EBDA] flex items-center gap-1">
                      <span>WhatsApp (no calls)</span>
                      <ArrowUpRight className="w-3 h-3 text-[#F6DDB0]" />
                    </div>
                    <div className="text-xs text-[#F5EBDA]/60 mt-0.5">
                      {WHATSAPP_PHONE}
                    </div>
                  </div>
                </a>
              </li>

              {/* Instagram: founder @_flx.saud */}
              <li>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 text-[#F5EBDA]/85 hover:text-[#F6DDB0] transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#111e3b] flex items-center justify-center shrink-0 text-[#E1306C] group-hover:bg-[#1a2c54] transition-colors">
                    <Instagram className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-[#F5EBDA] flex items-center gap-1">
                      <span>Instagram</span>
                      <ArrowUpRight className="w-3 h-3 text-[#F6DDB0]" />
                    </div>
                    <div className="text-xs text-[#F5EBDA]/60 mt-0.5">
                      {INSTAGRAM_HANDLE}
                    </div>
                  </div>
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#F5EBDA]/60">
          <div>
            © 2026 Dwwaar. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span>Real Estate Smart Links</span>
            <span>·</span>
            <span>Mumbai & Pan-India</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
