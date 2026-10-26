import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Settings, Package, Users, Image, Bell, Home, FileText, Palette, Shield, Paintbrush, Tag, Images, LayoutList } from "lucide-react";
import { ProductsManager } from "@/components/admin/ProductsManager";
import { CategoriesManager } from "@/components/admin/CategoriesManager";
import { UsersManager } from "@/components/admin/UsersManager";
import { BannersManager } from "@/components/admin/BannersManager";
import { NotificationsManager } from "@/components/admin/NotificationsManager";
import { SiteConfigManager } from "@/components/admin/SiteConfigManager";
import { LogsManager } from "@/components/admin/LogsManager";
import { CategoryCustomizationManager } from "@/components/admin/CategoryCustomizationManager";
import { ThemeCustomizationManager } from "@/components/admin/ThemeCustomizationManager";
import { PermissionsManager } from "@/components/admin/PermissionsManager";
import { CouponsManager } from "@/components/admin/CouponsManager";
import { GalleryManager } from "@/components/admin/GalleryManager";
import { FooterManager } from "@/components/admin/FooterManager";
import { CustomRolesManager } from "@/components/admin/CustomRolesManager";
import { InternalNotificationsManager } from "@/components/admin/InternalNotificationsManager";

const Admin = () => {
  const { user, signOut, hasRole, hasAnyRole } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  if (!hasAnyRole()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Acesso Negado</h1>
          <p className="text-muted-foreground">
            Você precisa de permissões administrativas para acessar esta área.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate("/")}>
              Voltar ao Site
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              Sair
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="text-3xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  BigBig
                </div>
                <div className="text-xl font-bold">Burguer</div>
              </div>
              <span className="text-sm text-muted-foreground">/ Admin</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate("/")}>
                <Home className="h-4 w-4 mr-2" />
                Ver Site
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Painel Administrativo</h1>
          <p className="text-muted-foreground">
            Bem-vindo de volta! Gerencie seu estabelecimento aqui.
          </p>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="flex flex-wrap justify-start gap-2 h-auto p-2 bg-muted/50">
            <TabsTrigger value="products" className="flex-1 min-w-[120px]">
              <Package className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Produtos</span>
              <span className="sm:hidden">Prod.</span>
            </TabsTrigger>
            
            {hasRole("dono") && (
              <TabsTrigger value="categories" className="flex-1 min-w-[120px]">
                <Package className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Categorias</span>
                <span className="sm:hidden">Cat.</span>
              </TabsTrigger>
            )}
            
            {(hasRole("dono") || hasRole("gerente")) && (
              <TabsTrigger value="users" className="flex-1 min-w-[120px]">
                <Users className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Usuários</span>
                <span className="sm:hidden">Users</span>
              </TabsTrigger>
            )}
            
            {(hasRole("dono") || hasRole("gerente")) && (
              <TabsTrigger value="banners" className="flex-1 min-w-[120px]">
                <Image className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Banners</span>
                <span className="sm:hidden">Ban.</span>
              </TabsTrigger>
            )}
            
            <TabsTrigger value="notifications" className="flex-1 min-w-[120px]">
              <Bell className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Notificações</span>
              <span className="sm:hidden">Not.</span>
            </TabsTrigger>
            
            {(hasRole("dono") || hasRole("gerente")) && (
              <TabsTrigger value="push-notifications" className="flex-1 min-w-[120px]">
                <Bell className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Push</span>
                <span className="sm:hidden">Push</span>
              </TabsTrigger>
            )}
            
            {(hasRole("dono") || hasRole("gerente")) && (
              <TabsTrigger value="logs" className="flex-1 min-w-[120px]">
                <FileText className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Logs</span>
                <span className="sm:hidden">Logs</span>
              </TabsTrigger>
            )}
            
            {hasRole("dono") && (
              <TabsTrigger value="customization" className="flex-1 min-w-[120px]">
                <Palette className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Personalização</span>
                <span className="sm:hidden">Pers.</span>
              </TabsTrigger>
            )}
            
            {(hasRole("dono") || hasRole("gerente")) && (
              <TabsTrigger value="theme" className="flex-1 min-w-[120px]">
                <Paintbrush className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Cores</span>
                <span className="sm:hidden">Cores</span>
              </TabsTrigger>
            )}
            
            {(hasRole("dono") || hasRole("gerente")) && (
              <TabsTrigger value="coupons" className="flex-1 min-w-[120px]">
                <Tag className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Cupons</span>
                <span className="sm:hidden">Cupons</span>
              </TabsTrigger>
            )}
            
            {hasRole("dono") && (
              <TabsTrigger value="gallery" className="flex-1 min-w-[120px]">
                <Images className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Galeria</span>
                <span className="sm:hidden">Gal.</span>
              </TabsTrigger>
            )}

            {(hasRole("dono") || hasRole("gerente")) && ( // New tab for FooterManager
              <TabsTrigger value="footer" className="flex-1 min-w-[120px]">
                <LayoutList className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Editar Rodapé</span>
                <span className="sm:hidden">Rodapé</span>
              </TabsTrigger>
            )}
            
            {hasRole("dono") && (
              <TabsTrigger value="roles" className="flex-1 min-w-[120px]">
                <Shield className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Cargos</span>
                <span className="sm:hidden">Cargos</span>
              </TabsTrigger>
            )}
            
            {hasRole("dono") && (
              <TabsTrigger value="permissions" className="flex-1 min-w-[120px]">
                <Shield className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Permissões</span>
                <span className="sm:hidden">Perm.</span>
              </TabsTrigger>
            )}
            
            {hasRole("dono") && (
              <TabsTrigger value="config" className="flex-1 min-w-[120px]">
                <Settings className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Configurações</span>
                <span className="sm:hidden">Config</span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="products">
            <ProductsManager />
          </TabsContent>

          {hasRole("dono") && (
            <TabsContent value="categories">
              <CategoriesManager />
            </TabsContent>
          )}

          {(hasRole("dono") || hasRole("gerente")) && (
            <TabsContent value="users">
              <UsersManager />
            </TabsContent>
          )}

          {(hasRole("dono") || hasRole("gerente")) && (
            <TabsContent value="banners">
              <BannersManager />
            </TabsContent>
          )}

          <TabsContent value="notifications">
            <NotificationsManager />
          </TabsContent>

          {(hasRole("dono") || hasRole("gerente")) && (
            <TabsContent value="push-notifications">
              <InternalNotificationsManager />
            </TabsContent>
          )}

          {(hasRole("dono") || hasRole("gerente")) && (
            <TabsContent value="logs">
              <LogsManager />
            </TabsContent>
          )}

          {hasRole("dono") && (
            <TabsContent value="customization">
              <CategoryCustomizationManager />
            </TabsContent>
          )}

          {(hasRole("dono") || hasRole("gerente")) && (
            <TabsContent value="theme">
              <ThemeCustomizationManager />
            </TabsContent>
          )}

          {(hasRole("dono") || hasRole("gerente")) && (
            <TabsContent value="coupons">
              <CouponsManager />
            </TabsContent>
          )}

          {hasRole("dono") && (
            <TabsContent value="gallery">
              <GalleryManager />
            </TabsContent>
          )}

          {(hasRole("dono") || hasRole("gerente")) && (
            <TabsContent value="footer">
              <FooterManager />
            </TabsContent>
          )}

          {hasRole("dono") && (
            <TabsContent value="roles">
              <CustomRolesManager />
            </TabsContent>
          )}

          {hasRole("dono") && (
            <TabsContent value="permissions">
              <PermissionsManager />
            </TabsContent>
          )}

          {hasRole("dono") && (
            <TabsContent value="config">
              <SiteConfigManager />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;