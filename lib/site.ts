import { db } from './db';
import { cookies } from 'next/headers';
import type { Category, Post } from '@prisma/client';
export async function getSettings() {
  return db.siteSetting.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });
}
export function formatDate(date: Date | null) {
  return date ? new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(date) : '';
}
export async function getLocale():Promise<'en'|'te'> { return (await cookies()).get('hp_locale')?.value === 'te' ? 'te' : 'en'; }
export function postText(post:Post,locale:'en'|'te'){return {title:locale==='te'&&post.titleTe?post.titleTe:post.title,excerpt:locale==='te'&&post.excerptTe?post.excerptTe:post.excerpt,content:locale==='te'&&post.contentTe?post.contentTe:post.content}}
export function categoryText(category:Category,locale:'en'|'te'){return {name:locale==='te'&&category.nameTe?category.nameTe:category.name,description:locale==='te'&&category.descriptionTe?category.descriptionTe:category.description}}
