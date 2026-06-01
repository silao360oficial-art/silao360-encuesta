// src/hooks/useReports.ts
import { useState, useEffect, useCallback } from "react";
import { sb, sbInsert, sbStorage } from "../../supabase";
import { CitizenReport } from "../../supabase";

export function useReports(candidatoId?: string) {
  const [reportes, setReportes] = useState<CitizenReport[]>([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string|null>(null);

  const cargarReportes = useCallback(async () => {
    let q = sb.from("foro").select("*").order("created_at", { ascending: false });
    if (candidatoId) q = q.eq("candidato_id", candidatoId);
    const data = await q;
    if (Array.isArray(data)) setReportes(data);
  }, [candidatoId]);

  const subirFoto = async (archivo: File): Promise<string|null> => {
    const nombre = `reportes/${Date.now()}-${Math.random().toString(36).slice(2)}.${archivo.name.split(".").pop()}`;
    return await sbStorage.upload("fotos-silao", nombre, archivo);
  };

  const enviarReporte = async (autor: string, contenido: string, foto?: File) => {
    setLoading(true);
    setError(null);
    let foto_url: string|null = null;
    if (foto) foto_url = await subirFoto(foto);
    const { error: err } = await sbInsert("foro", { autor, contenido, foto_url });
    if (err) setError("No se pudo enviar el mensaje");
    else await cargarReportes();
    setLoading(false);
  };

  useEffect(() => { cargarReportes(); }, [cargarReportes]);

  return { reportes, loading, error, enviarReporte };
}
