import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Play } from "lucide-react";
import { MediaLightbox } from "./MediaLightbox";

interface GalleryImage {
  id: string;
  image_url: string;
  title: string | null;
  description: string | null;
  media_type?: string;
}

export const Gallery = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<GalleryImage | null>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    const { data } = await supabase
      .from("gallery_images")
      .select("*")
      .order("order_index");

    if (data) setImages(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  if (images.length === 0) return null;

  return (
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Conheça Nosso Trabalho
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Veja um pouco do nosso ambiente, qualidade e dedicação em cada detalhe.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <div
              key={image.id}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
              onClick={() => {
                setSelectedMedia(image);
                setLightboxOpen(true);
              }}
            >
              {image.media_type === "video" ? (
                <div className="relative w-full h-80">
                  <video
                    src={image.image_url}
                    className="w-full h-full object-cover"
                    muted
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Play className="h-16 w-16 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ) : (
                <img
                  src={image.image_url}
                  alt={image.title || "Galeria"}
                  className="w-full h-80 object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
              )}
              {(image.title || image.description) && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  {image.title && (
                    <h3 className="text-white font-bold text-xl mb-2">{image.title}</h3>
                  )}
                  {image.description && (
                    <p className="text-white/90 text-sm">{image.description}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {selectedMedia && (
          <MediaLightbox
            isOpen={lightboxOpen}
            onClose={() => {
              setLightboxOpen(false);
              setSelectedMedia(null);
            }}
            mediaUrl={selectedMedia.image_url}
            mediaType={(selectedMedia.media_type as "image" | "video") || "image"}
            title={selectedMedia.title}
          />
        )}
      </div>
    </section>
  );
};