import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { getLocale } from '@/lib/site';
import { ArrowUpRight, Megaphone } from 'lucide-react';

export const dynamic='force-dynamic';

export default async function AdvertisementDetails({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const [ad,locale]=await Promise.all([db.advertisement.findUnique({where:{id}}),getLocale()]);
  if(!ad||ad.status!=='ACTIVE'||!ad.imageUrl)notFound();
  const today=new Date();today.setHours(0,0,0,0);
  if(ad.startDate>new Date()||ad.endDate<today)notFound();
  const title=locale==='te'&&ad.titleTe?ad.titleTe:ad.title;
  const shortDescription=locale==='te'&&ad.descriptionTe?ad.descriptionTe:ad.description;
  const fullDescription=locale==='te'&&ad.longDescriptionTe?ad.longDescriptionTe:ad.longDescription;
  return <article className="shell advertisementDetails">
    <span className="eyebrow advertisementBadge"><Megaphone/> Sponsored</span>
    <h1>{title}</h1>
    {shortDescription&&<p className="advertisementLead">{shortDescription}</p>}
    <img className="advertisementHero" src={ad.imageUrl} alt={title}/>
    <div className="advertisementBody">{fullDescription||shortDescription||'Contact the advertiser for complete information.'}</div>
    {ad.linkUrl&&<a className="primary" href={`/ad/click/${ad.id}?to=website`} target="_blank" rel="noopener noreferrer">{locale==='te'?'ప్రకటనదారుని వెబ్‌సైట్‌ను సందర్శించండి':'Visit advertiser website'} <ArrowUpRight size={17}/></a>}
  </article>
}
