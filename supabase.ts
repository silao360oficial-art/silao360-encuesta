// ── STORAGE (fotos) ──────────────────────────────────────────
export const sbStorage = {
  upload: async (bucket: string, path: string, file: File): Promise<string|null> => {
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`, {
      method: "POST",
      headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` },
      body: file,
    });
    if (!res.ok) return null;
    return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
  },
  publicUrl: (bucket: string, path: string): string =>
    `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`,
};

// ── INSERT con upsert ─────────────────────────────────────────
export const sbInsert = (table: string, data: any, upsert = false) =>
  fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      ...H,
      "Prefer": upsert ? "resolution=merge-duplicates,return=minimal" : "return=minimal",
    },
    body: JSON.stringify(data),
  }).then(r => r.ok ? { error: null } : r.json().then(e => ({ error: e })))
    .catch(e => ({ error: e }));

// ── UPDATE ────────────────────────────────────────────────────
export const sbUpdate = (table: string, data: any, col: string, val: any) =>
  fetch(`${SUPABASE_URL}/rest/v1/${table}?${col}=eq.${encodeURIComponent(val)}`, {
    method: "PATCH",
    headers: { ...H, "Prefer": "return=minimal" },
    body: JSON.stringify(data),
  }).then(r => r.ok ? { error: null } : r.json().then(e => ({ error: e })))
    .catch(e => ({ error: e }));

// ── REALTIME (escuchar cambios en una tabla) ──────────────────
export const sbListen = (table: string, callback: () => void) => {
  const wsUrl = SUPABASE_URL.replace("https://", "wss://") + "/realtime/v1/websocket"
    + `?apikey=${SUPABASE_KEY}&vsn=1.0.0`;
  const ws = new WebSocket(wsUrl);
  ws.onopen = () => {
    ws.send(JSON.stringify({
      topic: `realtime:public:${table}`,
      event: "phx_join",
      payload: {},
      ref: "1",
    }));
  };
  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.event === "INSERT" || msg.event === "UPDATE" || msg.event === "DELETE") {
      callback();
    }
  };
  return () => ws.close(); // retorna función para desconectar
};

// ── TIPOS ─────────────────────────────────────────────────────
export interface CitizenReport {
  id: number;
  candidato_id: string;
  mensaje: string;
  foto_url: string | null;
  status: "pendiente" | "publicado" | "rechazado";
  created_at: string;
}

export interface StatVoto {
  partido: string;
  votos: number;
}
