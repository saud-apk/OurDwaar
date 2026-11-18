/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Building2, 
  MapPin, 
  Plus, 
  Check, 
  X, 
  AlertTriangle, 
  ArrowLeft, 
  Save, 
  Copy, 
  Download, 
  MessageCircle, 
  ExternalLink, 
  Eye, 
  Sparkles,
  RefreshCw,
  Share2,
  Phone
} from "lucide-react";
import { DwwaarUser } from "../services/authService.ts";
import { Project, ProjectInput, projectService } from "../services/projectService.ts";
import { ProjectPhonePreview, PreviewData } from "./ProjectPhonePreview.tsx";
import { ShareModal } from "./ShareModal.tsx";
import { LOGO_PATH } from "../constants.ts";

interface ProjectFormProps {
  mode: "create" | "edit";
  slug?: string;
  currentUser: DwwaarUser;
  currentProjectCount: number;
  onSuccess: (savedProject: Project) => void;
  onCancel: () => void;
  onShowUpgradeModal: () => void;
  onShowToast: (msg: string) => void;
}

const BHK_OPTIONS = ["1 BHK", "2 BHK", "3 BHK", "4+ BHK"];

const AMENITY_OPTIONS = [
  "Parking",
  "Lift",
  "Garden",
  "Gym",
  "Security",
  "Power backup",
  "Clubhouse",
  "Swimming pool",
  "CCTV",
];

