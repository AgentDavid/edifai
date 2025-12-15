import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Ban, Edit2, RefreshCw } from "lucide-react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

interface Reseller {
  _id: string;
  email: string;
  profile: {
    first_name: string;
    last_name: string;
    phone: string;
  };
  status: "active" | "suspended";
  created_at: string;
}

const ResellersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { token } = useAuth();

  const fetchResellers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Ensure token is attached (though AuthContext might do it globally, explicit header is safer here if context hasn't refreshed axios defaults)
      const response = await axios.get(
        "http://localhost:4000/api/users?role=reseller",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setResellers(response.data);
    } catch (err) {
      console.error("Error fetching resellers:", err);
      setError("No se pudieron cargar los revendedores.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchResellers();
  }, [fetchResellers]);

  const filteredResellers = resellers.filter(
    (r) =>
      r.profile.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.profile.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Gestión de Revendedores
          </h1>
          <p className="text-slate-500">Administra a tus socios comerciales</p>
        </div>
        <button
          onClick={() => alert("Funcionalidad de Crear Usuario pendiente")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={20} />
          <span>Nuevo Revendedor</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchResellers}
            className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-500"
            title="Recargar"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-700">
                  Nombre
                </th>
                <th className="px-6 py-4 font-semibold text-slate-700">
                  Teléfono
                </th>
                <th className="px-6 py-4 font-semibold text-slate-700">
                  Estado
                </th>
                <th className="px-6 py-4 font-semibold text-slate-700">
                  Fecha Registro
                </th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    Cargando revendedores...
                  </td>
                </tr>
              ) : filteredResellers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    No se encontraron revendedores.
                  </td>
                </tr>
              ) : (
                filteredResellers.map((reseller) => (
                  <tr
                    key={reseller._id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 uppercase">
                          {reseller.profile.first_name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {reseller.profile.first_name}{" "}
                            {reseller.profile.last_name}
                          </p>
                          <p className="text-slate-500 text-xs">
                            {reseller.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {reseller.profile.phone}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          reseller.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {reseller.status === "active" ? "Activo" : "Suspendido"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(reseller.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Suspender"
                        >
                          <Ban size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ResellersPage;
