import { NextRequest,NextResponse } from 'next/server';
export async function GET(request:NextRequest){const locale=request.nextUrl.searchParams.get('locale')==='te'?'te':'en';const response=NextResponse.json({locale});response.cookies.set('hp_locale',locale,{path:'/',sameSite:'lax',maxAge:60*60*24*365});return response}