export const ProjectForm: React.FC<ProjectFormProps> = ({
  mode,
  slug,
  currentUser,
  currentProjectCount,
  onSuccess,
  onCancel,
  onShowUpgradeModal,
  onShowToast,
}) => {
  const [loadingInitial, setLoadingInitial] = useState(mode === "edit");
  const [initialError, setInitialError] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [builder, setBuilder] = useState("");
  const [location, setLocation] = useState("");
  const [mapLink, setMapLink] = useState("");
  const [rera, setRera] = useState("");
  const [price, setPrice] = useState<string>("");
  const [priceUnit, setPriceUnit] = useState<"Lakh" | "Crore">("Lakh");
  const [bhk, setBhk] = useState<string[]>(["2 BHK", "3 BHK"]);
  const [carpetArea, setCarpetArea] = useState<string>("");
  const [status, setStatus] = useState<"available" | "sold">("available");
  const [amenities, setAmenities] = useState<string[]>(["Parking", "Lift", "Security"]);
  const [whatsapp, setWhatsapp] = useState<string>(
    currentUser.mobile ? currentUser.mobile.replace(/\D/g, "").slice(-10) : ""
  );

  // Form State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  // Mobile Preview Sheet Toggle
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  // Share Modal State (shown after successful save)
  const [savedProjectForShare, setSavedProjectForShare] = useState<Project | null>(null);

  // Track initial values to detect unsaved changes
  const initialValuesRef = useRef<string>("");

  // Load project for edit mode
  useEffect(() => {
    if (mode === "edit" && slug) {
      let isMounted = true;
      setLoadingInitial(true);
      setInitialError(null);

      projectService.getProjectBySlug(slug).then((project) => {
        if (!isMounted) return;
        if (!project) {
          setInitialError("Project not found.");
          onShowToast("Project not found.");
          setTimeout(() => onCancel(), 1500);
          return;
        }

        // Verify ownership
        if (project.ownerId !== currentUser.id) {
          setInitialError("You do not have permission to edit this project.");
          onShowToast("You do not have permission to edit this project.");
          setTimeout(() => onCancel(), 1500);
          return;
        }

        // Populate fields
        setName(project.name || "");
        setBuilder(project.builder || "");
        setLocation(project.location || "");
        setMapLink(project.mapLink || "");
        setRera(project.rera || "");

        // Price handling
        if (typeof project.price === "number") {
          setPrice(project.price.toString());
        } else if (typeof project.price === "string") {
          // If price was string like "85", or "₹85 Lakh"
          const match = project.price.match(/(\d+(\.\d+)?)/);
          setPrice(match ? match[0] : "");
        } else {
          setPrice("");
        }

        setPriceUnit(project.priceUnit === "Crore" ? "Crore" : "Lakh");
        setBhk(project.bhk && project.bhk.length > 0 ? project.bhk : ["2 BHK"]);
        setCarpetArea(project.carpetArea ? project.carpetArea.toString() : "");
        setStatus(project.status === "sold" ? "sold" : "available");
        setAmenities(project.amenities || []);
        setWhatsapp(
          project.whatsapp
            ? project.whatsapp.replace(/\D/g, "").slice(-10)
            : (currentUser.mobile || "").replace(/\D/g, "").slice(-10)
        );

        initialValuesRef.current = JSON.stringify({
          name: project.name || "",
          builder: project.builder || "",
          location: project.location || "",
          mapLink: project.mapLink || "",
          rera: project.rera || "",
          price: project.price || "",
          priceUnit: project.priceUnit || "Lakh",
          bhk: project.bhk || [],
          carpetArea: project.carpetArea || "",
          status: project.status || "available",
          amenities: project.amenities || [],
          whatsapp: project.whatsapp || "",
        });

        setLoadingInitial(false);
      }).catch((err) => {
        console.error("Error loading project for edit:", err);
        if (isMounted) {
          setInitialError("Failed to load project details.");
          setLoadingInitial(false);
        }
      });

      return () => {
        isMounted = false;
      };
    } else {
      // Create mode
      initialValuesRef.current = JSON.stringify({
        name: "",
        builder: "",
        location: "",
        mapLink: "",
        rera: "",
        price: "",
        priceUnit: "Lakh",
        bhk: ["2 BHK", "3 BHK"],
        carpetArea: "",
        status: "available",
        amenities: ["Parking", "Lift", "Security"],
        whatsapp: (currentUser.mobile || "").replace(/\D/g, "").slice(-10),
      });
    }
  }, [mode, slug, currentUser.id]);

  // Check if form is dirty
  const isDirty = useMemo(() => {
    if (!initialValuesRef.current) return false;
    const current = JSON.stringify({
      name,
      builder,
      location,
      mapLink,
      rera,
      price,
      priceUnit,
      bhk,
      carpetArea,
      status,
      amenities,
      whatsapp,
    });
    return current !== initialValuesRef.current;
  }, [name, builder, location, mapLink, rera, price, priceUnit, bhk, carpetArea, status, amenities, whatsapp]);

  // Warn before browser unload if dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && !savedProjectForShare) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty, savedProjectForShare]);

  // Validation
  const errors = useMemo(() => {
    const errs: Record<string, string> = {};
    if (!name.trim()) {
      errs.name = "Project name is required";
    } else if (name.trim().length < 2) {
      errs.name = "Project name must be at least 2 characters";
    }

    if (!location.trim()) {
      errs.location = "Location is required";
    } else if (location.trim().length < 2) {
      errs.location = "Location must be at least 2 characters";
    }

    const numPrice = parseFloat(price);
    if (!price || isNaN(numPrice) || numPrice <= 0) {
      errs.price = "Enter a valid positive price";
    }

    if (whatsapp) {
      const cleanWp = whatsapp.replace(/\D/g, "");
      if (!/^[6-9]\d{9}$/.test(cleanWp)) {
        errs.whatsapp = "Enter a valid 10-digit number starting with 6, 7, 8, or 9";
      }
    }

    if (mapLink.trim()) {
      if (!mapLink.startsWith("http://") && !mapLink.startsWith("https://")) {
        errs.mapLink = "Link must begin with https:// or http://";
      }
    }

    return errs;
  }, [name, location, price, whatsapp, mapLink]);

  const isValid = Object.keys(errors).length === 0;

  // Toggle BHK chip
  const toggleBhk = (chip: string) => {
    setBhk((prev) =>
      prev.includes(chip) ? prev.filter((item) => item !== chip) : [...prev, chip]
    );
  };

  // Toggle Amenity chip
  const toggleAmenity = (chip: string) => {
    setAmenities((prev) =>
      prev.includes(chip) ? prev.filter((item) => item !== chip) : [...prev, chip]
    );
  };

  // Mobile number input formatting
  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const digitsOnly = raw.replace(/\D/g, "");
    let clean = digitsOnly;
    if (clean.length > 10 && clean.startsWith("91")) {
      clean = clean.slice(2);
    }
    setWhatsapp(clean.slice(0, 10));
  };

  // Handle Back / Cancel click with unsaved changes prompt
  const handleCancelClick = () => {
    if (isDirty) {
      setShowDiscardModal(true);
    } else {
      onCancel();
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // If form is not valid, mark all fields as touched to show inline errors immediately
    if (!isValid) {
      setTouched({
        name: true,
        location: true,
        price: true,
        whatsapp: true,
        mapLink: true,
      });
      const firstErrorMessage = Object.values(errors)[0] || "Please fill in all required fields marked with *";
      setSubmitError(firstErrorMessage);
      return;
    }

    if (isSubmitting) return;

    // Free plan cap check on create
    if (mode === "create" && currentProjectCount >= 2) {
      setSubmitError("You've reached the Free plan limit of 2 projects.");
      onShowUpgradeModal();
      return;
    }

    setIsSubmitting(true);

    const projectPayload: ProjectInput = {
      name: name.trim(),
      builder: builder.trim() || undefined,
      location: location.trim(),
      mapLink: mapLink.trim() || undefined,
      rera: rera.trim() || undefined,
      price: parseFloat(price) || price,
      priceUnit,
      bhk: bhk.length > 0 ? bhk : ["1 BHK", "2 BHK"],
      carpetArea: carpetArea ? parseFloat(carpetArea) || carpetArea : undefined,
      status,
      amenities,
      whatsapp: whatsapp.trim() || (currentUser.mobile || "").replace(/\D/g, "").slice(-10),
    };

    try {
      let savedProject: Project;
      if (mode === "create") {
        savedProject = await projectService.createProject(projectPayload, currentUser.id);
        onShowToast("Project created successfully!");
      } else {
        if (!slug) throw new Error("Missing project slug");
        await projectService.updateProject(slug, projectPayload, currentUser.id);
        savedProject = {
          ...projectPayload,
          id: slug,
          slug,
          ownerId: currentUser.id,
          views: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        onShowToast("Project updated successfully!");
      }

      // Open Share Modal using the real saved project's slug
      setSavedProjectForShare(savedProject);
      onSuccess(savedProject);
    } catch (err: any) {
      console.error("Failed to save project:", err);
      const friendlyMessage = err?.message || "Failed to save project. Please check your network and try again.";
      setSubmitError(friendlyMessage);
      onShowToast(friendlyMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Preview Data for sticky phone mockup
  const previewData: PreviewData = useMemo(() => {
    return {
      name: name.trim() || "Skyline Heights",
      builder: builder.trim() || undefined,
      location: location.trim() || "Worli Sea Face, Mumbai",
      mapLink: mapLink.trim() || undefined,
      rera: rera.trim() || undefined,
      price: price || "85",
      priceUnit,
      bhk,
      carpetArea: carpetArea || undefined,
      status,
      amenities,
      whatsapp: whatsapp || currentUser.mobile || "",
    };
  }, [name, builder, location, mapLink, rera, price, priceUnit, bhk, carpetArea, status, amenities, whatsapp, currentUser.mobile]);

  // Loading state for edit mode
  if (loadingInitial) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <RefreshCw className="w-8 h-8 text-[#0A1530] animate-spin mb-3" />
        <p className="text-sm font-semibold text-[#0A1530]/70">Loading project details...</p>
      </div>
    );
  }

  // Error loading state
  if (initialError) {
    return (
      <div className="max-w-md mx-auto p-8 bg-rose-50 border border-rose-200 rounded-3xl text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-rose-600 mx-auto" />
        <h3 className="text-lg font-bold text-rose-900">{initialError}</h3>
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0A1530] text-[#F5EBDA] font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>
    );
  }


  return (
    <div className="w-full">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#0A1530]/8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCancelClick}
            className="p-2 rounded-xl bg-white border border-[#0A1530]/10 hover:bg-[#F5EBDA] text-[#0A1530] transition-colors"
            title="Back to projects"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0A1530]">
              {mode === "create" ? "Create Smart Link" : `Edit Project`}
            </h1>
            <p className="text-xs sm:text-sm text-[#0A1530]/65 mt-0.5">
              {mode === "create"
                ? "Enter project specifications to generate a live link and QR code."
                : `Editing ${name || slug}. Changes update the live link instantly.`}
            </p>
          </div>
        </div>

        {/* Mobile Preview Trigger Button (Only visible on screens < 1024px) */}
        <div className="lg:hidden">
          <button
            type="button"
            onClick={() => setShowMobilePreview(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0A1530] text-[#F5EBDA] font-bold text-xs shadow-xs min-h-[40px]"
          >
            <Eye className="w-4 h-4 text-[#F6DDB0]" />
            <span>Preview</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Form (Left) + Sticky Phone Mockup (Right on Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ================================================================= */}
        {/* FORM SECTION (7 Cols on Desktop)                                  */}
        {/* ================================================================= */}
        <form onSubmit={handleSubmit} noValidate className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#0A1530]/10 shadow-xs space-y-6">
            
            {/* 1. Basic Details */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#0A1530]/70 pb-2 border-b border-[#0A1530]/6 flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-[#0A1530]" />
                <span>Project Identity</span>
              </h2>

              {/* Project Name (Required) */}
              <div>
                <label className="block text-xs font-bold text-[#0A1530] mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setTouched((p) => ({ ...p, name: true }));
                  }}
                  onBlur={() => setTouched((p) => ({ ...p, name: true }))}
                  placeholder="e.g. Lodha Bellissimo"
                  className={`w-full h-11 px-3.5 rounded-xl bg-[#FBF7F0] border text-sm text-[#0A1530] font-medium outline-none focus:ring-2 transition-all ${
                    touched.name && errors.name
                      ? "border-rose-500 focus:ring-rose-200"
                      : "border-[#0A1530]/15 focus:ring-[#0A1530]/20"
                  }`}
                />
                {touched.name && errors.name && (
                  <p className="text-xs text-rose-600 font-medium mt-1">{errors.name}</p>
                )}
              </div>

              {/* Builder Name (Optional) */}
              <div>
                <label className="block text-xs font-bold text-[#0A1530] mb-1">
                  Builder / Developer Name <span className="font-normal text-[#0A1530]/50">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={builder}
                  onChange={(e) => setBuilder(e.target.value)}
                  placeholder="e.g. Lodha Group"
                  className="w-full h-11 px-3.5 rounded-xl bg-[#FBF7F0] border border-[#0A1530]/15 text-sm text-[#0A1530] font-medium outline-none focus:ring-2 focus:ring-[#0A1530]/20"
                />
              </div>

              {/* Location (Required) */}
              <div>
                <label className="block text-xs font-bold text-[#0A1530] mb-1">
                  Location / Area *
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setTouched((p) => ({ ...p, location: true }));
                  }}
                  onBlur={() => setTouched((p) => ({ ...p, location: true }))}
                  placeholder="e.g. Mahalaxmi, South Mumbai"
                  className={`w-full h-11 px-3.5 rounded-xl bg-[#FBF7F0] border text-sm text-[#0A1530] font-medium outline-none focus:ring-2 transition-all ${
                    touched.location && errors.location
                      ? "border-rose-500 focus:ring-rose-200"
                      : "border-[#0A1530]/15 focus:ring-[#0A1530]/20"
                  }`}
                />
                {touched.location && errors.location && (
                  <p className="text-xs text-rose-600 font-medium mt-1">{errors.location}</p>
                )}
              </div>

              {/* Google Maps Link (Optional) */}
              <div>
                <label className="block text-xs font-bold text-[#0A1530] mb-1">
                  Google Maps Link <span className="font-normal text-[#0A1530]/50">(Optional)</span>
                </label>
                <input
                  type="url"
                  value={mapLink}
                  onChange={(e) => {
                    setMapLink(e.target.value);
                    setTouched((p) => ({ ...p, mapLink: true }));
                  }}
                  placeholder="https://maps.google.com/?q=..."
                  className={`w-full h-11 px-3.5 rounded-xl bg-[#FBF7F0] border text-sm text-[#0A1530] font-medium outline-none focus:ring-2 transition-all font-mono text-xs ${
                    touched.mapLink && errors.mapLink
                      ? "border-rose-500 focus:ring-rose-200"
                      : "border-[#0A1530]/15 focus:ring-[#0A1530]/20"
                  }`}
                />
                {touched.mapLink && errors.mapLink && (
                  <p className="text-xs text-rose-600 font-medium mt-1">{errors.mapLink}</p>
                )}
              </div>

              {/* RERA Number (Optional) */}
              <div>
                <label className="block text-xs font-bold text-[#0A1530] mb-1">
                  RERA Registration Number <span className="font-normal text-[#0A1530]/50">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={rera}
                  onChange={(e) => setRera(e.target.value)}
                  placeholder="e.g. P51900001234"
                  className="w-full h-11 px-3.5 rounded-xl bg-[#FBF7F0] border border-[#0A1530]/15 text-sm text-[#0A1530] font-mono outline-none focus:ring-2 focus:ring-[#0A1530]/20"
                />
              </div>
            </div>

            {/* 2. Price & Units */}
            <div className="space-y-4 pt-4 border-t border-[#0A1530]/8">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#0A1530]/70 pb-2 border-b border-[#0A1530]/6">
                Pricing & Configurations
              </h2>

              {/* Price input + Unit dropdown */}
              <div>
                <label className="block text-xs font-bold text-[#0A1530] mb-1">
                  Starting Price *
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#0A1530]/60">
                      ₹
                    </span>
                    <input
                      type="number"
                      step="any"
                      min="0.01"
                      required
                      value={price}
                      onChange={(e) => {
                        setPrice(e.target.value);
                        setTouched((p) => ({ ...p, price: true }));
                      }}
                      onBlur={() => setTouched((p) => ({ ...p, price: true }))}
                      placeholder={priceUnit === "Crore" ? "1.85" : "85"}
                      className={`w-full h-11 pl-8 pr-3.5 rounded-xl bg-[#FBF7F0] border text-sm text-[#0A1530] font-bold outline-none focus:ring-2 transition-all font-mono ${
                        touched.price && errors.price
                          ? "border-rose-500 focus:ring-rose-200"
                          : "border-[#0A1530]/15 focus:ring-[#0A1530]/20"
                      }`}
                    />
                  </div>

                  <select
                    value={priceUnit}
                    onChange={(e) => setPriceUnit(e.target.value as "Lakh" | "Crore")}
                    className="h-11 px-4 rounded-xl bg-[#FBF7F0] border border-[#0A1530]/15 text-sm text-[#0A1530] font-bold outline-none focus:ring-2 focus:ring-[#0A1530]/20 shrink-0 cursor-pointer"
                  >
                    <option value="Lakh">Lakh</option>
                    <option value="Crore">Crore</option>
                  </select>
                </div>
                {touched.price && errors.price && (
                  <p className="text-xs text-rose-600 font-medium mt-1">{errors.price}</p>
                )}
              </div>

              {/* BHK Options (Multi-select Chips) */}
              <div>
                <label className="block text-xs font-bold text-[#0A1530] mb-1.5">
                  BHK Options
                </label>
                <div className="flex flex-wrap gap-2">
                  {BHK_OPTIONS.map((chip) => {
                    const isSelected = bhk.includes(chip);
                    return (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => toggleBhk(chip)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border min-h-[38px] ${
                          isSelected
                            ? "bg-[#0A1530] text-[#F5EBDA] border-[#0A1530] shadow-2xs"
                            : "bg-[#FBF7F0] text-[#0A1530] border-[#0A1530]/15 hover:bg-[#F5EBDA]"
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 inline-block mr-1 text-[#F6DDB0]" />}
                        {chip}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Carpet Area in sq ft (Optional) */}
              <div>
                <label className="block text-xs font-bold text-[#0A1530] mb-1">
                  Carpet Area (sq. ft) <span className="font-normal text-[#0A1530]/50">(Optional)</span>
                </label>
                <input
                  type="number"
                  min="50"
                  value={carpetArea}
                  onChange={(e) => setCarpetArea(e.target.value)}
                  placeholder="e.g. 1150"
                  className="w-full h-11 px-3.5 rounded-xl bg-[#FBF7F0] border border-[#0A1530]/15 text-sm text-[#0A1530] font-mono outline-none focus:ring-2 focus:ring-[#0A1530]/20"
                />
              </div>

              {/* Status Toggle (Available / Sold) */}
              <div>
                <label className="block text-xs font-bold text-[#0A1530] mb-1.5">
                  Availability Status
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setStatus("available")}
                    className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 min-h-[44px] ${
                      status === "available"
                        ? "bg-emerald-500 text-white border-emerald-600 shadow-xs"
                        : "bg-[#FBF7F0] text-[#0A1530] border-[#0A1530]/15 hover:bg-[#F5EBDA]"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-white" />
                    <span>Available</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus("sold")}
                    className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 min-h-[44px] ${
                      status === "sold"
                        ? "bg-rose-600 text-white border-rose-700 shadow-xs"
                        : "bg-[#FBF7F0] text-[#0A1530] border-[#0A1530]/15 hover:bg-[#F5EBDA]"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-white/80" />
                    <span>Sold Out</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Amenities Multi-select Chips */}
            <div className="space-y-4 pt-4 border-t border-[#0A1530]/8">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#0A1530]/70 pb-2 border-b border-[#0A1530]/6">
                Amenities & Features
              </h2>

              <div className="flex flex-wrap gap-2">
                {AMENITY_OPTIONS.map((chip) => {
                  const isSelected = amenities.includes(chip);
                  return (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => toggleAmenity(chip)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border min-h-[38px] flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-[#0A1530] text-[#F5EBDA] border-[#0A1530] shadow-2xs font-bold"
                          : "bg-[#FBF7F0] text-[#0A1530] border-[#0A1530]/15 hover:bg-[#F5EBDA]"
                      }`}
                    >
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 text-[#F6DDB0]" />
                      ) : (
                        <Plus className="w-3.5 h-3.5 text-[#0A1530]/40" />
                      )}
                      <span>{chip}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. WhatsApp Number for Enquiries */}
            <div className="space-y-4 pt-4 border-t border-[#0A1530]/8">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#0A1530]/70 pb-2 border-b border-[#0A1530]/6 flex items-center gap-2">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Buyer Inquiries Contact</span>
              </h2>

              <div>
                <label className="block text-xs font-bold text-[#0A1530] mb-1">
                  WhatsApp Number for Inquiries *
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-xs font-bold text-[#0A1530]/60 select-none">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    value={whatsapp}
                    onChange={handleWhatsappChange}
                    onBlur={() => setTouched((p) => ({ ...p, whatsapp: true }))}
                    placeholder="9876543210"
                    maxLength={10}
                    className={`w-full h-11 pl-12 pr-3.5 rounded-xl bg-[#FBF7F0] border text-sm text-[#0A1530] font-bold outline-none focus:ring-2 font-mono ${
                      touched.whatsapp && errors.whatsapp
                        ? "border-rose-500 focus:ring-rose-200"
                        : "border-[#0A1530]/15 focus:ring-[#0A1530]/20"
                    }`}
                  />
                </div>
                {touched.whatsapp && errors.whatsapp ? (
                  <p className="text-xs text-rose-600 font-medium mt-1">{errors.whatsapp}</p>
                ) : (
                  <p className="text-[11px] text-[#0A1530]/50 mt-1">
                    Prefilled from your profile. Direct buyer WhatsApp clicks route to this number.
                  </p>
                )}
              </div>
            </div>

            {/* Submit Error Banner if any */}
            {submitError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-[#0A1530]/8 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleCancelClick}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gray-100 text-[#0A1530] font-semibold text-xs sm:text-sm hover:bg-gray-200 transition-colors min-h-[44px] cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 rounded-xl bg-[#0A1530] text-[#F5EBDA] font-bold text-xs sm:text-sm hover:bg-[#14234d] disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-2 min-h-[44px] cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 text-[#F6DDB0] animate-spin" />
                    <span>Saving Project...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-[#F6DDB0]" />
                    <span>{mode === "create" ? "Generate Smart Link & QR" : "Save Changes"}</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </form>

        {/* ================================================================= */}
        {/* DESKTOP STICKY PHONE PREVIEW (5 Cols on Desktop)                  */}
        {/* ================================================================= */}
        <div className="hidden lg:block lg:col-span-5 sticky top-8">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-[#0A1530]/60">
              <Eye className="w-3.5 h-3.5" />
              <span>Live Smart Link Preview</span>
            </div>
            <ProjectPhonePreview data={previewData} />
            <p className="text-[11px] text-[#0A1530]/50 mt-3 text-center max-w-xs">
              Updates in real-time as you type. Generated page is lightweight and opens in sub-seconds.
            </p>
          </div>
        </div>

      </div>

      {/* =================================================================== */}
      {/* MOBILE FULL-SCREEN PREVIEW SHEET                                    */}
      {/* =================================================================== */}
      {showMobilePreview && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center p-4 lg:hidden">
          <div className="w-full max-w-sm flex items-center justify-between pb-3 text-white">
            <span className="text-xs font-bold tracking-wider uppercase flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-[#F6DDB0]" />
              Live Phone Preview
            </span>
            <button
              type="button"
              onClick={() => setShowMobilePreview(false)}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white"
              aria-label="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="max-h-[90vh] overflow-y-auto">
            <ProjectPhonePreview data={previewData} />
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* UNSAVED CHANGES CONFIRMATION MODAL                                  */}
      {/* =================================================================== */}
      {showDiscardModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 border border-[#0A1530]/10 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-[#0A1530]">Discard Unsaved Changes?</h3>
              <p className="text-xs text-[#0A1530]/70 mt-1">
                You have modifications that haven't been saved. If you leave now, your changes will be lost.
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDiscardModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 text-[#0A1530] font-semibold text-xs hover:bg-gray-200"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDiscardModal(false);
                  onCancel();
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700"
              >
                Discard & Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* POST-SAVE SHARE MODAL (Copy Link, QR PNG, Share on WhatsApp)        */}
      {/* =================================================================== */}
      <ShareModal
        project={savedProjectForShare}
        isOpen={!!savedProjectForShare}
        onClose={() => {
          setSavedProjectForShare(null);
          onCancel();
        }}
        onShowToast={onShowToast}
        title={mode === "create" ? "Smart Link Created!" : "Project Updated!"}
        subtitle={
          savedProjectForShare
            ? `${savedProjectForShare.name} is live and ready to share anywhere.`
            : undefined
        }
      />

    </div>
  );
};
