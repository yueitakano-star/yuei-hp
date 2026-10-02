/** Public origin of ケヤキクリエイト (the web subdomain). Unset or non-https → undefined, so links stay hidden. */
export function keyakiUrl(env: string | undefined = process.env.NEXT_PUBLIC_KEYAKI_URL): string | undefined {
  const v = env?.trim();
  if (!v || !/^https:\/\//.test(v)) return undefined;
  return v.replace(/\/+$/, "");
}
