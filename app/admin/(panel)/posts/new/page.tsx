import { db } from '@/lib/db'; import { PostForm } from '@/components/post-form';
export default async function NewPost(){const categories=await db.category.findMany({orderBy:{order:'asc'}});return <><div className="adminHeader"><div><span className="kicker">Create</span><h1>New post</h1></div></div><PostForm categories={categories}/></>}
