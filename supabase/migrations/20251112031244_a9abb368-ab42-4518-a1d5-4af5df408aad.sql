-- Adicionar campo de email no site_config
ALTER TABLE public.site_config ADD COLUMN IF NOT EXISTS email text;

-- Criar tabela de cupons de desconto
CREATE TABLE IF NOT EXISTS public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  type text NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value numeric NOT NULL CHECK (value > 0),
  expires_at timestamp with time zone,
  max_uses integer,
  current_uses integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Criar tabela de galeria de fotos
CREATE TABLE IF NOT EXISTS public.gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  title text,
  description text,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies para coupons
CREATE POLICY "Everyone can view active coupons"
ON public.coupons FOR SELECT
USING (active = true);

CREATE POLICY "Dono can manage coupons"
ON public.coupons FOR ALL
USING (has_role(auth.uid(), 'dono'::app_role));

CREATE POLICY "Gerente can manage coupons"
ON public.coupons FOR ALL
USING (has_role(auth.uid(), 'gerente'::app_role));

-- RLS Policies para gallery_images
CREATE POLICY "Everyone can view gallery"
ON public.gallery_images FOR SELECT
USING (true);

CREATE POLICY "Dono can manage gallery"
ON public.gallery_images FOR ALL
USING (has_role(auth.uid(), 'dono'::app_role));

-- Trigger para updated_at
CREATE TRIGGER update_coupons_updated_at
BEFORE UPDATE ON public.coupons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gallery_images_updated_at
BEFORE UPDATE ON public.gallery_images
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Criar storage bucket para imagens
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery-images', 'gallery-images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies para storage
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update product images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete product images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Public can view gallery images"
ON storage.objects FOR SELECT
USING (bucket_id = 'gallery-images');

CREATE POLICY "Dono can upload gallery images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'gallery-images' AND has_role(auth.uid(), 'dono'::app_role));

CREATE POLICY "Dono can update gallery images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'gallery-images' AND has_role(auth.uid(), 'dono'::app_role));

CREATE POLICY "Dono can delete gallery images"
ON storage.objects FOR DELETE
USING (bucket_id = 'gallery-images' AND has_role(auth.uid(), 'dono'::app_role));