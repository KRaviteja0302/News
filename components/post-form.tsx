import { Category, Post } from "@prisma/client";
import { savePost } from "@/app/actions";
export function PostForm({
  post,
  categories,
}: {
  post?: Post;
  categories: Category[];
}) {
  return (
    <form action={savePost} className="editor">
      <input type="hidden" name="id" value={post?.id || ""} />
      <div className="editorMain">
        <div className="adminCard stack">
          <h2>English content</h2>
          <label>
            Post title
            <input name="title" defaultValue={post?.title} required />
          </label>
          <label>
            URL slug
            <input
              name="slug"
              defaultValue={post?.slug}
              placeholder="generated-from-title"
            />
          </label>
          <label>
            Short excerpt
            <textarea
              name="excerpt"
              rows={3}
              defaultValue={post?.excerpt}
              required
            />
          </label>
          <label>
            Article content
            <textarea
              name="content"
              rows={12}
              defaultValue={post?.content}
              required
              placeholder="Write paragraphs separated by a blank line..."
            />
          </label>
        </div>
        <div className="adminCard stack translationCard">
          <h2>
            తెలుగు కంటెంట్ <small>Telugu content</small>
          </h2>
          <label>
            తెలుగు శీర్షిక
            <input name="titleTe" defaultValue={post?.titleTe || ""} />
          </label>
          <label>
            తెలుగు సంక్షిప్త వివరణ
            <textarea
              name="excerptTe"
              rows={3}
              defaultValue={post?.excerptTe || ""}
            />
          </label>
          <label>
            తెలుగు వ్యాసం
            <textarea
              name="contentTe"
              rows={12}
              defaultValue={post?.contentTe || ""}
              placeholder="తెలుగు కంటెంట్ ఇక్కడ రాయండి..."
            />
          </label>
        </div>
      </div>
      <aside className="editorSide">
        <div className="adminCard stack">
          <label>
            Status
            <select name="status" defaultValue={post?.status || "DRAFT"}>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </label>
          <label>
            Display as
            <select name="display" defaultValue={post?.display || "BOTH"}>
              <option value="BANNER">Banner carousel only</option>
              <option value="CARDS">Cards only</option>
              <option value="BOTH">Banner carousel and cards</option>
            </select>
          </label>
          <label>
            Category
            <select name="categoryId" defaultValue={post?.categoryId} required>
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.nameTe ? ` / ${c.nameTe}` : ""}
                </option>
              ))}
            </select>
          </label>
          <label>
            Publish date
            <input
              name="publishedAt"
              type="datetime-local"
              defaultValue={
                post?.publishedAt
                  ? new Date(
                      post.publishedAt.getTime() -
                        post.publishedAt.getTimezoneOffset() * 60000,
                    )
                      .toISOString()
                      .slice(0, 16)
                  : ""
              }
            />
          </label>
          <label className="check">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={post?.featured}
            />{" "}
            Feature on homepage
          </label>
        </div>
        <div className="adminCard stack">
          <h2>Article image</h2>
          <label>
            Upload JPG, PNG, WEBP or GIF
            <input
              name="imageFile"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
            />
          </label>
          <div className="orDivider">OR USE AN IMAGE URL</div>
          <label>
            Image URL
            <input
              name="imageUrl"
              type="url"
              defaultValue={post?.imageUrl || ""}
              placeholder="https://..."
            />
          </label>
          <label>
            Image description
            <input name="imageAlt" defaultValue={post?.imageAlt || ""} />
          </label>
          {post?.imageUrl && (
            <img className="thumb" src={post.imageUrl} alt="Preview" />
          )}
          <small>
            Uploaded file maximum: 5 MB. The saved image path is stored with the
            post in PostgreSQL.
          </small>
        </div>
        <button className="primary wide">
          Save and publish both languages
        </button>
      </aside>
    </form>
  );
}
