import { z } from "zod";
import {
  DEFAULT_CONTACT_FROM,
  isMailConfigured,
  sendContactEmail,
  type ContactEmailPayload,
  type MailEnv,
} from "./mail";

export const enProjectTypes = ["website", "webapp", "creative", "other"] as const;
export const enBudgets = ["", "under-3k", "3k-10k", "10k-30k", "30k-plus", "unsure"] as const;

export const enProjectLabels: Record<(typeof enProjectTypes)[number], string> = {
  website: "Website",
  webapp: "Web app",
  creative: "Creative / advertising",
  other: "Other",
};

export const enBudgetLabels: Record<(typeof enBudgets)[number], string> = {
  "": "(not given)",
  "under-3k": "Under $3,000",
  "3k-10k": "$3,000 - $10,000",
  "10k-30k": "$10,000 - $30,000",
  "30k-plus": "$30,000+",
  unsure: "Not sure yet",
};

export const EnContactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Please enter your name.")
    .max(80, "Name must be 80 characters or fewer."),
  email: z
    .string()
    .trim()
    .max(200, "Email must be 200 characters or fewer.")
    .pipe(z.email("Please enter a valid email address.")),
  company: z.string().trim().max(120, "Company must be 120 characters or fewer.").default(""),
  projectType: z.enum(enProjectTypes, { message: "Please choose a project type." }),
  budget: z.enum(enBudgets, { message: "Please choose a valid budget." }).default(""),
  timeline: z.string().trim().max(120, "Timeline must be 120 characters or fewer.").default(""),
  message: z
    .string()
    .trim()
    .min(20, "Please write at least 20 characters.")
    .max(3000, "Message must be 3000 characters or fewer."),
  consent: z.literal(true, { message: "Please agree to be contacted." }),
  website: z.string().max(0).default(""),
});

export type EnContactData = z.infer<typeof EnContactSchema>;

export type EnContactResult =
  | { status: "success" }
  | { status: "invalid"; errors: Record<string, string> }
  | { status: "disabled" }
  | { status: "error" };

const present = (v: string | undefined) => typeof v === "string" && v.trim() !== "";
const splitAddresses = (v: string) =>
  v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
/** Line breaks would let a value add mail headers; keep one-liners flat. */
const oneLine = (s: string) => s.replace(/[\r\n\p{Zl}\p{Zp}]+/gu, " ").trim();

export function buildEnContactEmail(data: EnContactData, env: MailEnv): ContactEmailPayload {
  const label = enProjectLabels[data.projectType];
  const name = oneLine(data.name);
  const text = [
    "Inquiry from the English page of web.yuei-japan.com (KEYAKI CREATE).",
    "",
    `Project type: ${label}`,
    `Name: ${name}`,
    `Company: ${oneLine(data.company) || "(not given)"}`,
    `Email: ${oneLine(data.email)}`,
    `Budget: ${enBudgetLabels[data.budget]}`,
    `Timeline: ${oneLine(data.timeline) || "(not given)"}`,
    "",
    "Message:",
    data.message,
  ].join("\n");
  return {
    from: present(env.CONTACT_FROM) ? env.CONTACT_FROM!.trim() : DEFAULT_CONTACT_FROM,
    to: splitAddresses(env.CONTACT_TO ?? ""),
    reply_to: oneLine(data.email),
    subject: oneLine(`[EN inquiry] ${label} - ${name}`),
    text,
  };
}

export async function submitEnContact(
  values: unknown,
  env: MailEnv,
  fetchImpl: typeof fetch = fetch,
): Promise<EnContactResult> {
  try {
    const hp = (values as { website?: unknown } | null)?.website;
    if (typeof hp === "string" && hp.trim() !== "") return { status: "success" };
    const parsed = EnContactSchema.safeParse(values);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!errors[key]) errors[key] = issue.message;
      }
      return { status: "invalid", errors };
    }
    if (!isMailConfigured(env)) return { status: "disabled" };
    const payload = buildEnContactEmail(parsed.data, env);
    const ok = await sendContactEmail(payload, env.RESEND_API_KEY!, fetchImpl);
    return ok ? { status: "success" } : { status: "error" };
  } catch {
    return { status: "error" };
  }
}

const PROD_ORIGIN = "https://web.yuei-japan.com";
const DEV_ORIGINS = ["http://localhost:3101", "http://localhost:3102"];

export function isAllowedOrigin(origin: string | null, nodeEnv: string | undefined): boolean {
  if (!origin) return false;
  if (origin === PROD_ORIGIN) return true;
  return nodeEnv !== "production" && DEV_ORIGINS.includes(origin);
}
