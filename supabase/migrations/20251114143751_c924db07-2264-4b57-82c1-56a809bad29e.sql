-- Adicionar campo slug em categories
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS slug text;

-- Criar índice único no slug
CREATE UNIQUE INDEX IF NOT EXISTS categories_slug_key ON public.categories(slug);

-- Adicionar campo delivery_url em site_config
ALTER TABLE public.site_config 
ADD COLUMN IF NOT EXISTS delivery_url text;

-- Função para gerar slug automaticamente (sem unaccent)
CREATE OR REPLACE FUNCTION public.generate_slug(text_input text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  slug_output text;
BEGIN
  -- Converte para minúsculas
  slug_output := lower(text_input);
  
  -- Remove acentos manualmente
  slug_output := translate(slug_output, 
    'áàâãäéèêëíìîïóòôõöúùûüçñ',
    'aaaaaeeeeiiiiooooouuuucn');
    
  -- Remove caracteres especiais e substitui espaços por hífen
  slug_output := regexp_replace(slug_output, '[^a-z0-9\s-]', '', 'g');
  slug_output := regexp_replace(slug_output, '\s+', '-', 'g');
  slug_output := regexp_replace(slug_output, '-+', '-', 'g');
  slug_output := trim(both '-' from slug_output);
  
  RETURN slug_output;
END;
$$;

-- Gerar slugs para categorias existentes que não têm slug
UPDATE public.categories 
SET slug = generate_slug(nome)
WHERE slug IS NULL OR slug = '';

-- Trigger para gerar slug automaticamente ao inserir/atualizar categoria
CREATE OR REPLACE FUNCTION public.auto_generate_category_slug()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.nome);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_auto_generate_category_slug ON public.categories;

CREATE TRIGGER trigger_auto_generate_category_slug
BEFORE INSERT OR UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.auto_generate_category_slug();