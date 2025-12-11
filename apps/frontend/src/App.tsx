import { useEffect, useState } from "react";
import { type ApiResponse, fetchHello } from "./services/api";
import "./index.css";

function App() {
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHello()
      .then((data) => setApiData(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div
        style={{
          background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
        }}
      >
        <div className="container">
          <nav className="nav">
            <div className="logo">ConAdmin</div>
            <div>
              <button style={{ background: "rgba(255,255,255,0.2)" }}>
                Iniciar Sesión
              </button>
            </div>
          </nav>
        </div>

        <section className="hero">
          <div className="container">
            <h1>Gestión Inteligente de Condominios</h1>
            <p>
              Simplifica la administración de tu comunidad con nuestra
              plataforma integral. Pagos, comunicación y gestión en un solo
              lugar.
            </p>
            <button
              style={{
                fontSize: "1.2rem",
                padding: "0.8rem 2rem",
                background: "white",
                color: "#2563eb",
              }}
            >
              Comenzar Ahora
            </button>

            <div style={{ marginTop: "3rem" }}>
              {loading ? (
                <div className="api-status">Conectando con el servidor...</div>
              ) : apiData ? (
                <div className="api-status">
                  ✅ Backend Conectado: {apiData.message} <br />
                  <small>{new Date(apiData.timestamp).toLocaleString()}</small>
                </div>
              ) : (
                <div
                  className="api-status"
                  style={{
                    background: "#fef2f2",
                    borderColor: "#ef4444",
                    color: "#991b1b",
                  }}
                >
                  ❌ Error de conexión con el Backend
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <main className="container">
        <div className="features">
          <div className="card">
            <h3>🏦 Gestión Financiera</h3>
            <p className="text-light">
              Control total de gastos, ingresos y morosidad. Genera reportes
              automáticos y mantén las cuentas claras.
            </p>
          </div>
          <div className="card">
            <h3>📢 Comunicación Efectiva</h3>
            <p className="text-light">
              Notificaciones instantáneas, votaciones en línea y chat
              comunitario para mantener a todos informados.
            </p>
          </div>
          <div className="card">
            <h3>🛠️ Mantenimiento</h3>
            <p className="text-light">
              Gestiona tickets de soporte, reserva de áreas comunes y
              seguimiento de proveedores fácilmente.
            </p>
          </div>
        </div>
      </main>

      <footer
        style={{
          background: "#1e293b",
          color: "white",
          padding: "3rem 0",
          marginTop: "auto",
        }}
      >
        <div
          className="container"
          style={{ textAlign: "center", opacity: 0.8 }}
        >
          <p>© 2024 ConAdmin. Todos los derechos reservados.</p>
        </div>
      </footer>
    </>
  );
}

export default App;
