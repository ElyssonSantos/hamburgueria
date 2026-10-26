import { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "./ui/button";

interface MediaLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  mediaUrl: string;
  mediaType: "image" | "video";
  title?: string | null;
}

export const MediaLightbox = ({ isOpen, onClose, mediaUrl, mediaType, title }: MediaLightboxProps) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 text-white hover:bg-white/10 z-10"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </Button>

      <div
        className="relative max-w-7xl max-h-[90vh] w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {mediaType === "video" ? (
          <video
            src={mediaUrl}
            controls
            autoPlay
            className="w-full h-auto max-h-[90vh] rounded-lg shadow-2xl"
          >
            Seu navegador não suporta vídeos.
          </video>
        ) : (
          <img
            src={mediaUrl}
            alt={title || "Imagem"}
            className="w-full h-auto max-h-[90vh] object-contain rounded-lg shadow-2xl"
          />
        )}
        
        {title && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
            <h3 className="text-white text-xl font-bold">{title}</h3>
          </div>
        )}
      </div>
    </div>
  );
};