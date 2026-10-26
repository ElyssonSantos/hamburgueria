-- Corrigir search_path nas funções criadas
CREATE OR REPLACE FUNCTION public.generate_slug(text_input text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  slug_output text;
BEGIN
  slug_output := lower(text_input);
  slug_output := translate(slug_output, 
    'áàâãäéèêëíìîïóòôõöúùûüçñ',
    'aaaaaeeeeiiiiooooouuuucn');
  slug_output := regexp_replace(slug_output, '[^a-z0-9\s-]', '', 'g');
  slug_output := regexp_replace(slug_output, '\s+', '-', 'g');
  slug_output := regexp_replace(slug_output, '-+', '-', 'g');
  slug_output := trim(both '-' from slug_output);
  RETURN slug_output;
END;
$$;

CREATE OR REPLACE FUNCTION public.auto_generate_category_slug()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.nome);
  END IF;
  RETURN NEW;
END;
$$;