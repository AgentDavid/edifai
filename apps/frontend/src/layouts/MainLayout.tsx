import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  Home,
  Users,
  Settings,
  DollarSign,
  FileText,
  PenTool,
  LogOut,
  AlertTriangle,
  Building,
} from "lucide-react";
import { cn } from "../lib/utils";

// ... (keep interface and item arrays as they are) ...
// Note: I cannot see the item arrays in the 'old_string' unless I include them.
// To be safe, I will target the imports and then the component body separately or in one large block if I'm confident.
// Better to split replacements.

// Replacement 1: Imports

interface SidebarItem {
  label: string;
  icon: React.ElementType;
  href: string;
}

const SuperAdminItems: SidebarItem[] = [
  { label: "Dashboard", icon: Home, href: "/admin/dashboard" },
  { label: "Condominios", icon: Building, href: "/admin/tenants" },
  { label: "Revendedores", icon: Users, href: "/admin/resellers" },
  { label: "Configuración", icon: Settings, href: "/admin/settings" },
];

const ResellerItems: SidebarItem[] = [
  { label: "Dashboard", icon: Home, href: "/reseller/dashboard" },
  { label: "Altas", icon: Users, href: "/reseller/onboarding" },
  { label: "Facturación", icon: DollarSign, href: "/reseller/billing" },
];

const CondoAdminItems: SidebarItem[] = [
  { label: "Dashboard", icon: Home, href: "/condo/dashboard" },
  { label: "Finanzas", icon: DollarSign, href: "/condo/expenses" },
  { label: "Residentes", icon: Users, href: "/condo/residents" },
  { label: "Operaciones", icon: PenTool, href: "/condo/operations" },
  { label: "Configuración", icon: Settings, href: "/condo/settings" },
];

const UserItems: SidebarItem[] = [
  { label: "Inicio", icon: Home, href: "/user/home" },
  { label: "Recibos", icon: FileText, href: "/user/receipts" },
  { label: "Amenidades", icon: Users, href: "/user/amenities" },
  { label: "Reportes", icon: PenTool, href: "/user/tickets" },
];

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout, isSaaSSuspended } = useAuth();
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();

  const getItems = () => {
    switch (user?.role) {
      case "super_admin":
        return SuperAdminItems;
      case "reseller":
        return ResellerItems;
      case "admin_condominio":
        return CondoAdminItems;
      case "usuario_condominio":
        return UserItems;
      default:
        return [];
    }
  };

  const items = getItems();

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside
        className={cn(
          "bg-white border-r border-slate-200 transition-all duration-300 flex flex-col fixed inset-y-0 left-0 z-50 md:relative shadow-sm",
          isOpen ? "w-64" : "w-0 md:w-20 overflow-hidden"
        )}
      >
        <div className="flex items-center justify-between p-4 h-16 border-b border-slate-100">
          <div
            className={cn(
              "flex items-center gap-2",
              !isOpen && "md:justify-center md:w-full"
            )}
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-blue-200 shadow-md">
              E
            </div>
            <span
              className={cn(
                "font-bold text-xl text-slate-800 tracking-tight",
                !isOpen && "md:hidden"
              )}
            >
              Edifai
            </span>
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-slate-500 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative overflow-hidden",
                  isActive
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon
                  size={20}
                  className={cn(
                    "flex-shrink-0 transition-colors",
                    isActive
                      ? "text-blue-600"
                      : "text-slate-400 group-hover:text-slate-600"
                  )}
                />
                <span className={cn("truncate", !isOpen && "md:hidden")}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-full" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div
            className={cn(
              "flex items-center gap-3",
              !isOpen ? "justify-center" : "mb-3"
            )}
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-sm ring-2 ring-white">
              {user?.profile.first_name[0]}
            </div>
            <div className={cn("overflow-hidden", !isOpen && "md:hidden")}>
              <p className="text-sm font-semibold text-slate-700 truncate">
                {user?.profile.first_name} {user?.profile.last_name}
              </p>
              <p className="text-xs text-slate-500 truncate capitalize">
                {user?.role?.replace("_", " ")}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className={cn(
              "flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 transition-colors",
              !isOpen && "md:justify-center"
            )}
          >
            <LogOut size={18} />
            <span className={cn(!isOpen && "md:hidden")}>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
        {isSaaSSuspended && (
          <div className="bg-red-600 text-white px-4 py-2 text-sm text-center font-medium flex items-center justify-center gap-2">
            <AlertTriangle size={16} />
            <span>
              Su suscripción está suspendida o vencida. Algunas funciones pueden
              estar limitadas.
            </span>
          </div>
        )}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-lg font-semibold text-slate-800 hidden sm:block">
              {items.find((i) => i.href === location.pathname)?.label ||
                "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Header Actions (Notifications, etc.) could go here */}
            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
              <span className="sr-only">Notificaciones</span>
              <div className="w-2 h-2 bg-red-500 rounded-full absolute top-5 right-6 ring-2 ring-white md:hidden" />{" "}
              {/* Fake badge */}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default MainLayout;
