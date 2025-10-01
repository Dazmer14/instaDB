export default function PostCard({ post }) {
  return (
    <div className="bg-gray-50 rounded-xl shadow-sm p-4 flex flex-col">
      <a href={post.post_url} target="_blank" rel="noopener noreferrer">
        <img
          src={`http://localhost:5000/api/image?url=${encodeURIComponent(post.image)}`}
          alt="Post"
          className="rounded-lg mb-3 object-cover"
        />
      </a>
      <p className="font-medium">{post.caption}</p>
      <div className="text-sm text-gray-600 mt-2">
        ❤️ {post.likes_count} | 💬 {post.comments_count}
      </div>
      <div className="mt-2 text-xs text-gray-500">
        Tags: {post.tags || []} <br />
        Vibe: {post.vibe || "N/A"} <br />
        Quality: {post.quality || "N/A"}
      </div>
    </div>
  );
}
