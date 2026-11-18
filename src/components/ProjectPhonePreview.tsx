/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Building2, 
  MapPin, 
  ShieldCheck, 
  MessageCircle, 
  Sparkles,
  ExternalLink,
  Car,
  Trees,
  Dumbbell,
  Shield,
  Zap,
  Waves,
  Video,
  Layers,
  ArrowUpRight
} from "lucide-react";
import { formatProjectPrice } from "../services/projectService.ts";

export interface PreviewData {
  name: string;
  builder?: string;
  location: string;
  mapLink?: string;
  rera?: string;
  price: number | string;
  priceUnit: "Lakh" | "Crore";
  bhk: string[];
  carpetArea?: string | number;
  status: "available" | "sold";
  amenities: string[];
  whatsapp: string;
}

interface ProjectPhonePreviewProps {
  data: PreviewData;
}

// Map amenity to appropriate icon
const amenityIconMap: Record<string, React.ReactNode> = {
  Parking: <Car className="w-3.5 h-3.5" />,
  Lift: <ArrowUpRight className="w-3.5 h-3.5" />,
  Garden: <Trees className="w-3.5 h-3.5" />,
  Gym: <Dumbbell className="w-3.5 h-3.5" />,
  Security: <Shield className="w-3.5 h-3.5" />,
  "Power backup": <Zap className="w-3.5 h-3.5" />,
  Clubhouse: <Building2 className="w-3.5 h-3.5" />,
  "Swimming pool": <Waves className="w-3.5 h-3.5" />,
  CCTV: <Video className="w-3.5 h-3.5" />,
};

export const ProjectPhonePreview: React.FC<ProjectPhonePreviewProps> = ({ data }) => {
  const isAvailable = data.status === "available";
  const displayPrice = data.price ? formatProjectPrice(data.price, data.priceUnit) : "₹-- " + data.priceUnit;

  const whatsappHref = data.whatsapp
    ? `https://wa.me/91${data.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
        `Hi, I want to inquire about ${data.name || "your project"} in ${data.location || "your location"}.`
      )}`
    : "#";

  return (
    <div className="w-[300px] sm:w-[320px] bg-[#0E1526] rounded-[44px] p-3 shadow-2xl border-4 border-[#1E293B] relative select-none">
      {/* Phone Notch / Speaker Slot */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-[#0E1526] rounded-full z-20 flex items-center justify-center">
        <div className="w-10 h-1 bg-white/20 rounded-full" />
        <div className="w-2 h-2 rounded-full bg-blue-500/40 ml-2" />
      </div>

      {/* Screen Inner */}
      <div className="bg-[#FBF7F0] rounded-[36px] overflow-hidden text-[#0A1530] flex flex-col h-[580px] border border-black/5 relative font-sans">
        
        {/* Scrollable Screen Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar pb-16">
          
          {/* Top Arch-Shaped Visual Placeholder (No Photo Uploads) */}
          <div className="relative h-44 bg-gradient-to-b from-[#0A1530] via-[#102046] to-[#0A1530] flex items-center justify-center overflow-hidden">
            {/* Subtle warm glow through the arch */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(246,221,176,0.22)_0%,transparent_70%)]" />

            {/* Arch Door Motif */}
            <div className="w-24 h-32 rounded-t-full border border-[#F6DDB0]/30 bg-[#0E1B38]/60 flex flex-col items-center justify-center p-2 relative shadow-inner">
              <div className="w-16 h-24 rounded-t-full border border-[#F6DDB0]/50 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-[#F6DDB0]" />
              </div>
            </div>

            {/* Status Tag Overlay */}
            <div className="absolute top-4 left-3.5 z-10">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-md ${
                  isAvailable ? "bg-emerald-500 text-white" : "bg-rose-600 text-white"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isAvailable ? "bg-white animate-pulse" : "bg-white/80"
                  }`}
                />
                <span>{isAvailable ? "Available" : "Sold"}</span>
              </span>
            </div>

            {/* Dwwaar Verified Badge */}
            <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-center justify-between text-[10px] text-[#F5EBDA]/70 font-medium">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#F6DDB0]" />
                Dwwaar Verified
              </span>
              <span className="font-mono text-[9px]">dwwaar.link</span>
            </div>
          </div>

          {/* Main Property Info */}
          <div className="p-4 space-y-3.5">
            {/* Project & Builder Name */}
            <div>
              <h3 className="font-extrabold text-lg tracking-tight text-[#0A1530] leading-snug line-clamp-1">
                {data.name || "Project Name"}
              </h3>
              {data.builder && (
                <p className="text-[11px] text-[#0A1530]/65 font-medium mt-0.5">
                  by <span className="font-bold text-[#0A1530]">{data.builder}</span>
                </p>
              )}
            </div>

            {/* Price & Location */}
            <div className="flex items-baseline justify-between gap-2 border-b border-[#0A1530]/8 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#0A1530]/50 tracking-wider block">
                  Starting Price
                </span>
                <span className="text-xl font-extrabold text-[#0A1530] tracking-tight">
                  {displayPrice}
                </span>
              </div>

              {data.carpetArea && (
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-[#0A1530]/50 tracking-wider block">
                    Carpet Area
                  </span>
                  <span className="text-xs font-bold text-[#0A1530]">
                    {data.carpetArea} sq.ft
                  </span>
                </div>
              )}
            </div>

            {/* Location & Map Link */}
            <div className="flex items-start justify-between gap-2 text-xs text-[#0A1530]/75">
              <div className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#0A1530]/60 shrink-0 mt-0.5" />
                <span className="line-clamp-2 text-[11px] font-medium leading-relaxed">
                  {data.location || "Location (e.g. Bandra West, Mumbai)"}
                </span>
              </div>
              {data.mapLink && (
                <a
                  href={data.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-bold text-[#0A1530] underline flex items-center gap-0.5 shrink-0 hover:text-blue-600"
                >
                  Map <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </div>

            {/* RERA Badge (ONLY when present) */}
            {data.rera && (
              <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center gap-2 text-[11px] text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="truncate">
                  <span className="font-bold block text-[10px] uppercase tracking-wider text-emerald-800">
                    RERA Registered
                  </span>
                  <span className="font-mono text-[10px] truncate block text-emerald-950">
                    {data.rera}
                  </span>
                </div>
              </div>
            )}

            {/* BHK Configurations Chips */}
            {data.bhk && data.bhk.length > 0 && (
              <div>
                <span className="text-[10px] uppercase font-bold text-[#0A1530]/50 tracking-wider block mb-1.5">
                  Configurations
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {data.bhk.map((b, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-white border border-[#0A1530]/12 text-[11px] font-bold text-[#0A1530] shadow-2xs"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Amenities Chips */}
            {data.amenities && data.amenities.length > 0 && (
              <div>
                <span className="text-[10px] uppercase font-bold text-[#0A1530]/50 tracking-wider block mb-1.5">
                  Key Amenities
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {data.amenities.map((amenity, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white/80 border border-[#0A1530]/8 text-[10px] font-semibold text-[#0A1530]"
                    >
                      <span className="text-[#0A1530]/70">
                        {amenityIconMap[amenity] || <Sparkles className="w-3 h-3 text-[#0A1530]" />}
                      </span>
                      <span className="truncate">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Sticky Bottom WhatsApp Button */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-[#FBF7F0] via-[#FBF7F0] to-transparent pt-4">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              if (!data.whatsapp) e.preventDefault();
            }}
            className="w-full h-11 rounded-xl bg-[#25D366] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:bg-[#20BD5A] transition-colors"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Enquire on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};
