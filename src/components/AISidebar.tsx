import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

// ============================================================
// 🔌 AI 对接接口
// 替换下方函数即可接入你自己的 AI 服务
// 参数: messages — 完整对话历史 [{role, content}, ...]
// 返回: Promise<string> — AI 回复文本
// ============================================================
async function callAI(
  messages: { role: "user" | "assistant" | "system"; content: string }[]
): Promise<string> {
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY as string | undefined;
  if (!apiKey) {
    throw new Error("未检测到 VITE_DEEPSEEK_API_KEY，请检查 .env.local 配置并重启开发服务。");
  }

  const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages,
      temperature: 0.7,
      stream: false,
    }),
  });

  type DeepSeekResponse = {
    choices?: Array<{
      message?: {
        content?: string;
      };
    }>;
    error?: {
      message?: string;
    };
  };

  const data = (await response.json()) as DeepSeekResponse;

  if (!response.ok) {
    const errorMessage = data.error?.message || `请求失败（HTTP ${response.status}）`;
    throw new Error(errorMessage);
  }

  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("DeepSeek 返回内容为空，请稍后重试。");
  }

  return content;
}

// ============================================================

interface Message {
  role: "user" | "assistant";
  content: string;
}

const AISidebar = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const reply = await callAI([
        { role: "system", content: "你是一个专业的写作氛围助手，请根据用户的输入提供建议或续写。" },
        ...newMessages,
      ]);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "AI 调用失败，请检查网络或 API 配置。";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ ${errorMessage}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-[30px] z-20 h-10 px-4 rounded-full text-[12px] flex items-center gap-1.5"
        style={{
          right: open ? "390px" : "30px",
          transition: "right 0.5s cubic-bezier(0.19, 1, 0.22, 1)",
          background: "var(--vibe-ui-bg)",
          color: "var(--vibe-ui-text)",
          border: "1px solid var(--vibe-divider)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
        }}
      >
        <span aria-hidden="true">✨</span>
        <span>{open ? "收起助手" : "灵感助手"}</span>
      </button>

      {/* Sidebar */}
      <div
        className="fixed top-[80px] z-[100] h-[calc(100vh-110px)] w-[340px]"
        style={{
          right: open ? "30px" : "-380px",
          transition: "right 0.5s cubic-bezier(0.19, 1, 0.22, 1)",
        }}
      >
        {/* Blur background */}
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: "var(--vibe-ui-bg)",
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        />

        {/* Content */}
        <div className="relative h-full flex flex-col p-5">
          {/* Header */}
          <div className="flex justify-between items-center mb-5 pb-2.5" style={{ borderBottom: "1px solid var(--vibe-divider)" }}>
            <div className="vibe-title" style={{ margin: 0 }}>灵感助手</div>
            <button
              onClick={() => setOpen(false)}
              className="text-[18px] opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
              style={{ all: "unset", cursor: "pointer", fontSize: "18px", opacity: 0.5, transition: "0.3s" }}
            >
              ×
            </button>
          </div>

          {/* Chat messages */}
          <div ref={chatBoxRef} className="flex-1 overflow-y-auto space-y-3 pr-1">
            {messages.length === 0 && (
              <div className="text-[11px] opacity-30 text-center mt-10">
                捕捉此刻灵感，向 AI 助手提问...
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`text-[12px] leading-relaxed rounded-xl px-3 py-2 max-w-[90%] ${
                  msg.role === "user"
                    ? "ml-auto bg-[rgba(255,255,255,0.1)]"
                    : "mr-auto bg-[rgba(255,255,255,0.04)]"
                }`}
                style={{ color: "var(--vibe-ui-text)" }}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm prose-invert max-w-none [&>*]:m-0 [&>p]:mb-1.5">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            ))}
            {loading && (
              <div className="text-[12px] opacity-40 mr-auto animate-pulse">思考中...</div>
            )}
          </div>

          {/* Input area */}
          <div className="mt-4 pt-4 flex gap-2.5" style={{ borderTop: "1px solid var(--vibe-divider)" }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="捕捉此刻灵感..."
              rows={1}
              className="flex-1 bg-transparent border-none outline-none resize-none text-[12px]"
              style={{ color: "var(--vibe-paper-text)" }}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="text-[16px] opacity-60 hover:opacity-100 transition-opacity disabled:opacity-20"
              style={{ all: "unset", cursor: "pointer", fontSize: "16px", opacity: loading ? 0.2 : 0.6, transition: "0.3s" }}
            >
              🚀
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AISidebar;
