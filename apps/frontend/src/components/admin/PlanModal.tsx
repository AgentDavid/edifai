import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import api from "../../services/api";

interface Plan {
  _id?: string;
  name: string;
  code: string;
  monthly_price: number;
  max_units: number;
  currency: string;
  features: string[];
  ai_features_enabled: boolean;
}

interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  plan?: Plan | null; // If provided, we are editing
}

const PlanModal = ({ isOpen, onClose, onSuccess, plan }: PlanModalProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Plan>({
    name: "",
    code: "",
    monthly_price: 0,
    max_units: 1,
    currency: "USD",
    features: [],
    ai_features_enabled: false,
  });

  const [featuresInput, setFeaturesInput] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (plan) {
        setFormData({
          ...plan,
        });
        setFeaturesInput(plan.features?.join(", ") || "");
      } else {
        // Reset for create
        setFormData({
          name: "",
          code: "",
          monthly_price: 0,
          max_units: 1,
          currency: "USD",
          features: [],
          ai_features_enabled: false,
        });
        setFeaturesInput("");
      }
      setError(null);
    }
  }, [isOpen, plan]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]:
          name === "monthly_price" || name === "max_units"
            ? Number(value)
            : value,
      }));
    }
  };

  const handleFeaturesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFeaturesInput(e.target.value);
    // Split by comma and trim to create array
    const featuresArray = e.target.value
      .split(",")
      .map((f) => f.trim())
      .filter((f) => f !== "");
    setFormData((prev) => ({ ...prev, features: featuresArray }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (plan && plan._id) {
        // Update
        await api.put(`/admin/plans/${plan._id}`, formData);
      } else {
        // Create
        await api.post("/admin/plans", formData);
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(
        axiosError.response?.data?.message || "Error al guardar el plan"
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
            {plan ? "Editar Plan" : "Nuevo Plan"}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nombre del Plan *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Ej: Básico"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Código *
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all uppercase"
                placeholder="Ej: BASIC_50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Precio Mensual ($) *
              </label>
              <input
                type="number"
                name="monthly_price"
                value={formData.monthly_price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Máximo de Unidades *
              </label>
              <input
                type="number"
                name="max_units"
                value={formData.max_units}
                onChange={handleChange}
                required
                min="1"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Características (separadas por coma)
            </label>
            <input
              type="text"
              value={featuresInput}
              onChange={handleFeaturesChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="Ej: expenses, receipts, basic_support"
            />
            <p className="text-xs text-slate-400 mt-1">
              Use comas para separar items
            </p>
          </div>

          <div className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg">
            <input
              type="checkbox"
              id="ai_features_enabled"
              name="ai_features_enabled"
              checked={formData.ai_features_enabled}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label
              htmlFor="ai_features_enabled"
              className="text-sm font-medium text-slate-700 cursor-pointer"
            >
              Habilitar Funciones de IA
            </label>
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
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                "Guardando..."
              ) : (
                <>
                  <Check size={18} />
                  <span>Guardar Plan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlanModal;
