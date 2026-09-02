import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function anonymousIp(request:NextRequest){
  const raw=(request.headers.get('x-forwarded-for')||request.headers.get('x-real-ip')||'').split(',')[0].trim();
  if(!raw)return null;
  if(raw.includes(':'))return raw.split(':').slice(0,4).join(':')+'::';
  const parts=raw.split('.');
  return parts.length===4?`${parts[0]}.${parts[1]}.${parts[2]}.0`:raw;
}

export async function GET(request:NextRequest,{params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const ad=await db.advertisement.findUnique({where:{id}});
  const fallback=new URL('/advertise',request.url);
  if(!ad||ad.status!=='ACTIVE'||!ad.imageUrl)return NextResponse.redirect(fallback);
  const now=new Date();const today=new Date(now);today.setHours(0,0,0,0);
  if(ad.startDate>now||ad.endDate<today)return NextResponse.redirect(fallback);
  const website=request.nextUrl.searchParams.get('to')==='website';
  await db.adClick.create({data:{advertisementId:ad.id,clickType:website?'WEBSITE':'BANNER',sourceUrl:request.headers.get('referer'),userAgent:request.headers.get('user-agent'),ipAddress:anonymousIp(request)}}).catch(()=>null);
  const hasDescription=Boolean(ad.description?.trim()||ad.descriptionTe?.trim()||ad.longDescription?.trim()||ad.longDescriptionTe?.trim());
  if((website||!hasDescription)&&ad.linkUrl){try{return NextResponse.redirect(new URL(ad.linkUrl));}catch{return NextResponse.redirect(fallback);}}
  return NextResponse.redirect(new URL(`/advertisement/${ad.id}`,request.url));
}
