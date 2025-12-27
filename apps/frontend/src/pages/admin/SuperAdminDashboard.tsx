import { useAuth } from "../../context/AuthContext";
import {
  DollarSign,
  Users,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  CheckSquare,
} from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

interface SystemAlert {
  _id: string;
  message: string;
  path: string;
  method: string;
  status: "OPEN" | "ATTENDED";
  created_at: string;
}

const SuperAdminDashboard = () => {
  const { user } = useAuth();
  const [statsData, setStatsData] = useState({
    totalTenants: 0,
    monthlyRevenue: 0,
    totalResellers: 0,
    activeAlerts: 0,
  });
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, alertsRes] = await Promise.all([
        axios.get("http://localhost:4000/api/admin/stats", { headers }),
        axios.get("http://localhost:4000/api/admin/alerts?limit=10", {
          headers,
        }),
      ]);

      setStatsData(statsRes.data.data);
      setAlerts(alertsRes.data.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMarkAttended = async (id: string) => {
    try {
      await axios.patch(
        `http://localhost:4000/api/admin/alerts/${id}/attend`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      // Refresh data
      fetchData();
    } catch (error) {
      console.error("Error marking alert as attended:", error);
    }
  };

  const handleMarkAllAttended = async () => {
    if (
      !window.confirm(
        "¿Estás seguro de marcar todas las alertas como atendidas?"
      )
    )
      return;

    try {
      await axios.post(
        "http://localhost:4000/api/admin/alerts/attend-all",
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      fetchData();
    } catch (error) {
      console.error("Error marking all alerts as attended:", error);
    }
  };

  const stats = [
    {
      label: "Condominios Activos",
      value: loading ? "..." : statsData.totalTenants.toString(),
      icon: Users,
      color: "bg-blue-500",
    },
    {
      label: "Ingresos Mensuales",
      value: loading
        ? "..."
        : new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(statsData.monthlyRevenue),
      icon: DollarSign,
      color: "bg-green-500",
    },
    {
      label: "Revendedores",
      value: loading ? "..." : statsData.totalResellers.toString(),
      icon: TrendingUp,
      color: "bg-purple-500",
    },
    {
      label: "Alertas del Sistema",
      value: loading ? "..." : statsData.activeAlerts.toString(),
      icon: AlertTriangle,
      color: "bg-red-500",
    },
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

      {/* Placeholder Sections + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Alerts Section - Takes up 2 columns */}
        <div className="lg:col-span-2 p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="text-red-500" size={20} />
              Alertas del Sistema
            </h2>
            {statsData.activeAlerts > 0 && (
              <button
                onClick={handleMarkAllAttended}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                <CheckSquare size={16} />
                Marcar todas leídas
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            {alerts.length === 0 ? (
              <p className="text-slate-500 text-sm py-4 text-center">
                No hay alertas recientes.
              </p>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                  <tr>
                    <th className="px-4 py-3">Mensaje</th>
                    <th className="px-4 py-3">Ruta</th>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {alerts.map((alert) => (
                    <tr
                      key={alert._id}
                      className={alert.status === "OPEN" ? "bg-red-50" : ""}
                    >
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {alert.message}
                      </td>
                      <td
                        className="px-4 py-3 text-slate-500 truncate max-w-[150px]"
                        title={alert.path}
                      >
                        <span className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded mr-1">
                          {alert.method}
                        </span>
                        {alert.path}
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">
                        {new Date(alert.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {alert.status === "OPEN" ? (
                          <button
                            onClick={() => handleMarkAttended(alert._id)}
                            className="text-green-600 hover:text-green-800 transition-colors"
                            title="Marcar como atendida"
                          >
                            <CheckCircle size={18} />
                          </button>
                        ) : (
                          <span className="text-green-500 flex justify-end">
                            <CheckCircle size={18} />
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Recent Activity / Resellers - Takes up 1 column */}
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-4">
              Revendedores Recientes
            </h2>
            <p className="text-slate-500 text-sm">
              No hay revendedores registrados recientemente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
