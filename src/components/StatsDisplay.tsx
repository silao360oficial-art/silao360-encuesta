// src/components/StatsDisplay.tsx
import { useVotes } from "../hooks/useVotes";

const COLORES: Record<string, string> = {
  MORENA: "#8B0000",
  PAN:    "#003A8C",
  PRI:    "#006400",
  MC:     "#FF6600",
  PVEM:   "#228B22",
  PT:     "#CC0000",
};

export default function StatsDisplay() {
  const { stats, loading } = useVotes();
  const total = stats.reduce((s, r) => s + Number(r.votos), 0);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <span style={{
          width:8, height:8, borderRadius:"50%", background:"#1D9E75",
          display:"inline-block", animation:"pulse 2s infinite"
        }}/>
        <span style={{ fontSize:13, color:"var(--color-text-secondary)" }}>
          En vivo · {total.toLocaleString()} votos
        </span>
      </div>

      {loading && stats.length === 0
        ? <p style={{ fontSize:14, color:"var(--color-text-secondary)" }}>Cargando...</p>
        : stats.map(s => {
          const pct = total > 0 ? Math.round((Number(s.votos) / total) * 100) : 0;
          const color = COLORES[s.partido] ?? "#888";
          return (
            <div key={s.partido}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:14, marginBottom:6 }}>
                <span style={{ fontWeight:500 }}>{s.partido}</span>
                <span style={{ color:"var(--color-text-secondary)" }}>
                  {pct}% · {Number(s.votos).toLocaleString()}
                </span>
              </div>
              <div style={{ height:10, borderRadius:5, background:"var(--color-background-tertiary)", overflow:"hidden" }}>
                <div style={{
                  height:"100%", borderRadius:5, width:`${pct}%`,
                  background:color, transition:"width 0.6s ease"
                }}/>
              </div>
            </div>
          );
        })
      }
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </div>
  );
}
