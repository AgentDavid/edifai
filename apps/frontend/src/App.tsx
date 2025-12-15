import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/auth/LoginPage";
import SuperAdminDashboard from "./pages/admin/SuperAdminDashboard";
import ResellerDashboard from "./pages/reseller/ResellerDashboard";
import CondoAdminDashboard from "./pages/condo/CondoAdminDashboard";
import UserHome from "./pages/user/UserHome";
import MainLayout from "./layouts/MainLayout";

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
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
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

      {/* Reseller Routes */}
      <Route
        path="/reseller/dashboard"
        element={
          <ProtectedRoute allowedRoles={["reseller"]}>
            <ResellerDashboard />
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

      {/* Condo User Routes */}
      <Route
        path="/user/home"
        element={
          <ProtectedRoute allowedRoles={["usuario_condominio"]}>
            <UserHome />
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
      </Router>
    </AuthProvider>
  );
}

export default App;
