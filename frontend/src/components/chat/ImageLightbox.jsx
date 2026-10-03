import React, { useEffect } from "react";
import { ExternalLink, X } from "lucide-react";

const ImageLightbox = ({ src, onClose }) => {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div
      data-lightbox
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="animate-pop fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
    >
      <div className="absolute right-4 top-4 flex gap-2">
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          aria-label="Open original"
          className="btn btn-circle btn-sm border-0 bg-white/15 text-white hover:bg-white/25"
        >
          <ExternalLink className="size-4" />
        </a>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="btn btn-circle btn-sm border-0 bg-white/15 text-white hover:bg-white/25"
        >
          <X className="size-4" />
        </button>
      </div>

      <img
        src={src}
        alt="Full size attachment"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90dvh] max-w-[95vw] rounded-2xl object-contain shadow-2xl"
      />
    </div>
  );
};

export default ImageLightbox;