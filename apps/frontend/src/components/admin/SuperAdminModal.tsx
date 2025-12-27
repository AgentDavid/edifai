import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";

interface SuperAdminData {
  _id?: string;
  email: string;
  profile?: {
    first_name: string;
    last_name: string;
    phone: string;
  };
}

interface SuperAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: unknown) => void;
  superAdmin?: SuperAdminData;
  isProcessing?: boolean;
}

const SuperAdminModal: React.FC<SuperAdminModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  superAdmin,
  isProcessing = false,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (superAdmin) {
        setValue("firstName", superAdmin.profile?.first_name || "");
        setValue("lastName", superAdmin.profile?.last_name || "");
        setValue("email", superAdmin.email || "");
        setValue("phone", superAdmin.profile?.phone || "");
        setValue("password", ""); // Password blank on edit
      } else {
        reset({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          password: "",
        });
      }
    }
  }, [isOpen, superAdmin, setValue, reset]);

  const onSubmit = (data: unknown) => {
    onSuccess(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-800">
            {superAdmin ? "Editar Superadmin" : "Nuevo Superadmin"}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nombre
              </label>
              <input
                {...register("firstName", { required: "Requerido" })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                placeholder="Ej. Juan"
              />
              {errors.firstName && (
                <span className="text-xs text-red-500">
                  {errors.firstName.message}
                </span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Apellido
              </label>
              <input
                {...register("lastName", { required: "Requerido" })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                placeholder="Ej. Pérez"
              />
              {errors.lastName && (
                <span className="text-xs text-red-500">
                  {errors.lastName.message}
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              {...register("email", {
                required: "Requerido",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Email inválido",
                },
              })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              placeholder="juan@ejemplo.com"
            />
            {errors.email && (
              <span className="text-xs text-red-500">
                {errors.email.message}
              </span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Teléfono
            </label>
            <input
              {...register("phone")}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              placeholder="+1234567890"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {superAdmin ? "Nueva Contraseña (Opcional)" : "Contraseña"}
            </label>
            <input
              type="password"
              {...register("password", {
                required: !superAdmin ? "Requerido" : false,
                minLength: {
                  value: 6,
                  message: "Mínimo 6 caracteres",
                },
              })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              placeholder="******"
            />
            {errors.password && (
              <span className="text-xs text-red-500">
                {errors.password.message}
              </span>
            )}
            {superAdmin && (
              <p className="text-xs text-slate-500 mt-1">
                Dejar en blanco para mantener la actual
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium text-sm"
              disabled={isProcessing}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SuperAdminModal;
