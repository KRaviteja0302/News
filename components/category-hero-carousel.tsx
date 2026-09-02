'use client';

import Link from 'next/link';
import { ArrowLeft,ArrowRight,Clock3 } from 'lucide-react';
import { useEffect,useState } from 'react';

export type CategoryHeroStory={id:string;slug:string;title:string;excerpt:string;imageUrl:string;imageAlt:string;date:string;category:string};

export function CategoryHeroCarousel({stories,readLabel,topLabel}:{stories:CategoryHeroStory[];readLabel:string;topLabel:string}){
  const [active,setActive]=useState(0);
  useEffect(()=>{if(stories.length<2)return;const timer=window.setInterval(()=>setActive(value=>(value+1)%stories.length),6000);return()=>window.clearInterval(timer)},[stories.length]);
  if(!stories.length)return null;
  const story=stories[active];
  const move=(step:number)=>setActive(value=>(value+step+stories.length)%stories.length);
  return <section className="categoryHeroCarousel" aria-roledescription="carousel" aria-label={`${story.category} ${topLabel}`}>
    <div className="categoryHeroSlide" key={story.id}>
      <Link href={`/news/${story.slug}`} className="categoryHeroImage"><img src={story.imageUrl} alt={story.imageAlt}/></Link>
      <div className="categoryHeroCopy"><span className="categoryHeroBadge">{story.category}</span><h2><Link href={`/news/${story.slug}`}>{story.title}</Link></h2><p>{story.excerpt}</p><div className="categoryHeroMeta"><small><Clock3/> {story.date}</small><Link className="paperRead" href={`/news/${story.slug}`}>{readLabel} <ArrowRight/></Link></div></div>
    </div>
    {stories.length>1&&<div className="categoryHeroControls"><button type="button" onClick={()=>move(-1)} aria-label="Previous story"><ArrowLeft/></button><div>{stories.map((item,index)=><button type="button" className={index===active?'active':''} onClick={()=>setActive(index)} aria-label={`Show story ${index+1}`} aria-current={index===active} key={item.id}/>)}</div><button type="button" onClick={()=>move(1)} aria-label="Next story"><ArrowRight/></button></div>}
  </section>
}
