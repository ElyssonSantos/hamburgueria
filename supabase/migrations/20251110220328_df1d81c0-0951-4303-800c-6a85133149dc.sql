-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('dono', 'gerente', 'midias');

-- Create profiles table (additional user information)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user_roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL UNIQUE,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  categoria_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  preco DECIMAL(10,2) NOT NULL,
  descricao TEXT NOT NULL,
  ingredientes TEXT[] NOT NULL DEFAULT '{}',
  imagem_url TEXT NOT NULL,
  promocao_ativa BOOLEAN NOT NULL DEFAULT FALSE,
  promocao_percentual INTEGER DEFAULT 0,
  destaque BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create site_config table (single row configuration)
CREATE TABLE public.site_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tempo_rotacao_banner INTEGER NOT NULL DEFAULT 15,
  intervalo_notificacao INTEGER NOT NULL DEFAULT 30,
  horario_funcionamento TEXT NOT NULL DEFAULT 'Segunda a Quinta: 18h às 23h, Sexta a Domingo: 18h às 00h',
  endereco TEXT NOT NULL DEFAULT 'Rua dos Sabores, 123, Centro, Sua Cidade - Estado, CEP: 12345-678',
  whatsapp TEXT NOT NULL DEFAULT '5511999999999',
  instagram TEXT DEFAULT 'https://instagram.com',
  facebook TEXT DEFAULT 'https://facebook.com',
  tiktok TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create banners table
CREATE TABLE public.banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  media_url TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('imagem', 'video')),
  mensagem TEXT,
  ordem INTEGER NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mensagem TEXT NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create function to check user role (SECURITY DEFINER to avoid recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user has any role
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Dono can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'dono'));

CREATE POLICY "Gerente can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'gerente'));

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Dono can manage all roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'dono'));

CREATE POLICY "Gerente can manage roles except dono"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'gerente') AND
    role != 'dono'
  );

CREATE POLICY "Gerente can update roles except dono"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'gerente') AND
    role != 'dono'
  );

-- RLS Policies for categories (public read, admin write)
CREATE POLICY "Everyone can view categories"
  ON public.categories FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Dono can manage categories"
  ON public.categories FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'dono'));

-- RLS Policies for products (public read, admin write)
CREATE POLICY "Everyone can view products"
  ON public.products FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Dono can manage all products"
  ON public.products FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'dono'));

CREATE POLICY "Gerente can manage products"
  ON public.products FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'gerente'));

CREATE POLICY "Midias can update product images and promotions"
  ON public.products FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'midias'))
  WITH CHECK (public.has_role(auth.uid(), 'midias'));

-- RLS Policies for site_config
CREATE POLICY "Everyone can view site config"
  ON public.site_config FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Dono can update site config"
  ON public.site_config FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'dono'));

-- RLS Policies for banners
CREATE POLICY "Everyone can view active banners"
  ON public.banners FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Dono can manage banners"
  ON public.banners FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'dono'));

CREATE POLICY "Gerente can manage banners"
  ON public.banners FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'gerente'));

-- RLS Policies for notifications
CREATE POLICY "Everyone can view active notifications"
  ON public.notifications FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Dono can manage notifications"
  ON public.notifications FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'dono'));

CREATE POLICY "Gerente can manage notifications"
  ON public.notifications FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'gerente'));

CREATE POLICY "Midias can manage notifications"
  ON public.notifications FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'midias'));

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add update triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_config_updated_at
  BEFORE UPDATE ON public.site_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_banners_updated_at
  BEFORE UPDATE ON public.banners
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default site config
INSERT INTO public.site_config (id) VALUES (uuid_generate_v4());

-- Insert default categories
INSERT INTO public.categories (nome, icon) VALUES
  ('Hambúrguer', '🍔'),
  ('Pizzas', '🍕'),
  ('Sorvetes', '🍦'),
  ('Açaí', '🥣'),
  ('Sobremesa', '🍰'),
  ('Bebidas', '🥤');