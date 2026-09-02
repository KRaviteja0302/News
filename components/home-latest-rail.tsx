import Link from 'next/link';
import { db } from '@/lib/db';
import { formatDate, getLocale, postText, categoryText } from '@/lib/site';

export async function HomeLatestRail(){
  const [posts,locale]=await Promise.all([db.post.findMany({where:{status:'PUBLISHED'},include:{category:true},orderBy:{publishedAt:'desc'},take:5}),getLocale()]);
  return <aside className="homeLatestOverlay"><div className="latestRailHead"><span>NEWSROOM</span><h2>Latest News</h2></div>{posts.map(p=>{const t=postText(p,locale);return <article key={p.id}><span>{categoryText(p.category,locale).name}</span><h3><Link href={`/news/${p.slug}`}>{t.title}</Link></h3><p>{t.excerpt}</p><small>{formatDate(p.publishedAt)}</small></article>})}</aside>
}
