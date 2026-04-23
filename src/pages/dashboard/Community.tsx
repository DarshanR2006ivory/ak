import { useState } from "react";
import { Users, Send } from "lucide-react";

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
    id: 1, author: "Ramesh Kumar", area: "Nashik, Maharashtra", topic: "Crop Alert",
    message: "Yellow spots appearing on my tomato leaves since last 3 days. Anyone else facing this? Could be early blight.",
    time: "2 hours ago",
    replies: [
      { author: "Suresh Patil", message: "Yes same issue here. Try copper oxychloride spray early morning.", time: "1h ago" },
      { author: "Anita Devi", message: "Contact the local Krishi Kendra, they gave us free fungicide last week.", time: "45m ago" },
    ],
  },
  {
    id: 2, author: "Priya Sharma", area: "Jaipur, Rajasthan", topic: "Help Needed",
    message: "My family needs help applying for PM-KISAN. We have 2 acres land but never received the benefit. Who can guide?",
    time: "5 hours ago",
    replies: [
      { author: "Mohan Lal", message: "Visit the nearest Common Service Centre (CSC) with your Aadhaar and land papers.", time: "4h ago" },
    ],
  },
  {
    id: 3, author: "Vijay Nair", area: "Thrissur, Kerala", topic: "Buy / Sell",
    message: "Selling 200 kg fresh coconuts at ₹18/piece. Can deliver within 20 km. Contact me directly.",
    time: "Yesterday",
    replies: [],
  },
  {
    id: 4, author: "Sunita Yadav", area: "Varanasi, UP", topic: "Water / Weather",
    message: "Heavy rain expected in next 48 hours as per IMD. Farmers in low-lying areas should harvest early if possible.",
    time: "Yesterday",
    replies: [
      { author: "Raju Gupta", message: "Thanks for the alert! Already moved my wheat to the storage shed.", time: "20h ago" },
      { author: "Meena Devi", message: "Shared this in our village WhatsApp group. Very helpful.", time: "18h ago" },
    ],
  },
  {
    id: 5, author: "Arjun Singh", area: "Amritsar, Punjab", topic: "Work",
    message: "Need 4 labourers for paddy transplanting starting Monday. ₹500/day + meals. Accommodation available.",
    time: "2 days ago",
    replies: [
      { author: "Balwinder", message: "I'm interested. Will bring 2 more people. Please share your number.", time: "2d ago" },
    ],
  },
  {
    id: 6, author: "Kavitha Reddy", area: "Guntur, Andhra Pradesh", topic: "Crop Alert",
    message: "Locust swarm spotted near Tenali yesterday. Farmers please keep watch and report to agriculture office immediately.",
    time: "3 days ago",
    replies: [
      { author: "Naresh Babu", message: "Already reported. District collector has been informed.", time: "3d ago" },
    ],
  },
];

