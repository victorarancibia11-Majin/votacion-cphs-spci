import { getStore } from "@netlify/blobs";
import { TURNOS } from "./datos.mjs";

// Un solo almacén con consistencia fuerte: los votos se ven al instante.
export const store = () => getStore({ name: "votacion-comite", consistency: "strong" });

// Claves:
//   config            -> { A: { abierta, ronda }, B: { abierta, ronda } }
//   votos/<T>/<uuid>  -> { c: "Nombre" }   (sin hora ni datos del votante)

export const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers },
  });

export async function leerConfig(s) {
  const cfg = (await s.get("config", { type: "json" })) || {};
  // "ronda" cambia al reiniciar un turno, para que los dispositivos de ese turno puedan volver a votar.
  for (const t of Object.keys(TURNOS)) cfg[t] = { abierta: cfg[t]?.abierta !== false, ronda: cfg[t]?.ronda || "1" };
  return cfg;
}

// ¿La cookie de este dispositivo corresponde a un voto vigente en algún turno?
export const yaVoto = (cookie, cfg) =>
  !!cookie && Object.keys(TURNOS).some((t) => cookie === `${t}:${cfg[t].ronda}`);
