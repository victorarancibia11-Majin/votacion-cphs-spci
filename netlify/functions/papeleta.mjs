import { TURNOS } from "../lib/datos.mjs";
import { store, json, leerConfig, yaVoto as votoVigente } from "../lib/almacen.mjs";

// GET /api/papeleta -> turnos con sus candidatos, si están abiertos, y si este dispositivo ya votó
export default async (req, context) => {
  const cfg = await leerConfig(store());
  const turnos = {};
  for (const [t, d] of Object.entries(TURNOS))
    turnos[t] = { nombre: d.nombre, candidatos: d.candidatos, abierta: cfg[t].abierta };
  const yaVoto = votoVigente(context.cookies.get("cphs_voto"), cfg);
  return json({ turnos, yaVoto });
};

export const config = { path: "/api/papeleta", method: "GET" };