const topicColors: Record<string, string> = {
  "Help Needed": "#faeeda",
  "Crop Alert": "#dcfce7",
  "Buy / Sell": "#dbeafe",
  "Transport": "#f3e8ff",
  "Work": "#fef9c3",
  "Water / Weather": "#e0f2fe",
};
const topicText: Record<string, string> = {
  "Help Needed": "#633806",
  "Crop Alert": "#166534",
  "Buy / Sell": "#1e40af",
  "Transport": "#6b21a8",
  "Work": "#713f12",
  "Water / Weather": "#0c4a6e",
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
      area: area.trim() || "Your Area",
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
    setPosts(posts.map(p =>
      p.id === postId
        ? { ...p, replies: [...p.replies, { author: author.trim() || "You", message: text, time: "Just now" }] }
        : p
    ));
    setReplyInputs({ ...replyInputs, [postId]: "" });
  };

  return (
    <>
      <style>{`
        .comm-layout { display: grid; grid-template-columns: 380px 1fr; gap: 24px; }
        .comm-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 22px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
        .comm-field { margin-bottom: 14px; }
        .comm-field label { display: block; font-size: 11px; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; color: #6b7280; margin-bottom: 6px; }
        .comm-field input, .comm-field select, .comm-field textarea {
          width: 100%; border: 1.5px solid #e5e7eb; border-radius: 10px; padding: 10px 13px;
          font-family: 'DM Sans', sans-serif; font-size: 14px; background: #fafafa; color: #111827; outline: none; box-sizing: border-box;
        }
        .comm-field textarea { min-height: 110px; resize: vertical; }
        .comm-field input:focus, .comm-field select:focus, .comm-field textarea:focus { border-color: #16a34a; background: #fff; }
        .comm-btn { width: 100%; height: 46px; border: none; border-radius: 12px; cursor: pointer; color: #fff;
          background: linear-gradient(135deg, #16a34a, #0d9488); font-family: 'Sora', sans-serif; font-weight: 700; font-size: 15px;
          transition: transform 0.2s, box-shadow 0.2s; }
        .comm-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 24px rgba(22,163,74,0.25); }
        .post-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 18px; padding: 18px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          animation: slideUp 0.4s ease both; }
        .post-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
        .post-author { display: flex; gap: 12px; align-items: center; }
        .post-avatar { width: 42px; height: 42px; border-radius: 50%; background: linear-gradient(135deg,#bbf7d0,#99f6e4);
          display: flex; align-items: center; justify-content: center; font-weight: 800; color: #166534; font-size: 14px; flex-shrink: 0; }
        .post-name { font-weight: 700; font-size: 14px; color: #111827; }
        .post-area { font-size: 12px; color: #6b7280; }
        .topic-pill { display: inline-flex; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
        .post-time { font-size: 11px; color: #9ca3af; margin-top: 4px; text-align: right; }
        .post-body { font-size: 14px; line-height: 1.7; color: #374151; margin-bottom: 14px; }
        .replies { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
        .reply-item { background: #f9fafb; border: 1px solid #f3f4f6; border-radius: 12px; padding: 10px 13px; font-size: 13px; line-height: 1.6; color: #374151; }
        .reply-author { font-weight: 700; color: #111827; margin-bottom: 2px; }
        .reply-row { display: flex; gap: 8px; }
        .reply-input { flex: 1; border: 1.5px solid #e5e7eb; border-radius: 10px; padding: 8px 12px; font-family: 'DM Sans', sans-serif; font-size: 13px; outline: none; background: #fafafa; }
        .reply-input:focus { border-color: #16a34a; }
        .reply-btn { border: none; border-radius: 10px; background: #16a34a; color: #fff; padding: 0 14px; cursor: pointer; display: flex; align-items: center; gap: 4px; font-size: 13px; font-weight: 600; }
        .reply-btn:hover { background: #14532d; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 900px) { .comm-layout { grid-template-columns: 1fr; } }
      `}</style>

      <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg,#16a34a,#0d9488)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Users size={20} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: 22, margin: 0, fontFamily: "'Sora', sans-serif" }}>Nearby Community</h1>
          <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>Connect with people in your area</p>
        </div>
      </div>

      <div className="comm-layout">
        {/* Post form */}
        <div className="comm-card" style={{ alignSelf: "start" }}>
          <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Post to Your Area</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="comm-field">
              <label>Your Name</label>
              <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Enter your name" />
            </div>
            <div className="comm-field">
              <label>Area</label>
              <input value={area} onChange={e => setArea(e.target.value)} placeholder="Village / District" />
            </div>
          </div>
          <div className="comm-field">
            <label>Topic</label>
            <select value={topic} onChange={e => setTopic(e.target.value)}>
              {TOPICS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="comm-field">
            <label>Message</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Share something useful for people nearby..." />
          </div>
          <button className="comm-btn" onClick={submitPost}>Share with Area</button>
        </div>

        {/* Feed */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {posts.map((post, idx) => (
            <div key={post.id} className="post-card" style={{ animationDelay: `${idx * 60}ms` }}>
              <div className="post-top">
                <div className="post-author">
                  <div className="post-avatar">{post.author.slice(0, 2).toUpperCase()}</div>
                  <div>
                    <div className="post-name">{post.author}</div>
                    <div className="post-area">{post.area}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span className="topic-pill" style={{ background: topicColors[post.topic] || "#f3f4f6", color: topicText[post.topic] || "#374151" }}>
                    {post.topic}
                  </span>
                  <div className="post-time">{post.time}</div>
                </div>
              </div>
              <div className="post-body">{post.message}</div>
              {post.replies.length > 0 && (
                <div className="replies">
                  {post.replies.map((r, i) => (
                    <div key={i} className="reply-item">
                      <div className="reply-author">{r.author}</div>
                      {r.message}
                    </div>
                  ))}
                </div>
              )}
              <div className="reply-row">
                <input
                  className="reply-input"
                  placeholder="Write a reply…"
                  value={replyInputs[post.id] || ""}
                  onChange={e => setReplyInputs({ ...replyInputs, [post.id]: e.target.value })}
                  onKeyDown={e => { if (e.key === "Enter") submitReply(post.id); }}
                />
                <button className="reply-btn" onClick={() => submitReply(post.id)}>
                  <Send size={13} /> Reply
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Community;
