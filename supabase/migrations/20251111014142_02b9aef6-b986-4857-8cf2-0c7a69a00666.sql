-- Adicionar campos para controle de banner por categoria
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS mostrar_banner boolean NOT NULL DEFAULT true;

-- Adicionar campos para logo do header e texto principal da home
ALTER TABLE public.site_config
ADD COLUMN IF NOT EXISTS header_logo_url text,
ADD COLUMN IF NOT EXISTS usar_logo_header boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS texto_principal_home text NOT NULL DEFAULT 'Os melhores hambúrgueres gourmet, pizzas artesanais e muito mais!';