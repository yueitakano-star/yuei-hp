import Link from "next/link";
import { Reveal } from "@/components/effects/reveal";
import { SectionEyebrow } from "@/components/sections/home/section-eyebrow";
import type { Business } from "@/lib/content";

type Pricing = NonNullable<Business["pricing"]>;

const yen = (n: number) => `${n.toLocaleString("ja-JP")}円`;

/**
 * Signage business: ad slot price list (tax included) with the video
 * resolution per screen. Rows are stacked cards on phones and a table from md.
 */
export function SignagePricing({ pricing, basePath }: { pricing: Pricing; basePath: string }) {
  const loopMinutes = (pricing.slots * pricing.seconds) / 60;
  return (
    <section data-testid="pricing" aria-labelledby="pricing-heading" className="bg-surface py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal>
          <SectionEyebrow>PRICE</SectionEyebrow>
          <h2 id="pricing-heading" className="mt-4 text-3xl font-bold text-ink md:text-5xl">
            広告掲載料金
          </h2>
          <p className="mt-5 text-sm leading-[1.9] text-ink-muted [word-break:auto-phrase] md:text-base">
            全{pricing.slots}枠・1枠{pricing.seconds}秒の広告を順番に放映します（{pricing.slots}枠 × {pricing.seconds}秒 ={" "}
            {pricing.slots * pricing.seconds}秒、約{loopMinutes}分に1回の再生）。料金はすべて月額・税込です。
          </p>
        </Reveal>

        <Reveal delay={0.08} className="mt-10 md:mt-14">
          <table className="w-full border-t border-line text-left">
            <caption className="sr-only">広告掲載料金と配信動画の解像度</caption>
            <thead className="sr-only md:not-sr-only md:table-header-group">
              <tr className="border-b border-line text-xs font-bold tracking-[0.1em] text-brand-blue md:text-sm">
                <th scope="col" className="py-4 md:w-[40%]">設置拠点</th>
                <th scope="col" className="py-4">配信動画の解像度</th>
                <th scope="col" className="py-4 text-right">販売価格（月額・税込）</th>
              </tr>
            </thead>
            <tbody>
              {pricing.plans.map((p) => (
                <tr
                  key={p.venue}
                  className="grid grid-cols-2 gap-x-4 gap-y-1 border-b border-line py-5 md:table-row md:py-0"
                >
                  <th scope="row" className="col-span-2 text-base font-bold text-ink md:table-cell md:py-6 md:text-lg">
                    <Link href={`${basePath}/${p.venue}`} className="transition-colors duration-hover hover:text-brand-blue">
                      {p.name}
                    </Link>
                  </th>
                  <td className="text-sm text-ink-muted md:table-cell md:py-6 md:text-base">
                    <span className="md:hidden">解像度 </span>
                    横{p.resolution.split("×")[0]} × 縦{p.resolution.split("×")[1]} px
                  </td>
                  <td className="text-right text-lg font-bold text-ink md:table-cell md:py-6 md:text-2xl">
                    {yen(p.price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>

        {pricing.bundle && (
          <Reveal delay={0.12} className="mt-8 md:mt-10">
            <div className="flex flex-col gap-3 rounded-card border border-brand-blue/30 bg-brand-sky/20 p-6 md:flex-row md:items-center md:justify-between md:p-10">
              <div>
                <p className="text-xs font-bold tracking-[0.1em] text-brand-blue md:text-sm">セット販売</p>
                <p className="mt-2 text-sm leading-[1.9] text-ink [word-break:auto-phrase] md:text-base">
                  {pricing.bundle.venues.join("・")}の{pricing.bundle.venues.length}拠点セット
                </p>
              </div>
              <p className="text-2xl font-bold text-ink md:text-4xl">
                {yen(pricing.bundle.price)}
                <span className="ml-2 text-sm font-normal text-ink-muted">（月額・税込）</span>
              </p>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
