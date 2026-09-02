import { getRailAds } from '@/lib/ads';
import { AdRotator } from './ad-rotator';
import { advertisementHref } from '@/lib/ad-link';

function RailSlot({ads,label}:{ads:Awaited<ReturnType<typeof getRailAds>>;label:string}){
  return <div className="outerAdSlot" aria-label={label}>
    {!!ads.length&&<AdRotator ads={ads.map(ad=>({id:ad.id,title:ad.title,imageUrl:ad.imageUrl||'',href:advertisementHref(ad)}))} className="outerAd" showTitle/>}
    {!ads.length&&<a className="outerAd outerAdEmpty" href="/advertise">
      <span>ADVERTISEMENT · {label.toUpperCase()}</span>
      <div><strong><span>Your</span><span>advertisement</span><span>here</span></strong><small>300 × 600 px</small><b>BOOK THIS SPACE →</b></div>
    </a>}
  </div>
}

function Rail({side,topAds,bottomAds}:{side:'left'|'right';topAds:Awaited<ReturnType<typeof getRailAds>>;bottomAds:Awaited<ReturnType<typeof getRailAds>>}){
  return <aside className={`outerAdRail outerAdRail-${side}`} aria-label={`${side} side advertisements`}>
    <RailSlot ads={topAds} label={`${side} top`}/>
    <RailSlot ads={bottomAds} label={`${side} bottom`}/>
  </aside>
}

export async function OuterAdRails({children}:{children:React.ReactNode}){
  const [leftTop,leftBottom,rightTop,rightBottom]=await Promise.all([getRailAds('LEFT_RAIL'),getRailAds('LEFT_RAIL_BOTTOM'),getRailAds('RIGHT_RAIL'),getRailAds('RIGHT_RAIL_BOTTOM')]);
  return <div className="siteWithAdRails"><Rail side="left" topAds={leftTop} bottomAds={leftBottom}/><div className="siteCenter">{children}</div><Rail side="right" topAds={rightTop} bottomAds={rightBottom}/></div>
}
