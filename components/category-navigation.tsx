import Link from 'next/link';
import type { Category,Post } from '@prisma/client';
import { ChevronDown,Newspaper } from 'lucide-react';
import { categoryText,postText } from '@/lib/site';

type MenuCategory=Category&{posts:Post[]};

export function CategoryNavigation({categories,locale}:{categories:MenuCategory[];locale:'en'|'te'}){
  const roots=categories.filter(category=>!category.parentId);
  return <>{roots.map(category=>{
    const children=categories.filter(item=>item.parentId===category.id);
    const categoryName=categoryText(category,locale).name;
    return <div className="navItem" key={category.id}>
      <Link href={`/category/${category.slug}`}>{categoryName.toUpperCase()} <ChevronDown/></Link>
      <div className="megaMenu"><div className="shell megaGrid">
        {children.length?children.map(child=>{const story=child.posts[0];return <Link href={`/category/${child.slug}`} className="megaStory" key={child.id}>{story?.imageUrl?<img src={story.imageUrl} alt={story.imageAlt||categoryText(child,locale).name}/>:<span className="megaPlaceholder"><Newspaper/></span>}<strong>{categoryText(child,locale).name}</strong></Link>}):category.posts.length?category.posts.map(post=>{const text=postText(post,locale);return <Link href={`/news/${post.slug}`} className="megaStory" key={post.id}>{post.imageUrl?<img src={post.imageUrl} alt={post.imageAlt||text.title}/>:<span className="megaPlaceholder"><Newspaper/></span>}<strong>{text.title}</strong></Link>}):<div className="megaEmpty">No published stories in {categoryName} yet.</div>}
      </div></div>
    </div>
  })}</>
}
