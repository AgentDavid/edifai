import { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  ShieldCheck,
} from "lucide-react";
import { toast } from "react-toastify";
import api from "../../services/api";
import PlanModal from "../../components/admin/PlanModal";
import SuperAdminModal from "../../components/admin/SuperAdminModal";
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

interface SuperAdmin {
  _id: string;
  email: string;
  profile: {
    first_name: string;
    last_name: string;
    phone: string;
  };
}

const SettingsPage = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [superAdmins, setSuperAdmins] = useState<SuperAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  // SuperAdmin Modal state
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<SuperAdmin | null>(null);
  const [isProcessingAdmin, setIsProcessingAdmin] = useState(false);

  // Confirm delete state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);

  // Confirm delete admin state
  const [isAdminDeleteOpen, setIsAdminDeleteOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
    fetchSuperAdmins();
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

  const fetchSuperAdmins = async () => {
    try {
      setLoadingAdmins(true);
      const response = await api.get<{ data: SuperAdmin[] }>(
        "/admin/super-admins"
      );
      setSuperAdmins(response.data.data);
    } catch (err) {
      console.error("Error fetching superadmins:", err);
      toast.error("Error al cargar superadmins");
    } finally {
      setLoadingAdmins(false);
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

  // SuperAdmin handlers
  const handleCreateAdmin = () => {
    setSelectedAdmin(null);
    setIsAdminModalOpen(true);
  };

  const handleEditAdmin = (admin: SuperAdmin) => {
    setSelectedAdmin(admin);
    setIsAdminModalOpen(true);
  };

  const confirmDeleteAdmin = (id: string) => {
    setAdminToDelete(id);
    setIsAdminDeleteOpen(true);
  };

  const handleAdminSuccess = async (data: unknown) => {
    try {
      setIsProcessingAdmin(true);
      if (selectedAdmin) {
        await api.put(`/admin/super-admins/${selectedAdmin._id}`, data);
        toast.success("Superadmin actualizado");
      } else {
        await api.post("/admin/super-admins", data);
        toast.success("Superadmin creado");
      }
      setIsAdminModalOpen(false);
      fetchSuperAdmins();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message || "Error al guardar");
    } finally {
      setIsProcessingAdmin(false);
    }
  };

  const handleDeleteAdmin = async () => {
    if (!adminToDelete) return;

    try {
      await api.delete(`/admin/super-admins/${adminToDelete}`);
      toast.success("Superadmin eliminado");
      fetchSuperAdmins();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message || "Error al eliminar");
    } finally {
      setIsAdminDeleteOpen(false);
      setAdminToDelete(null);
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

      {/* Plans Section */}
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

      {/* SuperAdmins Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <ShieldCheck className="text-blue-600" size={20} />
              Gestión de Superadmins
            </h2>
            <p className="text-sm text-slate-500">
              Administra los usuarios con acceso total al sistema
            </p>
          </div>
          <button
            onClick={handleCreateAdmin}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors text-sm font-medium"
          >
            <Plus size={18} />
            Nuevo Superadmin
          </button>
        </div>
        <div className="p-6">
          {loadingAdmins ? (
            <div className="text-center py-6 text-slate-500">
              Cargando superadmins...
            </div>
          ) : superAdmins.length === 0 ? (
            <div className="text-center py-6 text-slate-500">
              No hay superadmins adicionales.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-3 text-sm font-semibold text-slate-600">
                      Usuario
                    </th>
                    <th className="pb-3 text-sm font-semibold text-slate-600">
                      Email
                    </th>
                    <th className="pb-3 text-sm font-semibold text-slate-600">
                      Teléfono
                    </th>
                    <th className="pb-3 text-sm font-semibold text-slate-600 text-right">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {superAdmins.map((admin) => (
                    <tr key={admin._id} className="group">
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                            {admin.profile.first_name[0]}
                            {admin.profile.last_name[0]}
                          </div>
                          <div>
                            <div className="font-medium text-slate-800">
                              {admin.profile.first_name}{" "}
                              {admin.profile.last_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 pr-4 text-sm text-slate-600">
                        {admin.email}
                      </td>
                      <td className="py-4 pr-4 text-sm text-slate-600">
                        {admin.profile.phone || "-"}
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditAdmin(admin)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => confirmDeleteAdmin(admin._id)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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

      <SuperAdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onSuccess={handleAdminSuccess}
        superAdmin={selectedAdmin || undefined}
        isProcessing={isProcessingAdmin}
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

      <ConfirmDialog
        isOpen={isAdminDeleteOpen}
        title="Eliminar Superadmin"
        message="¿Estás seguro de que deseas eliminar este superadmin? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={handleDeleteAdmin}
        onCancel={() => setIsAdminDeleteOpen(false)}
      />
    </div>
  );
};

export default SettingsPage;
