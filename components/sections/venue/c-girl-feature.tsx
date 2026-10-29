import Image from "next/image";
import Link from "next/link";
import { Righteous, Shippori_Mincho } from "next/font/google";
import { ArrowUpRight, MapPin } from "lucide-react";
import type { Venue } from "@/lib/content";
import { paragraphs } from "@/lib/page/text";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/page/breadcrumbs";
import styles from "./c-girl-feature.module.css";

const righteous = Righteous({ subsets: ["latin"], weight: "400", variable: "--font-righteous", display: "swap" });
const shippori = Shippori_Mincho({ subsets: ["latin"], weight: "500", variable: "--font-shippori", display: "swap", preload: false });

type Props = { venue: Venue; others: Venue[]; breadcrumbs: BreadcrumbItem[] };

/** A venue-specific visual identity, within the corporate site's navigation. */
export function CGirlFeature({ venue, others, breadcrumbs }: Props) {
  const body = paragraphs(venue.body);
  const [neon, waterWall, counter] = venue.gallery;
  const links = [
    { label: "Instagram", href: venue.sns.instagram },
    { label: "X", href: venue.sns.x },
    { label: "TikTok", href: venue.sns.tiktok },
    { label: "YouTube", href: venue.sns.youtube },
    { label: "LINE", href: venue.sns.line },
  ].filter((link): link is { label: string; href: string } => Boolean(link.href));

  return (
    <article className={`${styles.page} ${righteous.variable} ${shippori.variable} cgirl-typography`}>
      <section className={styles.hero} aria-labelledby="venue-heading" data-testid="venue-hero">
        <div className={styles.art} aria-hidden="true">
          <Image src="/images/generated/c-girl-night-art.webp" alt="" fill preload sizes="100vw" className={styles.artImage} />
        </div>
        <div className={styles.heroInner}>
          <div className={styles.heroTop}>
            <span>仙台・国分町の{venue.category}</span>
            <span className={styles.heroSignature}>A little more night.</span>
          </div>
          <div className={styles.heroCopy}>
            <h1 id="venue-heading" className={styles.wordmark}>{venue.name}</h1>
            <p className={styles.heroLead}>夜に、きらめきを。</p>
            <p className={styles.heroDescription}>{venue.catchcopy}</p>
            <div className={styles.heroActions}>
              {venue.siteUrl && (
                <a className={styles.primaryLink} href={venue.siteUrl} target="_blank" rel="noopener noreferrer">
                  公式サイトを見る <ArrowUpRight aria-hidden="true" size={19} />
                  <span className="sr-only">（新しいタブで開く）</span>
                </a>
              )}
              <a className={styles.quietLink} href="#venue-info">店舗情報・アクセス</a>
            </div>
          </div>
          <div className={styles.heroBottom}>
            <p>Good music.<br />Good girls. Good time.</p>
            <span>Yuei Japan</span>
          </div>
        </div>
      </section>

      <div className={styles.detailsStrip}>
        <div className={styles.stripInner}>
          <p><span>営業時間</span>{venue.hours}</p>
          <p><span>定休日</span>{venue.closed}</p>
          {venue.mapUrl && <a href={venue.mapUrl} target="_blank" rel="noopener noreferrer"><MapPin size={17} aria-hidden="true" />国分町で、待っています。<span className="sr-only">地図を新しいタブで開く</span></a>}
        </div>
      </div>

      <section className={styles.story} aria-labelledby="cgirl-story">
        <div className={styles.storyIntro}>
          <h2 id="cgirl-story" className={styles.editorialTitle}><span>光と音に、</span><span>心がほどける。</span></h2>
          <div className={styles.storyBody}>{body.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
        </div>
        <div className={styles.photoComposition}>
          {neon && (
            <figure className={styles.neonPhoto}>
              <div className={styles.photoFrame}><Image src={neon} alt="C-girlのネオンサインとソファ席" fill sizes="(min-width: 1440px) 1344px, (min-width: 900px) calc(100vw - 6rem), calc(100vw - 3rem)" /></div>
              <figcaption>ネオンに包まれる、くつろぎの場所。</figcaption>
            </figure>
          )}
          {waterWall && (
            <figure className={styles.waterPhoto}>
              <div className={styles.photoFrame}><Image src={waterWall} alt="C-girlの光るウォーターカーテンとバーカウンター" fill sizes="(min-width: 1440px) 1344px, (min-width: 900px) calc(100vw - 6rem), calc(100vw - 3rem)" /></div>
              <figcaption>グラスを傾けて、会話をひとつ。</figcaption>
            </figure>
          )}
        </div>
      </section>

      <section className={styles.visit} aria-labelledby="venue-info">
        <div className={styles.visitIntro}>
          <p className={styles.visitEnglish}>See you<br />tonight.</p>
          <h2 id="venue-info" className={styles.visitHeading}>店舗情報・アクセス</h2>
          {counter && <div className={styles.counterPhoto}><Image src={counter} alt="C-girlのボトル棚とネオンが光るカウンター" fill sizes="(min-width: 900px) 36vw, 100vw" /></div>}
        </div>
        <div className={styles.visitDetails}>
          <dl className={styles.infoList}>
            <div><dt>店名</dt><dd>{venue.name}<small>{venue.category}</small></dd></div>
            {venue.address && <div><dt>住所</dt><dd>{venue.address}</dd></div>}
            {venue.hours && <div><dt>営業時間</dt><dd>{venue.hours}</dd></div>}
            {venue.closed && <div><dt>定休日</dt><dd>{venue.closed}</dd></div>}
            {venue.tel && <div><dt>電話番号</dt><dd><a href={`tel:${venue.tel.replace(/[^\d+]/g, "")}`}>{venue.tel}</a></dd></div>}
          </dl>
          <div className={styles.visitActions}>
            {venue.mapUrl && <a className={styles.mapLink} href={venue.mapUrl} target="_blank" rel="noopener noreferrer">Google マップで見る<ArrowUpRight size={19} aria-hidden="true" /><span className="sr-only">（新しいタブで開く）</span></a>}
            {venue.siteUrl && <a className={styles.officialLink} href={venue.siteUrl} target="_blank" rel="noopener noreferrer">料金・最新情報は公式サイトへ<ArrowUpRight size={19} aria-hidden="true" /><span className="sr-only">（新しいタブで開く）</span></a>}
          </div>
          {links.length > 0 && <ul className={styles.socialLinks}>{links.map((link) => <li key={link.label}><a href={link.href} target="_blank" rel="noopener noreferrer">{link.label}<span className="sr-only">（新しいタブで開く）</span></a></li>)}</ul>}
        </div>
      </section>

      <section className={styles.otherVenues} aria-labelledby="cgirl-other-venues">
        <div className={styles.otherHeading}>
          <h2 id="cgirl-other-venues">遊栄JAPANの、ほかのお店。</h2>
          <Link href="/business/nightlife">ナイトエンターテインメント事業</Link>
        </div>
        <div className={styles.otherGrid}>
          {others.map((other) => (
            <Link className={styles.otherLink} href={`/business/${other.business}/${other.slug}`} key={other.slug}>
              {other.heroImage && <div className={styles.otherImage}><Image src={other.heroImage} alt={`${other.name}の店内`} fill sizes="(min-width: 900px) 45vw, 100vw" /></div>}
              <div className={styles.otherCaption}><span><small>{other.category}</small><strong>{other.name}</strong></span><ArrowUpRight size={25} aria-hidden="true" /></div>
            </Link>
          ))}
        </div>
        <Breadcrumbs items={breadcrumbs} className={styles.breadcrumbs} />
      </section>
    </article>
  );
}
