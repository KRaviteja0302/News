import { db } from '@/lib/db';
import { BarChart3, MousePointerClick, Users } from 'lucide-react';
import Link from 'next/link';

function deviceName(userAgent:string|null){const ua=userAgent||'';if(/mobile|android|iphone/i.test(ua))return 'Mobile';if(/ipad|tablet/i.test(ua))return 'Tablet';return 'Desktop';}
function sourceName(value:string|null){if(!value)return 'Direct / unknown';try{return new URL(value).host;}catch{return 'Unknown';}}
export default async function AdAnalyticsPage({searchParams}:{searchParams:Promise<{page?:string}>}){
  const q=await searchParams;
  const pageSize=20;
  const requestedPage=Math.max(1,Number(q.page)||1);
  const since=new Date();since.setDate(since.getDate()-30);
  const [ads,total,last30,uniqueSample]=await Promise.all([
    db.advertisement.findMany({include:{user:true,_count:{select:{clicks:true}}},orderBy:{createdAt:'desc'}}),
    db.adClick.count(),db.adClick.count({where:{createdAt:{gte:since}}})
    ,db.adClick.findMany({select:{id:true,advertisementId:true,ipAddress:true},orderBy:{createdAt:'desc'},take:100})
  ]);
  const totalPages=Math.max(1,Math.ceil(total/pageSize));
  const page=Math.min(requestedPage,totalPages);
  const recent=await db.adClick.findMany({include:{advertisement:true},orderBy:{createdAt:'desc'},skip:(page-1)*pageSize,take:pageSize});
  const unique=new Set(uniqueSample.map(c=>`${c.advertisementId}:${c.ipAddress||c.id}`)).size;
  return <><div className="adminHeader"><div><span className="kicker">Advertisement performance</span><h1>Click analytics & leads</h1><p>See which advertisement was clicked and which advertiser owns it.</p></div></div>
    <div className="stats"><div><MousePointerClick/><span>All clicks</span><strong>{total}</strong></div><div><BarChart3/><span>Last 30 days</span><strong>{last30}</strong></div><div><Users/><span>Recent unique visitors</span><strong>{unique}</strong></div></div>
    <section className="adminCard analyticsSection"><div className="cardTitle"><h2>Performance by advertisement</h2><span>{ads.length} advertisements</span></div><div className="analyticsTable"><div className="analyticsHead"><span>Advertisement</span><span>Owner</span><span>Placement</span><span>Clicks</span></div>{ads.map(ad=><div className="analyticsRow" key={ad.id}><strong>{ad.title}</strong><span>{ad.advertiserName}<small>{ad.email}</small></span><span>{ad.placement.replaceAll('_',' ')}</span><b>{ad._count.clicks}</b></div>)}</div></section>
    <section className="adminCard analyticsSection"><div className="cardTitle"><h2>Recent click leads</h2><span>{total} total · 20 per page</span></div>{recent.length?<><div className="analyticsTable"><div className="analyticsHead analyticsLeadHead"><span>Advertisement</span><span>Clicked</span><span>Source</span><span>Device</span></div>{recent.map(click=><div className="analyticsRow analyticsLeadRow" key={click.id}><strong>{click.advertisement.title}<small>{click.clickType==='WEBSITE'?'Website visit':'Banner click'}</small></strong><span>{click.createdAt.toLocaleString()}</span><span title={click.sourceUrl||''}>{sourceName(click.sourceUrl)}</span><span>{deviceName(click.userAgent)}<small>{click.ipAddress||'Anonymous'}</small></span></div>)}</div>{totalPages>1&&<nav className="adminPagination" aria-label="Analytics pages">{page>1&&<Link href={`/admin/ad-analytics?page=${page-1}`}>← Previous</Link>}<span>Page {page} of {totalPages}</span>{page<totalPages&&<Link href={`/admin/ad-analytics?page=${page+1}`}>Next →</Link>}</nav>}</>:<p className="emptyHistory">No advertisement clicks recorded yet.</p>}</section></>;
}
