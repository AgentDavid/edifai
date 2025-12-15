import { useAuth } from "../../context/AuthContext";
import { DollarSign, Users, AlertTriangle, FileText } from "lucide-react";

const CondoAdminDashboard = () => {
  const { user } = useAuth();

  const stats = [
    {
      label: "Ingresos del Mes",
      value: "$12,500",
      icon: DollarSign,
      color: "bg-green-500",
    },
    { label: "Unidades", value: "48", icon: Users, color: "bg-blue-500" },
    {
      label: "Morosidad",
      value: "$3,200",
      icon: AlertTriangle,
      color: "bg-red-500",
    },
    {
      label: "Tickets Abiertos",
      value: "5",
      icon: FileText,
      color: "bg-amber-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Bienvenido, {user?.profile.first_name}
        </h1>
        <p className="text-slate-500">Panel de Administrador de Condominio</p>
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-4">Alertas Recientes</h2>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Unidad 3B con
              pago pendiente
            </li>
            <li className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" /> Ticket de
              mantenimiento urgente
            </li>
          </ul>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-4">Próximos Vencimientos</h2>
          <p className="text-slate-500 text-sm">
            No hay vencimientos próximos.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CondoAdminDashboard;
