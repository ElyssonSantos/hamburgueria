-- Create footer_blocks table
CREATE TABLE public.footer_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.footer_blocks ENABLE ROW LEVEL SECURITY;

-- Create policies for footer_blocks
CREATE POLICY "Everyone can view footer blocks"
  ON public.footer_blocks
  FOR SELECT
  USING (true);

CREATE POLICY "Dono can manage footer blocks"
  ON public.footer_blocks
  FOR ALL
  USING (has_role(auth.uid(), 'dono'::app_role));

CREATE POLICY "Gerente can manage footer blocks"
  ON public.footer_blocks
  FOR ALL
  USING (has_role(auth.uid(), 'gerente'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_footer_blocks_updated_at
  BEFORE UPDATE ON public.footer_blocks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add order_index column to gallery_images to support video type
ALTER TABLE public.gallery_images 
  ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'image';

-- Update site_config to add favicon_url
ALTER TABLE public.site_config
  ADD COLUMN IF NOT EXISTS favicon_url TEXT;