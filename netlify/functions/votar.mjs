import { TURNOS, BLANCO } from "../lib/datos.mjs";
import { store, json, leerConfig, yaVoto } from "../lib/almacen.mjs";

// POST /api/votar  { turno, opcion }
// Cualquiera con el enlace puede votar. Se limita a un voto por dispositivo con una cookie
// que no contiene datos personales ni se guarda junto al voto.
export default async (req, context) => {
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);
  const { turno, opcion } = await req.json().catch(() => ({}));
  const s = store();
  const cfg = await leerConfig(s);

  if (yaVoto(context.cookies.get("cphs_voto"), cfg))
    return json({ error: "Desde este dispositivo ya se emitió un voto." }, 409);

  const t = TURNOS[turno];
  if (!t) return json({ error: "Elige tu turno." }, 400);
  if (!cfg[turno].abierta) return json({ error: "La votación de este turno está cerrada." }, 403);
  if (opcion !== BLANCO && !t.candidatos.includes(opcion))
    return json({ error: "La opción elegida no es válida para este turno." }, 400);

  await s.setJSON(`votos/${turno}/${crypto.randomUUID()}`, { c: opcion }, { onlyIfNew: true });

  context.cookies.set({
    name: "cphs_voto",
    value: `${turno}:${cfg[turno].ronda}`,
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60),
  });
  return json({ ok: true });
};

export const config = { path: "/api/votar", method: "POST" };
