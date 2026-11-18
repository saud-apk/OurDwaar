/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Menu, X, ArrowUpRight, UserCheck } from "lucide-react";
import { LOGO_PATH, NAV_LINKS } from "../constants.ts";
import { DwwaarUser } from "../services/authService.ts";

interface NavbarProps {
  onOpenAuth: (tab: "login" | "signup") => void;
  currentUser?: DwwaarUser | null;
  onOpenDashboard?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  currentUser,
  onOpenDashboard,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-200 ${
        isScrolled
          ? "bg-[#FBF7F0]/95 backdrop-blur-md shadow-xs border-b border-[#0A1530]/8"
          : "bg-[#FBF7F0] border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20 gap-6 lg:gap-8">
          {/* Zone 1: Brand Mark + Wordmark */}
          <a
            href="#"
            className="flex items-center gap-3 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A1530] rounded-lg p-1 group"
          >
            <img
              src={LOGO_PATH}
              alt="Dwwaar Emblem"
              referrerPolicy="no-referrer"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover shadow-xs border border-[#F6DDB0]/40 group-hover:scale-102 transition-transform"
            />
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#0A1530]">
              Dwwaar
            </span>
          </a>

          {/* Zone 2: Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#0A1530]/80">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="hover:text-[#0A1530] transition-colors whitespace-nowrap shrink-0 py-2 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#0A1530] after:scale-x-0 hover:after:scale-x-100 after:transition-transform"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Zone 3: Primary Action & Mobile Hamburger */}
          <div className="flex items-center gap-3 shrink-0">
            {currentUser ? (
              <button
                type="button"
                onClick={onOpenDashboard}
                className="hidden sm:inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-[#F5EBDA] bg-[#0A1530] rounded-xl hover:bg-[#13234d] border border-[#F6DDB0]/40 shadow-xs hover:shadow-[0_0_18px_rgba(246,221,176,0.35)] transition-all duration-200 active:scale-[0.98] whitespace-nowrap shrink-0"
              >
                <UserCheck className="w-4 h-4 text-[#F6DDB0]" />
                <span>Dashboard</span>
              </button>
            ) : (
              <>
                {/* Desktop Login button */}
                <button
                  type="button"
                  onClick={() => onOpenAuth("login")}
                  className="hidden sm:inline-block text-sm font-semibold text-[#0A1530]/80 hover:text-[#0A1530] transition-colors py-2 px-3 whitespace-nowrap shrink-0"
                >
                  Login
                </button>

                {/* Desktop Get Started button (Opens Sign Up tab) */}
                <button
                  type="button"
                  onClick={() => onOpenAuth("signup")}
                  className="hidden sm:inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-sm font-bold text-[#F5EBDA] bg-[#0A1530] rounded-xl hover:bg-[#13234d] border border-[#F6DDB0]/40 shadow-xs hover:shadow-[0_0_18px_rgba(246,221,176,0.35)] transition-all duration-200 active:scale-[0.98] whitespace-nowrap shrink-0"
                >
                  <span>Get Started</span>
                  <ArrowUpRight className="w-4 h-4 text-[#F6DDB0]" />
                </button>
              </>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center p-2.5 min-w-[44px] min-h-[44px] rounded-xl text-[#0A1530] hover:bg-[#F5EBDA] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A1530]"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#0A1530]/10 bg-[#FBF7F0] px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <nav className="flex flex-col space-y-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-3 py-3 text-base font-semibold text-[#0A1530] rounded-xl hover:bg-[#F5EBDA] transition-colors min-h-[44px]"
              >
                {link.label}
              </a>
            ))}

            {!currentUser && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth("login");
                }}
                className="flex items-center px-3 py-3 text-base font-semibold text-[#0A1530] rounded-xl hover:bg-[#F5EBDA] transition-colors min-h-[44px] text-left w-full"
              >
                Login
              </button>
            )}
          </nav>

          <div className="pt-2">
            {currentUser ? (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenDashboard?.();
                }}
                className="w-full flex items-center justify-center gap-2 px-5 py-3.5 text-base font-bold text-[#F5EBDA] bg-[#0A1530] rounded-xl hover:bg-[#13234d] border border-[#F6DDB0]/30 shadow-md min-h-[48px]"
              >
                <UserCheck className="w-4 h-4 text-[#F6DDB0]" />
                <span>Go to Dashboard</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth("signup");
                }}
                className="w-full flex items-center justify-center gap-2 px-5 py-3.5 text-base font-bold text-[#F5EBDA] bg-[#0A1530] rounded-xl hover:bg-[#13234d] border border-[#F6DDB0]/30 shadow-md min-h-[48px]"
              >
                <span>Get Started Free</span>
                <ArrowUpRight className="w-4 h-4 text-[#F6DDB0]" />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
