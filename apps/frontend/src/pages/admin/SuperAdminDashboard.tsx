import { useAuth } from "../../context/AuthContext";
import { DollarSign, Users, AlertTriangle, TrendingUp } from "lucide-react";

const SuperAdminDashboard = () => {
  const { user } = useAuth();

  const stats = [
    {
      label: "Condominios Activos",
      value: "124",
      icon: Users,
      color: "bg-blue-500",
    },
    {
      label: "Ingresos Mensuales",
      value: "$45,230",
      icon: DollarSign,
      color: "bg-green-500",
    },
    {
      label: "Revendedores",
      value: "18",
      icon: TrendingUp,
      color: "bg-purple-500",
    },
    { label: "Alertas", value: "3", icon: AlertTriangle, color: "bg-red-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Bienvenido, {user?.profile.first_name}
        </h1>
        <p className="text-slate-500">Panel de Super Administrador</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="p-6 bg-white rounded-xl shadow-sm border border-slate-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-800">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Placeholder Sections */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-4">Actividad Reciente</h2>
          <p className="text-slate-500 text-sm">No hay actividad reciente.</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-4">Revendedores Recientes</h2>
          <p className="text-slate-500 text-sm">
            No hay revendedores registrados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
