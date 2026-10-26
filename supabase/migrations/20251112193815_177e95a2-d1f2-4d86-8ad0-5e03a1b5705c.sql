-- Create custom_roles table for user-defined roles
CREATE TABLE IF NOT EXISTS public.custom_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on custom_roles
ALTER TABLE public.custom_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for custom_roles
CREATE POLICY "Dono can manage custom roles"
  ON public.custom_roles
  FOR ALL
  USING (has_role(auth.uid(), 'dono'::app_role));

CREATE POLICY "Everyone can view custom roles"
  ON public.custom_roles
  FOR SELECT
  USING (true);

-- Add support for custom roles in user_roles table by adding a custom_role_id column
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS custom_role_id UUID REFERENCES public.custom_roles(id) ON DELETE CASCADE;

-- Create a new table to link custom roles with permissions
CREATE TABLE IF NOT EXISTS public.custom_role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  custom_role_id UUID NOT NULL REFERENCES public.custom_roles(id) ON DELETE CASCADE,
  resource TEXT NOT NULL,
  can_view BOOLEAN DEFAULT false,
  can_create BOOLEAN DEFAULT false,
  can_update BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(custom_role_id, resource)
);

-- Enable RLS on custom_role_permissions
ALTER TABLE public.custom_role_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for custom_role_permissions
CREATE POLICY "Dono can manage custom role permissions"
  ON public.custom_role_permissions
  FOR ALL
  USING (has_role(auth.uid(), 'dono'::app_role));

CREATE POLICY "Everyone can view custom role permissions"
  ON public.custom_role_permissions
  FOR SELECT
  USING (true);

-- Add trigger for updated_at on custom_roles
CREATE TRIGGER update_custom_roles_updated_at
  BEFORE UPDATE ON public.custom_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for updated_at on custom_role_permissions
CREATE TRIGGER update_custom_role_permissions_updated_at
  BEFORE UPDATE ON public.custom_role_permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();