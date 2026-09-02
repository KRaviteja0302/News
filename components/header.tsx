import Link from 'next/link';
import { Newspaper, Facebook, Instagram, Youtube, ChevronDown, Menu, Megaphone } from 'lucide-react';
import { getSettings,getLocale,categoryText,postText } from '@/lib/site';
import { db } from '@/lib/db';
import { LanguageSwitcher } from './language-switcher';
import { CategoryNavigation } from './category-navigation';
import { getHeaderAds } from '@/lib/ads';
import { AdRotator } from './ad-rotator';
import { advertisementHref } from '@/lib/ad-link';
export async function Header(){ const [s,categories,locale,headerAds]=await Promise.all([getSettings(),db.category.findMany({where:{showInMenu:true},orderBy:{order:'asc'},include:{posts:{where:{status:'PUBLISHED'},orderBy:{publishedAt:'desc'},take:5}}}),getLocale(),getHeaderAds()]); const rotatingHeaderAds=headerAds.map(ad=>({id:ad.id,title:ad.title,imageUrl:ad.imageUrl||'',href:advertisementHref(ad)})); return <>
  <div className="newsTop"><div className="shell newsTopInner"><span>{locale==='te'&&s.taglineTe?s.taglineTe:s.tagline}</span><div className="toplinks"><LanguageSwitcher locale={locale}/>{s.facebookUrl&&<a href={s.facebookUrl} aria-label="Facebook"><Facebook/></a>}{s.instagramUrl&&<a href={s.instagramUrl} aria-label="Instagram"><Instagram/></a>}{s.youtubeUrl&&<a href={s.youtubeUrl} aria-label="YouTube"><Youtube/></a>}<a href={`mailto:${s.contactEmail}`}>{s.contactEmail}</a></div></div></div>
  <header className="paperHeader"><div className="shell paperMasthead"><Link href="/" className="paperBrand">{s.logoUrl?<img src={s.logoUrl} alt={s.siteName}/>:<span className="paperBrandmark"><Newspaper/></span>}<span><strong>{s.siteName}</strong><small>{locale==='te'&&s.taglineTe?s.taglineTe:s.tagline}</small></span></Link>{rotatingHeaderAds.length?<AdRotator ads={rotatingHeaderAds} className="mastheadAd mastheadAdLive"/>:<Link href="/advertise" className="mastheadAd mastheadAdPlaceholder"><span>ADVERTISEMENT</span><strong>Place your brand in front of our readers</strong><b>BOOK A SPACE →</b></Link>}</div><div className="paperNav"><div className="shell paperNavInner"><button className="mobileMenu" aria-label="Open menu"><Menu/></button><nav><Link href="/">{locale==='te'?'హోమ్':'HOME'}</Link><CategoryNavigation categories={categories} locale={locale}/></nav><Link href="/advertise" className="navAdvertise"><Megaphone/> Advertise</Link></div></div></header>
  </> }
