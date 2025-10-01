import { useEffect, useState } from "react";
import PostCard from "./components/PostCard";

// Centralized color scheme
const colors = {
  pageBg: "bg-blue-300",
  cardBg: "bg-white",
  textPrimary: "text-gray-800",
  textSecondary: "text-gray-600",
  heading: "text-xl font-semibold",
};

function App() {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [username, setUsername] = useState("instagram"); // default username
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔑 Fetch profile details for a given username
  const fetchProfile = (name) => {
    if (!name) return;
    setLoading(true);
    setError("");
    setProfile(null);
    setPosts([]);

    fetch(`http://localhost:5000/api/profile/${name}`)
      .then((res) => {
        if (!res.ok) throw new Error("Profile not found");
        return res.json();
      })
      .then((data) => {
        if (data.error) throw new Error(data.error);

        // Map posts to include `image` property for PostCard
        const postsWithImage = (data.posts || []).map((p) => ({
          ...p,
          image: p.thumbnail_src || p.thumbnail_src || ""
        }));

        setProfile(data.profile);
        setPosts(postsWithImage);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  // Load default profile on first render
  useEffect(() => {
    fetchProfile(username);
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className={`min-h-screen ${colors.pageBg} p-6`}>
      {/* 🔍 Search bar */}
      <div className="flex items-center gap-2 mb-6">
        <input
          type="text"
          placeholder="Enter Instagram username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchProfile(username)}
          className="p-2 rounded-md border border-gray-300 flex-grow"
        />
        <button
          onClick={() => fetchProfile(username)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Search
        </button>
      </div>

      {profile && (
        <>
          {/* Profile Section */}
          <div className={`${colors.cardBg} p-6 rounded-2xl shadow-md mb-6 flex items-center gap-4`}>
            <img
              src={profile.profile_pic_url}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover"
            />
            <div>
              <h1 className={`text-2xl font-bold ${colors.textPrimary}`}>{profile.full_name}</h1>
              <p className={colors.textSecondary}>@{profile.username}</p>
              <div className="flex gap-6 mt-2">
                <span>👥 {profile.followers_count} Followers</span>
                <span>➡️ {profile.following_count} Following</span>
                <span>📸 {profile.posts_count} Posts</span>
              </div>
            </div>
          </div>

          {/* Analytics Section */}
          <div className={`${colors.cardBg} p-6 rounded-2xl shadow-md mb-6`}>
            <h2 className={`${colors.heading} mb-4 ${colors.textPrimary}`}>Engagement Analytics</h2>
            <div className="flex gap-10">
              <div>❤️ Avg Likes: {profile.analytics?.avgLikes || "N/A"}</div>
              <div>💬 Avg Comments: {profile.analytics?.avgComments || "N/A"}</div>
              <div>📊 Engagement Rate: {profile.analytics?.engagementRate || "N/A"}</div>
            </div>
          </div>

          {/* Posts Section */}
          <div className={`${colors.cardBg} p-6 rounded-2xl shadow-md`}>
            <h2 className={`${colors.heading} mb-4 ${colors.textPrimary}`}>Recent Posts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <PostCard key={post.id} post={post} bgColor={colors.cardBg} />
                ))
              ) : (
                <p className="text-gray-700">No posts to display.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;

