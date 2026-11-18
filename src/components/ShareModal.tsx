/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { 
  X, 
  Copy, 
  Check, 
  Download, 
  MessageCircle, 
  QrCode as QrIcon, 
  AlertCircle,
  ExternalLink,
  Sparkles
} from "lucide-react";
import { Project, projectService, formatProjectPrice } from "../services/projectService.ts";

export interface ShareModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
  title?: string;
  subtitle?: string;
}

/**
 * Copies text to the clipboard with modern API and fallback to input/execCommand
 */
export async function copyTextSafely(text: string): Promise<boolean> {
  if (!text) return false;

  // Modern navigator.clipboard API
  if (typeof navigator !== "undefined" && navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (clipErr) {
      console.warn("navigator.clipboard.writeText was blocked or failed, falling back to input-select:", clipErr);
    }
  }

  // Fallback: document.execCommand('copy') via temporary textarea
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    // Keep off-screen and non-intrusive
    textArea.style.position = "fixed";
    textArea.style.top = "-9999px";
    textArea.style.left = "-9999px";
    textArea.style.opacity = "0";
    textArea.setAttribute("readonly", "");
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);

    if (successful) {
      return true;
    }
    throw new Error("document.execCommand copy returned false");
  } catch (fallbackErr) {
    console.error("Clipboard copy fallback error:", fallbackErr);
    throw fallbackErr;
  }
}

