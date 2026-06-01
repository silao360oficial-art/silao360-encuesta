// src/components/AdminPanel.tsx
import { useState, useEffect } from "react";
import { sb, sbUpdate } from "../../supabase";
import StatsDisplay from "./StatsDisplay";

type Status = "pendiente" | "publicado" | "rechazado";

export default function AdminPanel() {
  const [reportes, setReportes] = useState<any[]>([]);
  const [filtro, setFiltro]     = useState<Status>("pendiente");
  const [loading, setLoading]   = useState(false);

  const cargar = async () => {
    setLoading(true);
    const data = await sb.from("foro").select("*")
      .eq("status", filtro)
      .order("created_at", { ascending: false });
    if (Array.isArray(data)) setReportes(data);
    setLoading(false);
  };

  const cambiarStatus = async (id: number, status: Status) => {
    await sbUpdate("foro", { status }, "id", id);
    cargar();
  };

  useEffect(() => { cargar(); }, [filtro]);

  const TABS: Status[] = ["pendiente", "publicado", "rechazado"];
  const COLORES: Record<Status, string> = {
    pendiente:  "#BA7517",
    publicado:  "#1D9E75",
    rechazado:  "#A32D2D",
  };

  return (
    <div style={{ padding:20, maxWidth:700, margin:"0 auto" }}>
      <h2 style={{ fontSize:18, fontWeight:500, marginBottom:20 }}>
        Panel Admin – Silao 360
      </h2>

      <div style={{
        background:"var(--color-background-secondary)", borderRadius:12,
        padding:16, marginBottom:24,
        border:"1px solid var(--color-border-tertiary)"
      }}>
        <p style={{ fontSize:13, fontWeight:500, marginBottom:12,
          color:"var(--color-text-secondary)" }}>
          Estadísticas en vivo
        </p>
        <StatsDisplay />
      </div>

      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setFiltro(t)} style={{
            padding:"6px 14px", borderRadius:20, fontSize:13, cursor:"pointer",
            fontWeight: filtro === t ? 500 : 400,
            background: filtro === t ? COLORES[t] : "var(--color-background-secondary)",
            color: filtro === t ? "#fff" : "var(--color-text-secondary)",
            border:`1px solid ${filtro === t ? COLORES[t] : "var(--color-border-tertiary)"}`,
          }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {loading
        ? <p style={{ color:"var(--color-text-secondary)", fontSize:14 }}>Cargando...</p>
        : reportes.length === 0
          ? <p style={{ color:"var(--color-text-secondary)", fontSize:14 }}>
              No hay mensajes {filtro}s.
            </p>
          : reportes.map(r => (
            <div key={r.id} style={{
              background:"var(--color-background-secondary)", borderRadius:10,
              padding:14, marginBottom:12,
              border:"1px solid var(--color-border-tertiary)"
            }}>
              <div style={{ display:"flex", gap:8, marginBottom:6 }}>
                <span style={{ fontSize:11, fontWeight:500,
                  color:"var(--color-text-secondary)" }}>
                  {r.autor} · {new Date(r.created_at).toLocaleDateString("es-MX")}
                </span>
              </div>
              <p style={{ fontSize:14, margin:"0 0 8px", lineHeight:1.5 }}>
                {r.contenido}
              </p>
              {r.foto_url && (
                <img src={r.foto_url} alt="foto"
                  style={{ maxHeight:140, borderRadius:6, marginBottom:8, objectFit:"cover" }} />
              )}
              {filtro === "pendiente" && (
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={() => cambiarStatus(r.id, "publicado")} style={{
                    padding:"5px 12px", borderRadius:6, fontSize:12, cursor:"pointer",
                    background:"#1D9E75", color:"#fff", border:"none", fontWeight:500,
                  }}>
                    ✓ Publicar
                  </button>
                  <button onClick={() => cambiarStatus(r.id, "rechazado")} style={{
                    padding:"5px 12px", borderRadius:6, fontSize:12, cursor:"pointer",
                    background:"var(--color-background-tertiary)",
                    color:"var(--color-text-secondary)", border:"none",
                  }}>
                    Rechazar
                  </button>
                </div>
              )}
            </div>
          ))
      }
    </div>
  );
}
