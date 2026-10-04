import { isAllowedOrigin, submitEnContact } from "@/lib/contact/en";

const MAX_BODY = 20_000;

const STATUS_HTTP = { success: 200, invalid: 422, disabled: 503, error: 502 } as const;

function corsHeaders(origin: string | null): Headers {
  const h = new Headers({ Vary: "Origin", "Cache-Control": "no-store" });
  if (origin && isAllowedOrigin(origin, process.env.NODE_ENV)) {
    h.set("Access-Control-Allow-Origin", origin);
    h.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    h.set("Access-Control-Allow-Headers", "content-type");
    h.set("Access-Control-Max-Age", "600");
  }
  return h;
}

function json(body: unknown, status: number, origin: string | null): Response {
  const h = corsHeaders(origin);
  h.set("Content-Type", "application/json");
  return new Response(JSON.stringify(body), { status, headers: h });
}

export async function OPTIONS(request: Request): Promise<Response> {
  const origin = request.headers.get("origin");
  if (!isAllowedOrigin(origin, process.env.NODE_ENV)) {
    return new Response(null, { status: 403, headers: { Vary: "Origin", "Cache-Control": "no-store" } });
  }
  return new Response(null, { status: 204, headers: corsHeaders(origin) });
}

export async function POST(request: Request): Promise<Response> {
  const origin = request.headers.get("origin");
  try {
    if (!isAllowedOrigin(origin, process.env.NODE_ENV)) {
      return json({ status: "forbidden" }, 403, null);
    }
    const declared = Number(request.headers.get("content-length") ?? "0");
    if (declared > MAX_BODY) return json({ status: "too_large" }, 413, origin);
    const raw = await request.text();
    if (raw.length > MAX_BODY) return json({ status: "too_large" }, 413, origin);
    let values: unknown;
    try {
      values = JSON.parse(raw);
    } catch {
      return json({ status: "invalid", errors: {} }, 400, origin);
    }
    const result = await submitEnContact(values, {
      RESEND_API_KEY: process.env.RESEND_API_KEY,
      CONTACT_TO: process.env.CONTACT_TO,
      CONTACT_FROM: process.env.CONTACT_FROM,
    });
    return json(result, STATUS_HTTP[result.status], origin);
  } catch {
    return json({ status: "error" }, 502, origin);
  }
}
