/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const LOGO_PATH = "/assets/aistudio/Midnight_Archway_Emblem_bd0560a0.png";

export const WHATSAPP_PHONE = "+91 73786 33612";
export const WHATSAPP_URL = "https://wa.me/917378633612?text=Hi%2C%20I%20want%20to%20know%20more%20about%20Dwwaar.";
export const INSTAGRAM_HANDLE = "@_flx.saud";
export const INSTAGRAM_URL = "https://instagram.com/_flx.saud";

export const NAV_LINKS = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export const PROBLEMS = [
  {
    id: "outdated-prices",
    title: "Outdated prices",
    subtitle: "Revisions create disputes",
    description:
      "When rate slabs revise, previously sent PDFs remain on client phones. Outdated numbers create friction, mistrust, and negotiation delays.",
    icon: "clock",
  },
  {
    id: "heavy-pdfs",
    title: "35MB PDF downloads",
    subtitle: "High drop-off before opening",
    description:
      "Buyers won't wait for massive files to download over mobile data. Pinch-zooming floor plans on phone screens ruins the first impression.",
    icon: "file-x",
  },
  {
    id: "no-view-tracking",
    title: "Zero visibility",
    subtitle: "No idea who opened your link",
    description:
      "Sent brochures vanish into thin air. You have no way to know whether the prospect reviewed the floor plans or deleted the file.",
    icon: "eye-off",
  },
];

export const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Add project details",
    description: "Enter configurations (1, 2, 3 BHK), carpet area, starting price slabs, floor plans, and verified RERA ID in 3 minutes.",
  },
  {
    step: "02",
    title: "Get your link & QR",
    description: "Receive your dedicated instant project microsite (dwwaar.link/project) and high-resolution print-ready vector QR.",
  },
  {
    step: "03",
    title: "Share on everywhere",
    description: "Share on WhatsApp, SMS, email, social bio, or print the QR on site hoardings, booth standees, and newspaper ads.",
  },
];

export const FEATURES = [
  {
    title: "Live unit inventory",
    description: "Mark units Available, On Hold, or Sold Out. Channel partners and direct buyers always see real-time inventory.",
    icon: "activity",
  },
  {
    title: "RERA verified badge",
    description: "Prominently showcase your verified RERA registration number and statutory approvals to establish instant buyer trust.",
    icon: "shield-check",
  },
  {
    title: "Share on everywhere",
    description: "One link that works everywhere: WhatsApp, SMS, Instagram bio, emails, websites, and offline printed QR codes.",
    icon: "share-2",
  },
  {
    title: "Print-ready vector QR",
    description: "Instant QR code ready for construction site hoardings, sales lounge reception standees, print brochures, and ads.",
    icon: "qr-code",
  },
  {
    title: "Photos & floor plans",
    description: "Interactive floor plan viewers and HD architectural galleries that open smoothly on any smartphone without downloads.",
    icon: "layout",
  },
  {
    title: "Mobile-first speed",
    description: "Instant sub-second loading with silky 60fps scrolling, optimized for Indian 4G/5G mobile networks.",
    icon: "smartphone",
  },
];

export const PRICING_PLANS = [
  {
    name: "Free",
    badge: "For Individual Projects",
    priceLabel: "₹0",
    priceSubtext: "Free forever · No credit card required",
    description: "Everything needed to replace PDF brochures for up to 2 active real estate projects.",
    features: [
      "2 live smart project links",
      "Print-ready QR code generation",
      "Share on everywhere (WhatsApp, SMS, Web, Print)",
      "Interactive floor plans & HD photos",
      "RERA compliance badge display",
      "Standard dwwaar.link custom address",
    ],
    ctaText: "Get Started Free",
    isPro: false,
  },
  {
    name: "Pro",
    badge: "For Real Estate Developers & Firms",
    priceLabel: "Coming soon",
    priceSubtext: "Early access waitlist open",
    description: "Built for developer marketing teams, multi-tower developments, and large channel partner brokerages.",
    features: [
      "Unlimited smart project links",
      "Live unit inventory management",
      "Real-time view tracking & lead analytics",
      "Multi-agent lead distribution",
      "Custom branded project domains",
      "Priority project onboarding & support",
    ],
    ctaText: "Join Pro Waitlist",
    isPro: true,
  },
];

export const FAQS = [
  {
    question: "How does a Dwwaar link replace a real estate PDF brochure?",
    answer:
      "Instead of sending a heavy 35MB PDF that takes forever to download and freezes when zoomed, Dwwaar gives you one lightweight link and QR code. It opens in under a second on any mobile phone, shows interactive floor plans, live pricing, and verified RERA details, and can be shared on everywhere.",
  },
  {
    question: "Can I update price slabs and sold inventory after sharing?",
    answer:
      "Yes. Any changes to unit prices, availability status, or floor plan drawings update immediately on the existing link and printed QR code. You never have to re-send files to channel partners or prospective buyers.",
  },
  {
    question: "Do home buyers need to download any app?",
    answer:
      "No app or sign-up is required. When buyers click your link from WhatsApp, SMS, or scan your QR code with their phone camera, the project page opens immediately in their default mobile browser.",
  },
  {
    question: "Where can I use the project QR code?",
    answer:
      "Everywhere in your offline marketing: construction site hoardings, building barricades, sales gallery standees, property exhibition booths, print ads, and visiting cards.",
  },
  {
    question: "Can real estate brokers use Dwwaar for multiple builder projects?",
    answer:
      "Yes. Brokers and channel partners can maintain separate smart links for each project they sell, ensuring every prospective buyer receives accurate, branded property details with one tap.",
  },
];
