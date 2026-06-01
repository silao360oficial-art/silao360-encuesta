// src/components/ReporteForm.tsx
import { useState, useRef } from "react";
import { useReports } from "../hooks/useReports";

interface Props {
  candidatoId?: string;
  onEnviado?: () => void;
}

export default function ReporteForm({ candidatoId, onEnviado }: Props) {
  const { enviarReporte, loading, error } = useReports(candidatoId);
  const [autor, setAutor]       = useState("");
  const [mensaje, setMensaje]   = useState("");
  const [foto, setFoto]         = useState<File|null>(null);
  const [preview, setPreview]   = useState<string|null>(null);
  const [exito, setExito]       = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFoto(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async () => {
    if (!mensaje.trim() || !autor.trim()) return;
    await enviarReporte(autor, mensaje, foto ?? undefined);
    if (!error) {
      setAutor(""); setMensaje(""); setFoto(null); setPreview(null);
      setExito(true);
      onEnviado?.();
      setTimeout(() => setExito(false), 3000);
    }
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      <input
        placeholder="Tu nombre"
        value={autor}
        onChange={e => setAutor(e.target.value)}
        style={{
          padding:"10px 12px", borderRadius:8, fontSize:14,
          border:"1px solid var(--color-border-secondary)",
          background:"var(--color-background-secondary)",
          color:"var(--color-text-primary)",
        }}
      />
      <textarea
        rows={3}
        placeholder="Escribe tu mensaje o pregunta..."
        value={mensaje}
        onChange={e => setMensaje(e.target.value)}
        style={{
          padding:"10px 12px", borderRadius:8, fontSize:14, resize:"vertical",
          border:"1px solid var(--color-border-secondary)",
          background:"var(--color-background-secondary)",
          color:"var(--color-text-primary)",
        }}
      />

      {preview && (
        <img src={preview} alt="vista previa"
          style={{ maxHeight:160, objectFit:"cover", borderRadius:8 }} />
      )}

      <div style={{ display:"flex", gap:8 }}>
        <button onClick={() => inputRef.current?.click()} style={{
          padding:"8px 14px", borderRadius:8, fontSize:13, cursor:"pointer",
          border:"1px solid var(--color-border-secondary)",
          background:"var(--color-background-secondary)",
          color:"var(--color-text-secondary)",
        }}>
          📷 Foto
        </button>
        <input ref={inputRef} type="file" accept="image/*"
          style={{ display:"none" }} onChange={handleFoto} />

        <button
          onClick={handleSubmit}
          disabled={loading || !mensaje.trim() || !autor.trim()}
          style={{
            flex:1, padding:"8px 14px", borderRadius:8, fontSize:13,
            fontWeight:500, cursor:loading ? "wait" : "pointer",
            background: loading ? "var(--color-border-secondary)" : "#1D9E75",
            color:"#fff", border:"none",
          }}
        >
          {loading ? "Enviando..." : "Enviar mensaje"}
        </button>
      </div>

      {error && <p style={{ color:"var(--color-text-danger)", fontSize:13 }}>{error}</p>}
      {exito && <p style={{ color:"var(--color-text-success)", fontSize:13 }}>¡Mensaje enviado!</p>}
    </div>
  );
}
