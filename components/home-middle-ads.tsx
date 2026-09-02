'use client';

import Link from 'next/link';
import type { Advertisement } from '@prisma/client';
import { useEffect, useState } from 'react';
import { advertisementHref } from '@/lib/ad-link';

function MiddleSlot({ads,locale}:{ads:Advertisement[];locale:'en'|'te'}){
  const [slide,setSlide]=useState(0);
  useEffect(()=>{
    if(ads.length<2)return;
    const timer=window.setInterval(()=>setSlide(current=>(current+1)%ads.length),5000);
    return()=>window.clearInterval(timer);
  },[ads.length]);
  const ad=ads[slide]||ads[0];
  if(!ad)return <Link href="/advertise" className="homeMiddleAdCard homeMiddleAdSlot"><span>ADVERTISEMENT</span><div><strong>Your advertisement here</strong><p>Reach readers between Top Stories and Latest News.</p></div></Link>;
  return <Link href={advertisementHref(ad)} className="homeMiddleAdCard"><img src={ad.imageUrl||''} alt={ad.title}/><span>ADVERTISEMENT</span><div><strong>{locale==='te'&&ad.titleTe?ad.titleTe:ad.title}</strong>{ad.description&&<p>{locale==='te'&&ad.descriptionTe?ad.descriptionTe:ad.description}</p>}</div>{ads.length>1&&<small className="adSlideCount">{slide+1} / {ads.length}</small>}</Link>;
}

export function HomeMiddleAds({ads,locale}:{ads:Advertisement[];locale:'en'|'te'}){
  const unassigned=ads.filter(ad=>!ad.homeSlot);
  const left=[...ads.filter(ad=>ad.homeSlot==='LEFT'),...unassigned.filter((_,index)=>index%2===0)];
  const right=[...ads.filter(ad=>ad.homeSlot==='RIGHT'),...unassigned.filter((_,index)=>index%2===1)];
  return <section className="homeMiddleAds" aria-label="Homepage advertisements"><MiddleSlot ads={left} locale={locale}/><MiddleSlot ads={right} locale={locale}/></section>;
}
