import type { Context, Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

// clave de acceso de cada profesor -> id (debe coincidir con el frontend)
const CLAVES: Record<string, string> = {
  "2066": "p1", // Amira Aguiar
  "1112": "p2", // Ludmila Pires
  "2207": "p3", // Lucas Dominguez
  "3478": "p4", // Rodri
  "1927": "p5", // Chicho
  "6459": "p6", // Micaela Pedroso
};

export default async (req: Request, context: Context) => {
  const store = getStore("rutinas");
  const url = new URL(req.url);

  if (req.method === "GET") {
    const key = url.searchParams.get("key");
    if (!key) {
      return new Response(JSON.stringify({ error: "falta el parámetro key" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }
    const text = await store.get(key, { type: "text" });
    return new Response(JSON.stringify({ text: text || null }), {
      headers: { "content-type": "application/json" },
    });
  }

  if (req.method === "POST") {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "body inválido" }), { status: 400 });
    }
    const { key, text, clave } = body || {};
    if (!key || typeof text !== "string" || !clave) {
      return new Response(JSON.stringify({ error: "faltan datos" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }
    if (!CLAVES[clave]) {
      return new Response(JSON.stringify({ error: "clave inválida" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      });
    }
    await store.set(key, text);
    return new Response(JSON.stringify({ ok: true }), {
      headers: { "content-type": "application/json" },
    });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: "/api/rutina",
};
