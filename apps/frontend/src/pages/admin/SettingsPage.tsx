import { useState } from "react";
import { Save, AlertTriangle } from "lucide-react";

const SettingsPage = () => {
  const [plans] = useState([
    { name: "Basic", price: 29.99, features: "Up to 50 Units" },
    { name: "Pro", price: 59.99, features: "Up to 150 Units" },
    { name: "Enterprise", price: 99.99, features: "Unlimited Units" },
  ]);

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
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">
            Planes y Precios
          </h2>
          <p className="text-sm text-slate-500">
            Define los precios base para los condominios
          </p>
        </div>

        <div className="p-6 grid gap-6 md:grid-cols-3">
          {plans.map((plan, idx) => (
            <div key={idx} className="p-4 border border-slate-200 rounded-lg">
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nombre del Plan
                </label>
                <input
                  type="text"
                  value={plan.name}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                  readOnly
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Precio Mensual ($)
                </label>
                <input
                  type="number"
                  value={plan.price}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Límites
                </label>
                <input
                  type="text"
                  value={plan.features}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                  readOnly
                />
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 bg-slate-50 flex justify-end">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm opacity-50 cursor-not-allowed">
            <Save size={18} />
            <span>Guardar Cambios</span>
          </button>
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
    </div>
  );
};

export default SettingsPage;
