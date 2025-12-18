import { useState, useEffect } from "react";
import {
  AlertTriangle,
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import api from "../../services/api";
import PlanModal from "../../components/admin/PlanModal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

interface Plan {
  _id: string;
  name: string;
  code: string;
  monthly_price: number;
  max_units: number;
  currency: string;
  features: string[];
  ai_features_enabled: boolean;
}

const SettingsPage = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  // Confirm delete state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await api.get<{ data: Plan[] }>("/admin/plans");
      setPlans(response.data.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching plans:", err);
      setError("Error al cargar los planes");
      toast.error("Error al cargar los planes");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = () => {
    setSelectedPlan(null);
    setIsModalOpen(true);
  };

  const handleEditPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const confirmDeletePlan = (id: string) => {
    setPlanToDelete(id);
    setIsDeleteOpen(true);
  };

  const handleDeletePlan = async () => {
    if (!planToDelete) return;

    try {
      await api.delete(`/admin/plans/${planToDelete}`);
      toast.success("Plan eliminado correctamente");
      fetchPlans(); // Refresh list
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      toast.error(
        axiosError.response?.data?.message || "Error al eliminar el plan"
      );
    } finally {
      setIsDeleteOpen(false);
      setPlanToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Configuración del Sistema
        </h1>
        <p className="text-slate-500">
          Administra los planes y parámetros globales
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Planes y Precios
            </h2>
            <p className="text-sm text-slate-500">
              Define los planes de suscripción disponibles
            </p>
          </div>
          <button
            onClick={handleCreatePlan}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Plus size={18} />
            Nuevo Plan
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-10 text-slate-500">
              Cargando planes...
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">{error}</div>
          ) : plans.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              No hay planes configurados.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan) => (
                <div
                  key={plan._id}
                  className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow relative group bg-slate-50/50"
                >
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditPlan(plan)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => confirmDeletePlan(plan._id)}
                      className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="mb-2">
                    <span className="inline-block px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full mb-2">
                      {plan.code}
                    </span>
                    <h3 className="text-lg font-bold text-slate-800">
                      {plan.name}
                    </h3>
                  </div>

                  <div className="mb-4">
                    <span className="text-2xl font-bold text-slate-900">
                      ${plan.monthly_price}
                    </span>
                    <span className="text-slate-500 text-sm"> / mes</span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <span className="font-semibold text-slate-700">
                        Max. Unidades:
                      </span>
                      {plan.max_units}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <span className="font-semibold text-slate-700">
                        Funciones IA:
                      </span>
                      {plan.ai_features_enabled ? (
                        <div className="flex items-center gap-1 text-green-600 font-medium">
                          <CheckCircle size={14} /> Habilitado
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-slate-400">
                          <XCircle size={14} /> Deshabilitado
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Características
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {plan.features.map((feature, i) => (
                        <span
                          key={i}
                          className="text-xs bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded shadow-sm"
                        >
                          {feature}
                        </span>
                      ))}
                      {plan.features.length === 0 && (
                        <span className="text-xs text-slate-400 italic">
                          Sin características
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <AlertTriangle className="text-amber-500" size={20} />
            Zona de Peligro
          </h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-slate-600 mb-4">
            Estas acciones pueden afectar la integridad del sistema.
          </p>
          <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium transition-colors">
            Reiniciar Caché del Sistema
          </button>
        </div>
      </div>

      <PlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchPlans();
          toast.success("Plan guardado exitosamente");
        }}
        plan={selectedPlan}
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Eliminar Plan"
        message="¿Estás seguro de que deseas eliminar este plan? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={handleDeletePlan}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </div>
  );
};

export default SettingsPage;
