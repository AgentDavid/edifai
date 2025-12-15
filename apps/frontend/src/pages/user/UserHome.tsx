import { useAuth } from "../../context/AuthContext";
import { DollarSign, FileText, CalendarDays, Bell } from "lucide-react";

const UserHome = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Hola, {user?.profile.first_name}
        </h1>
        <p className="text-slate-500">Tu resumen de cuenta</p>
      </div>

      {/* Balance Card */}
      <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-400 rounded-xl text-white">
        <p className="text-sm opacity-80">Saldo Pendiente</p>
        <p className="text-4xl font-bold">$150.00</p>
        <button className="mt-4 px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors">
          Reportar Pago
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <ActionCard icon={FileText} label="Mis Recibos" />
        <ActionCard icon={CalendarDays} label="Reservar Amenidad" />
        <ActionCard icon={Bell} label="Reportar Avería" />
        <ActionCard icon={DollarSign} label="Historial de Pagos" />
      </div>

      {/* Announcements */}
      <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-semibold mb-4">Avisos del Condominio</h2>
        <ul className="space-y-3 text-sm">
          <li className="p-3 bg-blue-50 rounded-lg text-blue-800">
            <strong>Mantenimiento Programado:</strong> La piscina estará cerrada
            el sábado 20 de Diciembre.
          </li>
          <li className="p-3 bg-amber-50 rounded-lg text-amber-800">
            <strong>Recordatorio:</strong> El cierre de cuentas del mes es el 28
            de Diciembre.
          </li>
        </ul>
      </div>
    </div>
  );
};

const ActionCard = ({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) => (
  <button className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
    <Icon className="w-6 h-6 text-blue-500 mb-2" />
    <span className="text-sm text-slate-700">{label}</span>
  </button>
);

export default UserHome;
