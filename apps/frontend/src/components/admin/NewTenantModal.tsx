import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import api from "../../services/api";

interface Plan {
  _id: string;
  name: string;
  code: string;
  monthly_price: number;
}

interface NewTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const NewTenantModal = ({
  isOpen,
  onClose,
  onSuccess,
}: NewTenantModalProps) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    condoName: "",
    condoAddress: "",
    adminEmail: "",
    adminName: "",
    adminLastName: "",
    adminPhone: "",
    planId: "",
  });

  useEffect(() => {
    if (isOpen) {
      fetchPlans();
    }
  }, [isOpen]);

  const fetchPlans = async () => {
    try {
      const response = await api.get<{ data: Plan[] }>("/admin/plans");
      setPlans(response.data.data);
      if (response.data.data.length > 0 && !formData.planId) {
        setFormData((prev) => ({ ...prev, planId: response.data.data[0]._id }));
      }
    } catch (err) {
      console.error("Error fetching plans:", err);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post("/admin/provision-tenant", formData);
      setFormData({
        condoName: "",
        condoAddress: "",
        adminEmail: "",
        adminName: "",
        adminLastName: "",
        adminPhone: "",
        planId: plans[0]?._id || "",
      });
      toast.success("Condominio creado exitosamente");
      onSuccess();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(
        axiosError.response?.data?.message || "Error al crear el condominio"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800">
            Nuevo Condominio
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nombre del Condominio *
            </label>
            <input
              type="text"
              name="condoName"
              value={formData.condoName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="Ej: Torres del Sol"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Dirección *
            </label>
            <input
              type="text"
              name="condoAddress"
              value={formData.condoAddress}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="Ej: Av. Principal 123"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nombre del Admin *
              </label>
              <input
                type="text"
                name="adminName"
                value={formData.adminName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Nombre"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Apellido
              </label>
              <input
                type="text"
                name="adminLastName"
                value={formData.adminLastName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Apellido"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email del Administrador *
            </label>
            <input
              type="email"
              name="adminEmail"
              value={formData.adminEmail}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="admin@ejemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Teléfono
            </label>
            <input
              type="tel"
              name="adminPhone"
              value={formData.adminPhone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="+58 412 123 4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Plan *
            </label>
            <select
              name="planId"
              value={formData.planId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
            >
              {plans.length === 0 ? (
                <option value="">No hay planes disponibles</option>
              ) : (
                plans.map((plan) => (
                  <option key={plan._id} value={plan._id}>
                    {plan.name} - ${plan.monthly_price}/mes
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || plans.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creando..." : "Crear Condominio"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTenantModal;
