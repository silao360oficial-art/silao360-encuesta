// src/hooks/useVotes.ts
import { useState, useEffect, useCallback } from "react";
import { sb, sbInsert, sbListen } from "../../supabase";

export function useVotes() {
  const [stats, setStats]   = useState<{partido:string; votos:number}[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string|null>(null);

  const cargarStats = useCallback(async () => {
    const data = await sb.from("votos_web").select("partido,votos").order("votos", {ascending:false});
    if (Array.isArray(data)) setStats(data);
  }, []);

  const votar = async (partido: string) => {
    setLoading(true);
    setError(null);
    // Suma 1 al total del partido
    const actual = stats.find(s => s.partido === partido);
    const nuevos = (actual?.votos ?? 0) + 1;
    const { error: err } = await sbInsert("votos_web", { partido, votos: nuevos }, true);
    if (err) setError("No se pudo registrar el voto");
    else await cargarStats();
    setLoading(false);
  };

  useEffect(() => {
    cargarStats();
    const desconectar = sbListen("votos_web", cargarStats);
    return desconectar;
  }, [cargarStats]);

  return { stats, loading, error, votar };
}
