import { useState } from "react";
import { Send, Users } from "lucide-react";

type Reply = { author: string; message: string; time: string };
type Post = {
  id: number;
  author: string;
  area: string;
  topic: string;
  message: string;
  time: string;
  replies: Reply[];
};

const TOPICS = ["Help Needed", "Crop Alert", "Buy / Sell", "Transport", "Work", "Water / Weather"];

const SEED_POSTS: Post[] = [
  {
    id: 1,
    author: "Ramesh Kumar",
    area: "Nashik, Maharashtra",
    topic: "Crop Alert",
    message: "Yellow spots appearing on my tomato leaves since last 3 days. Anyone else facing this? Could be early blight.",
    time: "2 hours ago",
    replies: [
      { author: "Suresh Patil", message: "Yes, same issue here. Try copper oxychloride spray early morning.", time: "1h ago" },
      { author: "Anita Devi", message: "Contact the local Krishi Kendra, they gave us free fungicide last week.", time: "45m ago" },
    ],
  },
  {
    id: 2,
    author: "Priya Sharma",
    area: "Jaipur, Rajasthan",
    topic: "Help Needed",
    message: "My family needs help applying for PM-KISAN. We have 2 acres land but never received the benefit. Who can guide?",
    time: "5 hours ago",
    replies: [{ author: "Mohan Lal", message: "Visit the nearest CSC with your Aadhaar and land papers.", time: "4h ago" }],
  },
  {
    id: 3,
    author: "Vijay Nair",
    area: "Thrissur, Kerala",
    topic: "Buy / Sell",
    message: "Selling 200 kg fresh coconuts at Rs 18/piece. Can deliver within 20 km. Contact me directly.",
    time: "Yesterday",
    replies: [],
  },
];

const topicStyles: Record<string, string> = {
  "Help Needed": "bg-amber-100 text-amber-900",
  "Crop Alert": "bg-emerald-100 text-emerald-900",
  "Buy / Sell": "bg-blue-100 text-blue-900",
  Transport: "bg-violet-100 text-violet-900",
  Work: "bg-yellow-100 text-yellow-900",
  "Water / Weather": "bg-cyan-100 text-cyan-900",
};

const Community = () => {
  const [posts, setPosts] = useState<Post[]>(SEED_POSTS);
  const [author, setAuthor] = useState("");
  const [area, setArea] = useState("");
  const [topic, setTopic] = useState(TOPICS[0]);
  const [message, setMessage] = useState("");
  const [replyInputs, setReplyInputs] = useState<Record<number, string>>({});

  const submitPost = () => {
    if (!message.trim()) return;
    const newPost: Post = {
      id: Date.now(),
      author: author.trim() || "Anonymous",
      area: area.trim() || "Your area",
      topic,
      message: message.trim(),
      time: "Just now",
      replies: [],
    };
    setPosts([newPost, ...posts]);
    setMessage("");
  };

  const submitReply = (postId: number) => {
    const text = replyInputs[postId]?.trim();
    if (!text) return;
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? { ...post, replies: [...post.replies, { author: author.trim() || "You", message: text, time: "Just now" }] }
          : post,
      ),
    );
    setReplyInputs({ ...replyInputs, [postId]: "" });
  };

  return (
    <div className="space-y-6">
      <div className="page-header flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-glow">
          <Users className="h-6 w-6" />
        </div>
        <div>
          <span className="page-kicker">Local community</span>
          <h1 className="font-display text-4xl font-extrabold text-foreground">Nearby Community</h1>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">A more polished local feed with warmer typography, softer cards and better message flow.</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <div className="ambient-panel-strong h-fit p-6">
          <h2 className="font-display text-2xl font-bold text-foreground">Post to your area</h2>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">Share crop alerts, work requests, market info or local help needs in one clean panel.</p>

          <div className="mt-6 grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <label className="text-sm">
                <span className="mb-2 block font-accent text-xs uppercase tracking-[0.2em] text-primary">Your name</span>
                <input className="ambient-input h-12 w-full rounded-2xl border px-4 outline-none focus:border-primary" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Enter your name" />
              </label>
              <label className="text-sm">
                <span className="mb-2 block font-accent text-xs uppercase tracking-[0.2em] text-primary">Area</span>
                <input className="ambient-input h-12 w-full rounded-2xl border px-4 outline-none focus:border-primary" value={area} onChange={(e) => setArea(e.target.value)} placeholder="Village or district" />
              </label>
            </div>

            <label className="text-sm">
              <span className="mb-2 block font-accent text-xs uppercase tracking-[0.2em] text-primary">Topic</span>
              <select className="ambient-input h-12 w-full rounded-2xl border px-4 outline-none focus:border-primary" value={topic} onChange={(e) => setTopic(e.target.value)}>
                {TOPICS.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>

            <label className="text-sm">
              <span className="mb-2 block font-accent text-xs uppercase tracking-[0.2em] text-primary">Message</span>
              <textarea
                className="ambient-input min-h-[140px] w-full rounded-[1.5rem] border px-4 py-3 outline-none focus:border-primary"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share something useful for people nearby..."
              />
            </label>

            <button className="rounded-2xl bg-gradient-warm px-5 py-3 font-accent font-bold text-white shadow-glow transition hover:scale-[1.01]" onClick={submitPost}>
              Share with area
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {posts.map((post, index) => (
            <div key={post.id} className="ambient-panel p-5" style={{ animationDelay: `${index * 70}ms` }}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 font-accent text-sm font-bold text-emerald-800">
                    {post.author.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-accent font-semibold text-foreground">{post.author}</div>
                    <div className="text-sm text-muted-foreground">{post.area}</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-accent font-bold uppercase tracking-[0.14em] ${topicStyles[post.topic] || "bg-slate-100 text-slate-800"}`}>
                    {post.topic}
                  </span>
                  <div className="mt-2 text-xs text-muted-foreground">{post.time}</div>
                </div>
              </div>

              <div className="mt-4 text-sm leading-7 text-foreground/85">{post.message}</div>

              {post.replies.length > 0 && (
                <div className="mt-4 space-y-3">
                  {post.replies.map((reply, replyIndex) => (
                    <div key={replyIndex} className="rounded-[1.25rem] border border-white/55 bg-white/70 px-4 py-3 text-sm text-foreground/80">
                      <div className="font-accent text-xs font-bold uppercase tracking-[0.18em] text-primary">{reply.author}</div>
                      <div className="mt-2 leading-7">{reply.message}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 flex gap-3">
                <input
                  className="ambient-input h-12 flex-1 rounded-2xl border px-4 outline-none focus:border-primary"
                  placeholder="Write a reply..."
                  value={replyInputs[post.id] || ""}
                  onChange={(e) => setReplyInputs({ ...replyInputs, [post.id]: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submitReply(post.id);
                  }}
                />
                <button
                  className="flex h-12 items-center gap-2 rounded-2xl bg-primary px-4 font-accent font-semibold text-primary-foreground transition hover:bg-primary/90"
                  onClick={() => submitReply(post.id)}
                >
                  <Send className="h-4 w-4" /> Reply
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Community;
