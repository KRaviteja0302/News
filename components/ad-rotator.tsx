'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export type RotatingAd={id:string;title:string;imageUrl:string;href:string};

export function AdRotator({ads,className,imageClassName,showTitle=false}:{ads:RotatingAd[];className:string;imageClassName?:string;showTitle?:boolean}){
  const [index,setIndex]=useState(0);
  useEffect(()=>{
    if(ads.length<2)return;
    const timer=window.setInterval(()=>setIndex(current=>(current+1)%ads.length),5000);
    return()=>window.clearInterval(timer);
  },[ads.length]);
  const ad=ads[index]||ads[0];
  if(!ad)return null;
  return <Link href={ad.href} className={className} aria-label={`Advertisement: ${ad.title}`}>
    <span className="liveAdBadge">SPONSORED</span>
    <img className={imageClassName} src={ad.imageUrl} alt={ad.title}/>
    {showTitle&&<strong title={ad.title}>{ad.title}</strong>}
    {ads.length>1&&<small className="adSlideCount">{index+1} / {ads.length}</small>}
  </Link>;
}
