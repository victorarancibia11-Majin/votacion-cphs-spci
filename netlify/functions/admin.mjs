import { TURNOS, BLANCO } from "../lib/datos.mjs";
import { store, json, leerConfig } from "../lib/almacen.mjs";

async function estadoTurno(s, t, cfg) {
  const { blobs: votos } = await s.list({ prefix: `votos/${t}/` });
  const conteo = {};
  let blancos = 0;
  for (const b of votos) {
    const d = await s.get(b.key, { type: "json" });
    if (d?.c === BLANCO) blancos++;
    else if (d?.c) conteo[d.c] = (conteo[d.c] || 0) + 1;
  }
  const resultados = Object.entries(conteo)
    .map(([nombre, votos]) => ({ nombre, votos }))
    .sort((a, b) => b.votos - a.votos || a.nombre.localeCompare(b.nombre, "es"));
  return {
    turno: t,
    nombre: TURNOS[t].nombre,
    votantes: TURNOS[t].votantes,
    abierta: cfg[t].abierta,
    votosEmitidos: votos.length,
    blancos,
    resultados,
  };
}

// POST /api/admin  (cabecera x-admin-key)  { accion, turno? }
export default async (req) => {
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);
  const clave = Netlify.env.get("ADMIN_KEY");
  if (!clave) return json({ error: "Falta configurar la variable ADMIN_KEY en Netlify." }, 500);
  if (req.headers.get("x-admin-key") !== clave) return json({ error: "Clave incorrecta." }, 401);

  const { accion, turno } = await req.json().catch(() => ({}));
  const s = store();
  const cfg = await leerConfig(s);
  if (turno && !TURNOS[turno]) return json({ error: "Turno no válido." }, 400);

  if (accion === "estado") {
    const turnos = [];
    for (const t of Object.keys(TURNOS)) turnos.push(await estadoTurno(s, t, cfg));
    return json({ turnos });
  }

  if (accion === "alternar") {
    cfg[turno].abierta = !cfg[turno].abierta;
    await s.setJSON("config", cfg);
    return json({ abierta: cfg[turno].abierta });
  }

  if (accion === "reiniciar") {
    const { blobs } = await s.list({ prefix: `votos/${turno}/` });
    for (const b of blobs) await s.delete(b.key);
    // Nueva ronda: los dispositivos que votaron en este turno pueden volver a votar.
    cfg[turno] = { abierta: true, ronda: crypto.randomUUID().slice(0, 8) };
    await s.setJSON("config", cfg);
    return json({ ok: true });
  }

  return json({ error: "Acción no reconocida." }, 400);
};

export const config = { path: "/api/admin", method: "POST" };
