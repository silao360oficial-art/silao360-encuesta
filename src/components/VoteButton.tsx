// src/components/VoteButton.tsx
import { useVotes } from "../hooks/useVotes";

interface Props {
  partido: string;
  label?: string;
}

export default function VoteButton({ partido, label }: Props) {
  const { votar, loading, error, stats } = useVotes();
  const yaVoto = false; // sin auth, cualquiera puede votar

  return (
    <div>
      <button
        onClick={() => votar(partido)}
        disabled={loading}
        style={{
          width:"100%", padding:"12px 20px", borderRadius:10,
          fontWeight:500, fontSize:15, cursor:loading ? "wait" : "pointer",
          border:"none",
          background: loading ? "var(--color-background-tertiary)" : "#534AB7",
          color: loading ? "var(--color-text-secondary)" : "#fff",
          transition:"background 0.2s",
        }}
      >
        {loading ? "Registrando..." : `Votar por ${label ?? partido}`}
      </button>
      {error && (
        <p style={{ fontSize:12, color:"var(--color-text-danger)", marginTop:6 }}>
          {error}
        </p>
      )}
    </div>
  );
}
