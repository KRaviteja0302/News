'use client';

import { useState } from 'react';

type Creative={id:string;number:number;title:string;placement:string;status:string;imageUrl:string|null;updatedAt:string};

export function AdminCreativeTabs({creatives}:{creatives:Creative[]}){
  const [selectedId,setSelectedId]=useState(creatives[0]?.id||'');
  const selected=creatives.find(item=>item.id===selectedId)||creatives[0];
  if(!selected)return null;
  return <section className="adminCreativeSection">
    <div className="adminCreativeTabs" role="tablist" aria-label="Advertisements in this booking">
      {creatives.map(creative=><button type="button" role="tab" aria-selected={creative.id===selected.id} className={creative.id===selected.id?'active':''} onClick={()=>setSelectedId(creative.id)} key={creative.id}>Advertisement {creative.number}</button>)}
    </div>
    <div className="adminCreativeView" role="tabpanel">
      <div><strong>{selected.title}</strong><span>{selected.placement.replaceAll('_',' ')} · {selected.status.replaceAll('_',' ')}</span><small>Last updated {new Date(selected.updatedAt).toLocaleString()}</small></div>
      {selected.imageUrl?<img src={selected.imageUrl} alt={selected.title}/>:<div className="creativeNoImage">Image not uploaded</div>}
    </div>
  </section>;
}
