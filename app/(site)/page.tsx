import Link from "next/link";
import { db } from "@/lib/db";
import {
  getSettings,
  formatDate,
  getLocale,
  postText,
  categoryText,
} from "@/lib/site";
import { ArrowRight, Clock3 } from "lucide-react";
import { getHomeBannerAds, getInlineAds } from "@/lib/ads";
import { AdRotator } from "@/components/ad-rotator";
import { advertisementHref } from "@/lib/ad-link";
import { HomeLatestRail } from "@/components/home-latest-rail";
import {
  CategoryHeroCarousel,
  type CategoryHeroStory,
} from "@/components/category-hero-carousel";
import { HomeMiddleAds } from "@/components/home-middle-ads";
export const dynamic = "force-dynamic";
export default async function Home() {
  const [s, featured, posts, locale, inlineAds, homeBannerAds] = await Promise.all([
    getSettings(),
    db.post.findFirst({
      where: {
        status: "PUBLISHED",
        featured: true,
        display: { in: ["BANNER", "BOTH"] },
      },
      include: { category: true },
      orderBy: { publishedAt: "desc" },
    }),
    db.post.findMany({
      where: { status: "PUBLISHED" },
      include: { category: true },
      orderBy: { publishedAt: "desc" },
      take: 12,
    }),
    getLocale(),
    getInlineAds("HOME_CARDS"),
    getHomeBannerAds(),
  ]);
  const bannerPosts = posts.filter(
    (post) => post.display === "BANNER" || post.display === "BOTH",
  );
  const cardPosts = posts.filter(
    (post) => post.display === "CARDS" || post.display === "BOTH",
  );
  const lead = featured || bannerPosts[0];
  const heroPosts = lead
    ? [lead, ...bannerPosts.filter((p) => p.id !== lead.id)].slice(0, 5)
    : [];
  const secondary = cardPosts.slice(0, 4);
  const heroStories: CategoryHeroStory[] = heroPosts.map((p) => {
    const t = postText(p, locale);
    return {
      id: p.id,
      slug: p.slug,
      title: t.title,
      excerpt: t.excerpt,
      imageUrl: p.imageUrl || "",
      imageAlt: p.imageAlt || t.title,
      date: formatDate(p.publishedAt),
      category: categoryText(p.category, locale).name,
    };
  });
  return (
    <>
      <section className="breaking">
        <div className="shell breakingInner">
          <strong>LATEST NEWS</strong>
          <div className="marqueeViewport">
            <div className="marqueeTrack">
              {[0, 1].map((copy) => (
                <div
                  className="marqueeGroup"
                  aria-hidden={copy === 1}
                  key={copy}
                >
                  {posts.slice(0, 6).map((p) => (
                    <Link href={`/news/${p.slug}`} key={`${copy}-${p.id}`}>
                      <span className="liveDot" />
                      {postText(p, locale).title}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <Link className="breakingMore" href="#latest">
            VIEW ALL
          </Link>
        </div>
      </section>
      <HomeLatestRail />
      <main className="shell newspaperHome">
        <div className="newsMain">
          {homeBannerAds.length ? (
            <AdRotator ads={homeBannerAds.map(ad=>({id:ad.id,title:ad.title,imageUrl:ad.imageUrl||"",href:advertisementHref(ad)}))} className="homeHeroAd" />
          ) : (
            <Link href="/advertise" className="homeHeroAd homeHeroAdEmpty">
              <span>ADVERTISEMENT</span>
              <div>
                <strong>Your advertisement here</strong>
                <p>Premium homepage banner above the latest news carousel · 1200 × 250 px</p>
              </div>
            </Link>
          )}
          <CategoryHeroCarousel
            stories={heroStories}
            topLabel={locale === "te" ? "ముఖ్య కథనం" : "Top story"}
            readLabel={
              locale === "te" ? "పూర్తి కథనం చదవండి" : "Read full story"
            }
          />
          <section className="topStories">
            <div className="paperSectionTitle">
              <h2>Top Stories</h2>
              <span>Latest updates from our newsroom</span>
            </div>
            <div className="storyQuad">
              {secondary.map((p) => {
                const t = postText(p, locale);
                return (
                  <article className="compactStory" key={p.id}>
                    <Link href={`/news/${p.slug}`} className="compactImage">
                      {p.imageUrl && (
                        <img src={p.imageUrl} alt={p.imageAlt || t.title} />
                      )}
                      <span className="storyImageBadge">LATEST NEWS</span>
                    </Link>
                    <div>
                      <span>{categoryText(p.category, locale).name}</span>
                      <h3>
                        <Link href={`/news/${p.slug}`}>{t.title}</Link>
                      </h3>
                      <p>{t.excerpt}</p>
                      <small>{formatDate(p.publishedAt)}</small>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
          <HomeMiddleAds ads={inlineAds.slice(0, 2)} locale={locale} />
          <section id="latest" className="latestPaper">
            <div className="paperSectionTitle">
              <h2>More Stories</h2>
              <span>Explore more from our newsroom</span>
            </div>
            <div className="storyQuad">
              {cardPosts.slice(4).map((p) => {
                const t = postText(p, locale);
                return (
                  <article className="compactStory" key={p.id}>
                    <Link href={"/news/" + p.slug} className="compactImage">
                      {p.imageUrl && (
                        <img src={p.imageUrl} alt={p.imageAlt || t.title} />
                      )}
                      <span className="storyImageBadge">NEWEST</span>
                    </Link>
                    <div>
                      <span>{categoryText(p.category, locale).name}</span>
                      <h3>
                        <Link href={"/news/" + p.slug}>{t.title}</Link>
                      </h3>
                      <p>{t.excerpt}</p>
                      <small>{formatDate(p.publishedAt)}</small>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
        <aside className="adRail">
          <div className="adRailTitle">ADVERTISEMENT</div>
          {inlineAds.length > 2 ? (
            inlineAds.slice(2).map((ad) => (
              <Link
                href={advertisementHref(ad)}
                className="sideAd"
                key={ad.id}
              >
                {ad.imageUrl && <img src={ad.imageUrl} alt={ad.title} />}
                <span>Sponsored</span>
                <strong>
                  {locale === "te" && ad.titleTe ? ad.titleTe : ad.title}
                </strong>
                {ad.description && (
                  <p>
                    {locale === "te" && ad.descriptionTe
                      ? ad.descriptionTe
                      : ad.description}
                  </p>
                )}
              </Link>
            ))
          ) : (
            <Link href="/advertise" className="emptySideAd">
              <span>YOUR AD HERE</span>
              <strong>Reach thousands of engaged readers</strong>
              <b>Advertise with us →</b>
            </Link>
          )}
          <div className="newsletterBox">
            <span>THE DAILY BRIEF</span>
            <h3>News that matters, delivered clearly.</h3>
            <p>
              Follow the latest community stories, events and useful updates.
            </p>
            <Link href="#latest">Browse latest news</Link>
          </div>
          <div className="aboutPaper">
            <span>ABOUT THE PUBLICATION</span>
            <h3>{s.siteName}</h3>
            <p>
              {locale === "te" && s.heroDescriptionTe
                ? s.heroDescriptionTe
                : s.heroDescription}
            </p>
          </div>
        </aside>
      </main>
    </>
  );
}
