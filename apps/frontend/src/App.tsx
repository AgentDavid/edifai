import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/auth/LoginPage";
import SuperAdminDashboard from "./pages/admin/SuperAdminDashboard";
import ResellersPage from "./pages/admin/ResellersPage";
import SettingsPage from "./pages/admin/SettingsPage";
import TenantsPage from "./pages/admin/TenantsPage";
import ResellerDashboard from "./pages/reseller/ResellerDashboard";
import CondoAdminDashboard from "./pages/condo/CondoAdminDashboard";
import UserHome from "./pages/user/UserHome";
import MainLayout from "./layouts/MainLayout";
import PlaceholderPage from "./pages/PlaceholderPage";
import { useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Unauthorized = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-red-500">403</h1>
      <p className="text-slate-600">Acceso Denegado</p>
    </div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children: React.ReactElement;
  allowedRoles: string[];
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (user && !allowedRoles.includes(user.role))
    return <Navigate to="/unauthorized" />;

  return <MainLayout>{children}</MainLayout>;
};

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const handleForbidden = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      toast.error(
        `Acceso Denegado: ${
          detail?.message || "Permisos insuficientes o pago requerido."
        }`
      );
    };
    window.addEventListener("api:forbidden", handleForbidden);
    return () => window.removeEventListener("api:forbidden", handleForbidden);
  }, []);

  const getDashboardPath = (role: string) => {
    switch (role) {
      case "super_admin":
        return "/admin/dashboard";
      case "reseller":
        return "/reseller/dashboard";
      case "admin_condominio":
        return "/condo/dashboard";
      case "usuario_condominio":
        return "/user/home";
      default:
        return "/unauthorized";
    }
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated && user ? (
            <Navigate to={getDashboardPath(user.role)} />
          ) : (
            <LoginPage />
          )
        }
      />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Super Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/resellers"
        element={
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <ResellersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/tenants"
        element={
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <TenantsPage />
          </ProtectedRoute>
        }
      />

      {/* Reseller Routes */}
      <Route
        path="/reseller/dashboard"
        element={
          <ProtectedRoute allowedRoles={["reseller"]}>
            <ResellerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reseller/onboarding"
        element={
          <ProtectedRoute allowedRoles={["reseller"]}>
            <PlaceholderPage
              title="Altas de Clientes"
              description="Registra nuevos condominios y administradores."
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reseller/billing"
        element={
          <ProtectedRoute allowedRoles={["reseller"]}>
            <PlaceholderPage
              title="Facturación"
              description="Gestiona tus comisiones y pagos."
            />
          </ProtectedRoute>
        }
      />

      {/* Condo Admin Routes */}
      <Route
        path="/condo/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin_condominio"]}>
            <CondoAdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/condo/expenses"
        element={
          <ProtectedRoute allowedRoles={["admin_condominio"]}>
            <PlaceholderPage
              title="Gestión de Gastos"
              description="Registra facturas y gastos del condominio."
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/condo/residents"
        element={
          <ProtectedRoute allowedRoles={["admin_condominio"]}>
            <PlaceholderPage
              title="Directorio de Residentes"
              description="Administra unidades y propietarios."
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/condo/operations"
        element={
          <ProtectedRoute allowedRoles={["admin_condominio"]}>
            <PlaceholderPage
              title="Operaciones"
              description="Gestiona tickets de mantenimiento y reservas."
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/condo/settings"
        element={
          <ProtectedRoute allowedRoles={["admin_condominio"]}>
            <PlaceholderPage
              title="Configuración del Condominio"
              description="Ajusta preferencias, notificaciones y reglas."
            />
          </ProtectedRoute>
        }
      />

      {/* Condo User Routes */}
      <Route
        path="/user/home"
        element={
          <ProtectedRoute allowedRoles={["usuario_condominio"]}>
            <UserHome />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/receipts"
        element={
          <ProtectedRoute allowedRoles={["usuario_condominio"]}>
            <PlaceholderPage
              title="Mis Recibos"
              description="Consulta tu historial de pagos y recibos mensuales."
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/amenities"
        element={
          <ProtectedRoute allowedRoles={["usuario_condominio"]}>
            <PlaceholderPage
              title="Reservas"
              description="Reserva áreas comunes como piscinas o salones."
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/tickets"
        element={
          <ProtectedRoute allowedRoles={["usuario_condominio"]}>
            <PlaceholderPage
              title="Reportes"
              description="Crea tickets de soporte o mantenimiento."
            />
          </ProtectedRoute>
        }
      />

      {/* Default Redirect */}
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
