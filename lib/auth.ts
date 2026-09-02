import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
const key = () => new TextEncoder().encode(process.env.AUTH_SECRET || 'development-only-change-me');
export async function createSession(userId: string) {
  const token = await new SignJWT({ userId }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('7d').sign(key());
  (await cookies()).set('hp_session', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 7 });
}
export async function getSession() {
  const token = (await cookies()).get('hp_session')?.value;
  if (!token) return null;
  try { return (await jwtVerify(token, key())).payload as { userId: string }; } catch { return null; }
}
export async function requireAdmin() { const session = await getSession(); if (!session) redirect('/admin/login'); const {db}=await import('./db');const user=await db.user.findUnique({where:{id:session.userId}});if(!user||user.role!=='ADMIN'||!user.active)redirect('/admin/login');return {...session,user}; }
export async function requireAdvertiser(){const session=await getSession();if(!session)redirect('/advertiser/login');const {db}=await import('./db');const user=await db.user.findUnique({where:{id:session.userId}});if(!user||user.role!=='ADVERTISER'||!user.active)redirect('/advertiser/login');return {...session,user}}
export async function clearSession() { (await cookies()).delete('hp_session'); }
