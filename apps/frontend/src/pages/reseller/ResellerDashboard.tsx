import { useAuth } from "../../context/AuthContext";
import { Building, DollarSign, UserCheck, TrendingUp } from "lucide-react";

const ResellerDashboard = () => {
  const { user } = useAuth();

  const stats = [
    {
      label: "Condominios Gestionados",
      value: "12",
      icon: Building,
      color: "bg-blue-500",
    },
    {
      label: "Comisiones del Mes",
      value: "$2,430",
      icon: DollarSign,
      color: "bg-green-500",
    },
    {
      label: "Nuevos Clientes",
      value: "3",
      icon: UserCheck,
      color: "bg-purple-500",
    },
    {
      label: "Crecimiento",
      value: "+15%",
      icon: TrendingUp,
      color: "bg-cyan-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Bienvenido, {user?.profile.first_name}
        </h1>
        <p className="text-slate-500">Panel de Revendedor</p>
      </div>

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

      <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-semibold mb-4">Mis Condominios</h2>
        <p className="text-slate-500 text-sm">
          Lista de condominios bajo tu gestión.
        </p>
      </div>
    </div>
  );
};

export default ResellerDashboard;
