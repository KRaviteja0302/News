import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatDate, getLocale, categoryText, postText } from "@/lib/site";
import { getInlineAds } from "@/lib/ads";
import { AdCard } from "@/components/ad-card";
import {
  CategoryHeroCarousel,
  type CategoryHeroStory,
} from "@/components/category-hero-carousel";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [category, locale] = await Promise.all([
    db.category.findUnique({
      where: { slug },
      include: {
        posts: {
          where: { status: "PUBLISHED" },
          include: { category: true },
          orderBy: { publishedAt: "desc" },
        },
      },
    }),
    getLocale(),
  ]);
  if (!category) notFound();
  const inlineAds = await getInlineAds("CATEGORY_CARDS", category.id);
  const c = categoryText(category, locale);
  const carouselPosts = category.posts
    .filter((post) => post.display === "BANNER" || post.display === "BOTH")
    .slice(0, 5);
  const cardPosts = category.posts.filter(
    (post) => post.display === "CARDS" || post.display === "BOTH",
  );
  const heroStories: CategoryHeroStory[] = carouselPosts.map((post) => {
    const content = postText(post, locale);
    return {
      id: post.id,
      slug: post.slug,
      title: content.title,
      excerpt: content.excerpt,
      imageUrl: post.imageUrl || "",
      imageAlt: post.imageAlt || content.title,
      date: formatDate(post.publishedAt),
      category: c.name,
    };
  });
  return (
    <>
      <section className="shell section categoryPage">
        <nav className="categoryBreadcrumb" aria-label="Breadcrumb">
          <a href="/">{locale === "te" ? "హోమ్" : "Home"}</a>
          <span>/</span>
          <strong>{c.name}</strong>
        </nav>
        <CategoryHeroCarousel
          stories={heroStories}
          topLabel={locale === "te" ? "ముఖ్య కథనం" : "Top story"}
          readLabel={locale === "te" ? "పూర్తి కథనం చదవండి" : "Read full story"}
        />
        <div className="archiveTitle">
          <h2>
            {locale === "te"
              ? c.name + " నుండి మరిన్ని"
              : "More from " + c.name}
          </h2>
          <span>
            {category.posts.length} {locale === "te" ? "కథనాలు" : "stories"}
          </span>
        </div>
        <div className="storyQuad categoryStoryGrid">
          {cardPosts.map((post) => {
            const content = postText(post, locale);
            return (
              <article className="compactStory" key={post.id}>
                <Link href={`/news/${post.slug}`} className="compactImage">
                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt={post.imageAlt || content.title}
                    />
                  )}
                </Link>
                <div>
                  <span>{c.name}</span>
                  <h3>
                    <Link href={`/news/${post.slug}`}>{content.title}</Link>
                  </h3>
                  <p>{content.excerpt}</p>
                  <small>{formatDate(post.publishedAt)}</small>
                </div>
              </article>
            );
          })}
        </div>
        {!!inlineAds.length && (
          <div className="cards categoryAds">
            {inlineAds.map((ad) => (
              <AdCard key={ad.id} ad={ad} />
            ))}
          </div>
        )}
        {!category.posts.length && (
          <div className="empty">
            No published stories in this category. Add one from the CMS.
          </div>
        )}
      </section>
    </>
  );
}
