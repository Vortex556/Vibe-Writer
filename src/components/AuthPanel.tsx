import { useState } from "react";
import SymbolRain from "@/components/SymbolRain";

interface AuthPanelProps {
  onLoginSuccess: (username: string) => void;
}

interface StoredUser {
  username: string;
  password: string;
}

const USERS_KEY = "vibe-auth-users";
const SESSION_KEY = "vibe-auth-session";

const AuthPanel = ({ onLoginSuccess }: AuthPanelProps) => {
  const [showIntro, setShowIntro] = useState(true);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const getUsers = (): StoredUser[] => {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as StoredUser[];
    } catch {
      return [];
    }
  };

  const saveUsers = (users: StoredUser[]) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  };

  const completeLogin = (name: string) => {
    localStorage.setItem(SESSION_KEY, name);
    onLoginSuccess(name);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedName = username.trim();
    if (!normalizedName || !password) {
      setError("请输入用户名和密码。");
      return;
    }

    const users = getUsers();
    const matchedUser = users.find((item) => item.username === normalizedName);

    if (mode === "register") {
      if (matchedUser) {
        setError("该用户名已存在，请直接登录。");
        return;
      }
      users.push({ username: normalizedName, password });
      saveUsers(users);
      completeLogin(normalizedName);
      return;
    }

    if (!matchedUser || matchedUser.password !== password) {
      setError("用户名或密码错误。");
      return;
    }
    completeLogin(normalizedName);
  };

  const handleEnter = () => setShowIntro(false);

  return (
    <div className="h-screen w-full relative overflow-hidden flex items-center justify-center px-4">
      <SymbolRain density={1} />
      <div className="auth-floating-glow auth-glow-a" />
      <div className="auth-floating-glow auth-glow-b" />
      <div className="auth-floating-glow auth-glow-c" />

      {showIntro ? (
        <button className="auth-intro-stage" onClick={handleEnter}>
          <div className="vibe-title !mb-4">Vibe Writer</div>
          <h1 className="auth-intro-title">在灵感流动处写作</h1>
          <p className="auth-intro-subtitle">点击进入，继续你的写作旅程</p>
        </button>
      ) : (
        <div className="vibe-ui w-full max-w-[430px] p-7 auth-card-enter">
          <div className="vibe-title">Vibe Writer Login</div>
          <h1 className="text-xl mb-2" style={{ color: "var(--vibe-paper-text)" }}>
            {mode === "login" ? "欢迎回来" : "创建账号"}
          </h1>
          <p className="text-xs opacity-60 mb-5">
            登录后会自动保存你的写作内容和场景设置，刷新或重开网页不会丢失。
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl bg-[rgba(255,255,255,0.05)] border border-[var(--vibe-divider)] px-4 py-2.5 text-sm outline-none transition-all duration-300 focus:border-[rgba(255,255,255,0.28)]"
              style={{ color: "var(--vibe-paper-text)" }}
            />
            <input
              type="password"
              placeholder="密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl bg-[rgba(255,255,255,0.05)] border border-[var(--vibe-divider)] px-4 py-2.5 text-sm outline-none transition-all duration-300 focus:border-[rgba(255,255,255,0.28)]"
              style={{ color: "var(--vibe-paper-text)" }}
            />
            {error && <div className="text-xs text-red-300 animate-pulse">{error}</div>}
            <button type="submit" className="auth-submit-btn">
              {mode === "login" ? "登录" : "注册并登录"}
            </button>
          </form>

          <button
            className="mt-4 text-xs opacity-70 hover:opacity-100 transition-opacity"
            onClick={() => {
              setError("");
              setMode(mode === "login" ? "register" : "login");
            }}
          >
            {mode === "login" ? "没有账号？去注册" : "已有账号？去登录"}
          </button>
        </div>
      )}
    </div>
  );
};

export { SESSION_KEY };
export default AuthPanel;
