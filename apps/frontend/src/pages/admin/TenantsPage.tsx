import { useState, useEffect } from "react";
import { Plus, Search, Building, X } from "lucide-react";
import api from "../../services/api";
import NewTenantModal from "../../components/admin/NewTenantModal";

interface Admin {
  _id: string;
  email: string;
  profile: {
    first_name: string;
    last_name: string;
  };
  status: string;
}

interface Plan {
  _id: string;
  name: string;
  code: string;
}

interface Subscription {
  status: string;
  plan: Plan;
  next_billing_date: string;
}

interface Tenant {
  _id: string;
  name: string;
  address: string;
  admin: Admin;
  subscription: Subscription | null;
}

interface TenantsResponse {
  data: Tenant[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const TenantsPage = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const response = await api.get<TenantsResponse>("/admin/tenants");
      setTenants(response.data.data);
      setError(null);
    } catch (err) {
      setError("Error al cargar los condominios");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const filteredTenants = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.admin?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string | undefined) => {
    if (!status) return null;
    const colors: Record<string, string> = {
      active: "bg-green-100 text-green-800",
      past_due: "bg-yellow-100 text-yellow-800",
      canceled: "bg-red-100 text-red-800",
    };
    const labels: Record<string, string> = {
      active: "Activo",
      past_due: "Vencido",
      canceled: "Cancelado",
    };
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status] || "bg-gray-100 text-gray-800"}`}
      >
        {labels[status] || status}
      </span>
    );
  };

  const handleTenantCreated = () => {
    setIsModalOpen(false);
    fetchTenants();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Condominios</h1>
          <p className="text-slate-500">
            Gestiona todos los condominios de la plataforma
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
        >
          <Plus size={18} />
          Nuevo Condominio
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          size={18}
        />
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Cargando...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : filteredTenants.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <Building className="mx-auto mb-4 text-slate-300" size={48} />
            <p>No hay condominios registrados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Administrador
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTenants.map((tenant) => (
                  <tr
                    key={tenant._id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">
                        {tenant.name}
                      </div>
                      <div className="text-sm text-slate-500">
                        {tenant.address}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-800">
                        {tenant.admin?.profile?.first_name}{" "}
                        {tenant.admin?.profile?.last_name}
                      </div>
                      <div className="text-sm text-slate-500">
                        {tenant.admin?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-700">
                        {tenant.subscription?.plan?.name || "Sin plan"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(tenant.subscription?.status)}
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Ver detalles
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <NewTenantModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleTenantCreated}
      />
    </div>
  );
};

export default TenantsPage;
