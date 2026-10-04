import { describe, it, expect, vi, afterEach } from "vitest";
import {
  EnContactSchema,
  buildEnContactEmail,
  isAllowedOrigin,
  submitEnContact,
} from "@/lib/contact/en";
import { RESEND_ENDPOINT } from "@/lib/contact/mail";
import { OPTIONS, POST } from "@/app/api/contact-en/route";

const valid = {
  name: "Jane Doe",
  email: "jane@example.com",
  company: "Acme",
  projectType: "website",
  budget: "3k-10k",
  timeline: "Q1",
  message: "We would like a new marketing website for our company.",
  consent: true,
  website: "",
};
const env = { RESEND_API_KEY: "k", CONTACT_TO: "a@x.com, b@x.com", CONTACT_FROM: "from@x.com" };
const okFetch = () => vi.fn(async () => new Response("{}", { status: 200 })) as unknown as typeof fetch;

describe("EnContactSchema", () => {
  it("accepts a valid payload and applies defaults", () => {
    const r = EnContactSchema.safeParse({
      name: "A",
      email: "a@b.co",
      projectType: "other",
      message: "x".repeat(20),
      consent: true,
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.budget).toBe("");
  });
  it.each([
    ["short message", { message: "short" }],
    ["bad email", { email: "nope" }],
    ["consent false", { consent: false }],
    ["unknown projectType", { projectType: "x" }],
    ["long name", { name: "n".repeat(81) }],
  ])("rejects %s", (_l, patch) => {
    expect(EnContactSchema.safeParse({ ...valid, ...patch }).success).toBe(false);
  });
});

describe("submitEnContact", () => {
  afterEach(() => vi.restoreAllMocks());
  it("honeypot: success, no fetch", async () => {
    const f = okFetch();
    expect(await submitEnContact({ ...valid, website: "http://spam" }, env, f)).toEqual({ status: "success" });
    expect(f).not.toHaveBeenCalled();
  });
  it("invalid returns field errors", async () => {
    const r = await submitEnContact({ ...valid, email: "bad" }, env, okFetch());
    expect(r.status).toBe("invalid");
    if (r.status === "invalid") expect(r.errors.email).toBeTruthy();
  });
  it("disabled when mail not configured", async () => {
    expect(await submitEnContact(valid, {}, okFetch())).toEqual({ status: "disabled" });
  });
  it("error on Resend 500 and on throw", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const f500 = vi.fn(async () => new Response("no", { status: 500 })) as unknown as typeof fetch;
    expect(await submitEnContact(valid, env, f500)).toEqual({ status: "error" });
    const fThrow = vi.fn(async () => {
      throw new Error("net");
    }) as unknown as typeof fetch;
    expect(await submitEnContact(valid, env, fThrow)).toEqual({ status: "error" });
  });
  it("success calls Resend once with to/from/reply_to", async () => {
    const f = okFetch();
    expect(await submitEnContact(valid, env, f)).toEqual({ status: "success" });
    expect(f).toHaveBeenCalledTimes(1);
    const [url, init] = (f as unknown as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    expect(url).toBe(RESEND_ENDPOINT);
    const body = JSON.parse(init.body as string);
    expect(body.to).toEqual(["a@x.com", "b@x.com"]);
    expect(body.from).toBe("from@x.com");
    expect(body.reply_to).toBe("jane@example.com");
    expect(body.subject).toBe("[EN inquiry] Website - Jane Doe");
    expect(body.text).toContain("Inquiry from the English page of web.yuei-japan.com (KEYAKI CREATE).");
    expect(body.text).toContain("Budget: $3,000 - $10,000");
  });
});

describe("buildEnContactEmail", () => {
  it("flattens line breaks in name and email", () => {
    const data = EnContactSchema.parse(valid);
    const p = buildEnContactEmail({ ...data, name: "a\r\nBcc: x@y.z", email: "a\r\nBcc: x@y.z" }, env);
    expect(p.subject).not.toMatch(/[\r\n]/);
    expect(p.reply_to).not.toMatch(/[\r\n]/);
    expect(p.text.split("\n").some((l) => l.startsWith("Bcc:"))).toBe(false);
  });
  it("shows (not given) for empty optional fields", () => {
    const p = buildEnContactEmail(EnContactSchema.parse({ ...valid, budget: "", company: "", timeline: "" }), env);
    expect(p.text).toContain("Budget: (not given)");
  });
});

describe("isAllowedOrigin", () => {
  it.each([
    ["https://web.yuei-japan.com", "production", true],
    ["http://localhost:3101", "production", false],
    ["http://localhost:3102", "production", false],
    ["http://localhost:3101", "development", true],
    ["http://localhost:3102", undefined, true],
    ["https://evil.com", "development", false],
    ["https://web.yuei-japan.com.evil.com", "development", false],
    [null, "development", false],
  ])("%s in %s -> %s", (o, e, exp) => {
    expect(isAllowedOrigin(o, e)).toBe(exp);
  });
});

describe("route handlers", () => {
  const ORIGIN = "https://web.yuei-japan.com";
  const url = "https://example.com/api/contact-en";
  const post = (body: string, origin: string | null = ORIGIN, headers: Record<string, string> = {}) =>
    POST(
      new Request(url, {
        method: "POST",
        body,
        headers: { "content-type": "application/json", ...(origin ? { origin } : {}), ...headers },
      }),
    );

  it("OPTIONS preflight headers for allowed origin", async () => {
    const res = await OPTIONS(new Request(url, { method: "OPTIONS", headers: { origin: ORIGIN } }));
    expect(res.status).toBe(204);
    expect(res.headers.get("access-control-allow-origin")).toBe(ORIGIN);
    expect(res.headers.get("access-control-allow-methods")).toBe("POST, OPTIONS");
    expect(res.headers.get("access-control-allow-headers")).toBe("content-type");
    expect(res.headers.get("access-control-max-age")).toBe("600");
    expect(res.headers.get("vary")).toBe("Origin");
  });
  it("OPTIONS 403 for forbidden origin", async () => {
    const res = await OPTIONS(new Request(url, { method: "OPTIONS", headers: { origin: "https://evil.com" } }));
    expect(res.status).toBe(403);
  });
  it("POST 403 for forbidden or missing origin", async () => {
    for (const o of ["https://evil.com", null]) {
      const res = await post(JSON.stringify(valid), o);
      expect(res.status).toBe(403);
      expect(await res.json()).toEqual({ status: "forbidden" });
    }
  });
  it("POST 400 on bad JSON", async () => {
    const res = await post("{nope");
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ status: "invalid", errors: {} });
    expect(res.headers.get("access-control-allow-origin")).toBe(ORIGIN);
  });
  it("POST 413 on oversized body", async () => {
    const res = await post(JSON.stringify({ message: "x".repeat(20_001) }));
    expect(res.status).toBe(413);
    const res2 = await post("{}", ORIGIN, { "content-length": "20001" });
    expect(res2.status).toBe(413);
  });
  it("POST 422 on invalid payload", async () => {
    const res = await post(JSON.stringify({ ...valid, email: "bad" }));
    expect(res.status).toBe(422);
  });
  it("POST honeypot -> 200 with CORS headers", async () => {
    const res = await post(JSON.stringify({ ...valid, website: "spam" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "success" });
    expect(res.headers.get("access-control-allow-origin")).toBe(ORIGIN);
    expect(res.headers.get("vary")).toBe("Origin");
    expect(res.headers.get("cache-control")).toBe("no-store");
  });
});