export const ShareModal: React.FC<ShareModalProps> = ({
  project,
  isOpen,
  onClose,
  onShowToast,
  title,
  subtitle,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [isGeneratingQr, setIsGeneratingQr] = useState<boolean>(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Compute public link for the project
  const publicUrl = project ? projectService.getPublicUrl(project.slug) : "";

  // Generate QR Code locally using qrcode package whenever modal opens for a project
  useEffect(() => {
    if (!isOpen || !project) {
      setQrDataUrl("");
      setQrError(null);
      setIsGeneratingQr(false);
      return;
    }

    let isCancelled = false;
    setIsGeneratingQr(true);
    setQrError(null);

    const generatedUrl = projectService.getPublicUrl(project.slug);

    QRCode.toDataURL(generatedUrl, {
      width: 360,
      margin: 2,
      color: {
        dark: "#0A1530",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "M",
    })
      .then((dataUrl) => {
        if (!isCancelled) {
          setQrDataUrl(dataUrl);
          setIsGeneratingQr(false);
        }
      })
      .catch((err: any) => {
        if (!isCancelled) {
          console.error("QR generation error:", err);
          const errMessage = err?.message || "Failed to generate QR code";
          setQrError(errMessage);
          setIsGeneratingQr(false);
          onShowToast(`QR code error: ${errMessage}`);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [isOpen, project?.slug]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !project) return null;

  // Handle Copy Link action
  const handleCopyLink = async () => {
    try {
      if (!publicUrl) {
        throw new Error("Link is not available for this project");
      }
      await copyTextSafely(publicUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
      onShowToast("Link copied to clipboard!");
    } catch (err: any) {
      console.error("Failed to copy link:", err);
      const errMsg = err?.message || "Could not copy link to clipboard";
      onShowToast(`Copy failed: ${errMsg}`);
    }
  };

  // Handle Download PNG action
  const handleDownloadQr = () => {
    try {
      if (!qrDataUrl) {
        const errorMsg = qrError || "QR code has not finished generating yet";
        console.error("QR download failed:", errorMsg);
        onShowToast(`Cannot download QR: ${errorMsg}`);
        return;
      }

      const fileName = `dwwaar-qr-${project.slug || "project"}.png`;
      const anchor = document.createElement("a");
      anchor.href = qrDataUrl;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      onShowToast("QR code PNG downloaded!");
    } catch (err: any) {
      console.error("Download PNG error:", err);
      const errMsg = err?.message || "Could not download QR image";
      onShowToast(`Download failed: ${errMsg}`);
    }
  };

  const formattedPrice = formatProjectPrice(project.price, project.priceUnit);
  const modalTitle = title || "Smart Link & QR Code";
  const modalSubtitle = subtitle || (
    <>
      <span className="font-bold text-[#0A1530]">{project.name}</span>
      {project.location ? ` • ${project.location}` : ""}
    </>
  );

  const whatsappShareText = `Explore ${project.name}${
    project.location ? ` in ${project.location}` : ""
  }${formattedPrice ? ` (${formattedPrice})` : ""} on Dwwaar: ${publicUrl}`;

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#0A1530]/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
    >
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 border border-[#0A1530]/10 shadow-2xl relative text-center animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-[#0A1530] hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon / Badge */}
        <div className="w-12 h-12 rounded-2xl bg-[#0A1530]/5 text-[#0A1530] flex items-center justify-center mx-auto mb-3 border border-[#0A1530]/10">
          <QrIcon className="w-6 h-6 text-[#0A1530]" />
        </div>

        {/* Modal Title & Subtitle */}
        <h3 id="share-modal-title" className="text-xl font-extrabold text-[#0A1530] tracking-tight">
          {modalTitle}
        </h3>
        <p className="text-xs text-[#0A1530]/70 mt-1 font-medium truncate px-4">
          {modalSubtitle}
        </p>

        {/* QR Code Container */}
        <div className="my-5 p-4 rounded-2xl bg-[#FBF7F0] border border-[#0A1530]/10 inline-block shadow-inner min-w-[210px] min-h-[210px] relative">
          {isGeneratingQr ? (
            <div className="w-48 h-48 flex flex-col items-center justify-center gap-2 text-xs text-[#0A1530]/60">
              <div className="w-6 h-6 border-2 border-[#0A1530] border-t-transparent rounded-full animate-spin" />
              <span>Generating QR...</span>
            </div>
          ) : qrError ? (
            <div className="w-48 h-48 flex flex-col items-center justify-center p-3 text-center bg-rose-50/80 rounded-xl border border-rose-200 text-rose-700">
              <AlertCircle className="w-6 h-6 mb-1 text-rose-600" />
              <span className="text-xs font-bold">QR generation failed</span>
              <span className="text-[10px] mt-1 text-rose-600/80 line-clamp-2">{qrError}</span>
              <button
                type="button"
                onClick={() => {
                  setQrError(null);
                  setIsGeneratingQr(true);
                  QRCode.toDataURL(publicUrl, { width: 360, margin: 2, color: { dark: "#0A1530", light: "#FFFFFF" } })
                    .then((url) => { setQrDataUrl(url); setIsGeneratingQr(false); })
                    .catch((e) => {
                      console.error("QR retry failed:", e);
                      setQrError(e.message || "Failed again");
                      setIsGeneratingQr(false);
                    });
                }}
                className="mt-2 px-2.5 py-1 text-[10px] font-bold bg-white border border-rose-300 rounded-md hover:bg-rose-100"
              >
                Retry QR
              </button>
            </div>
          ) : qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`QR Code for ${project.name}`}
              className="w-48 h-48 mx-auto rounded-lg shadow-xs"
            />
          ) : null}
        </div>

        {/* Full Visible Link Box (ALWAYS visible text, even if QR fails) */}
        <div className="mb-4 text-left">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[#0A1530]/60 block mb-1">
            Smart Link (Public)
          </label>
          <div className="p-2.5 rounded-xl bg-[#FBF7F0] border border-[#0A1530]/15 flex items-center justify-between gap-2">
            <span 
              className="text-xs font-mono text-[#0A1530] font-semibold truncate select-all"
              title={publicUrl}
            >
              {publicUrl}
            </span>
            <button
              type="button"
              onClick={handleCopyLink}
              className="p-1.5 rounded-lg text-[#0A1530]/70 hover:text-[#0A1530] hover:bg-white transition-colors shrink-0"
              title="Copy link to clipboard"
            >
              {copiedLink ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Action Buttons: Copy Link & Download PNG */}
        <div className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2.5">
            {/* Copy Link Button */}
            <button
              type="button"
              onClick={handleCopyLink}
              className="py-2.5 px-3 rounded-xl bg-white border border-[#0A1530]/20 text-[#0A1530] font-bold text-xs hover:bg-[#F5EBDA] transition-all flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>

            {/* Download PNG Button */}
            <button
              type="button"
              onClick={handleDownloadQr}
              disabled={isGeneratingQr || !qrDataUrl}
              className="py-2.5 px-3 rounded-xl bg-[#0A1530] text-[#F5EBDA] font-bold text-xs hover:bg-[#14234d] disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 min-h-[44px] shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#F6DDB0]" />
              <span>Download PNG</span>
            </button>
          </div>

          {/* Share on WhatsApp Button */}
          <a
            href={`https://wa.me/?text=${encodeURIComponent(whatsappShareText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 rounded-xl bg-[#25D366] text-white font-bold text-xs hover:bg-[#20BD5A] transition-all flex items-center justify-center gap-2 shadow-xs min-h-[44px]"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Share on WhatsApp</span>
          </a>

          {/* Done / Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 text-xs text-[#0A1530]/70 hover:text-[#0A1530] font-semibold cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
