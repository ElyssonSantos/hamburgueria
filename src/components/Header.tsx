import { Link, useLocation } from "react-router-dom";
import { Moon, Sun, Menu, X, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSiteConfig } from "@/hooks/useSiteConfig";


interface Category {
  id: string;
  nome: string;
  slug: string;
  icon: string | null;
}

export const Header = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [headerLogoUrl, setHeaderLogoUrl] = useState("");
  const [usarLogoHeader, setUsarLogoHeader] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const location = useLocation();

  useEffect(() => {
    fetchSiteConfig();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("id, nome, slug, icon")
      .order("nome");
    
    if (data) {
      setCategories(data);
    }
  };

  const fetchSiteConfig = async () => {
    const { data } = await supabase
      .from("site_config")
      .select("header_logo_url, usar_logo_header")
      .limit(1)
      .single();

    if (data) {
      setHeaderLogoUrl(data.header_logo_url || "");
      setUsarLogoHeader(data.usar_logo_header || false);
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" || "light";
    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            {usarLogoHeader && headerLogoUrl ? (
              <img 
                src={headerLogoUrl} 
                alt="Logo BigBig Burguer" 
                className="h-12 object-contain group-hover:scale-110 transition-transform"
              />
            ) : (
              <>
                <div className="text-4xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                  BigBig
                </div>
                <div className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                  Burguer
                </div>
              </>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {categories.map((category) => {
              const categoryPath = `/categoria/${category.slug}`;
              return (
                <Link
                  key={category.id}
                  to={categoryPath}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground ${
                    location.pathname === categoryPath
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {category.icon && <span className="mr-2">{category.icon}</span>}
                  {category.nome}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                  >
                    <Link to="/auth">
                      <Settings className="h-5 w-5" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Painel de Administração</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-full"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="lg:hidden py-4 border-t">
            <div className="flex flex-col space-y-2">
              {categories.map((category) => {
                const categoryPath = `/categoria/${category.slug}`;
                return (
                  <Link
                    key={category.id}
                    to={categoryPath}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-lg text-base font-medium transition-all hover:bg-accent hover:text-accent-foreground ${
                      location.pathname === categoryPath
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {category.icon && <span className="mr-3 text-xl">{category.icon}</span>}
                    {category.nome}
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};
