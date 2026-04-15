import { useRef, useCallback, useEffect } from "react";

interface EditorPanelProps {
  onInput: () => void;
  onKeyDown?: () => void;
  storageKeyPrefix: string;
}

const EditorPanel = ({ onInput, onKeyDown, storageKeyPrefix }: EditorPanelProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const contentStorageKey = `${storageKeyPrefix}:editor-content`;
  const titleStorageKey = `${storageKeyPrefix}:editor-title`;

  const getSaveName = useCallback(() => {
    return titleRef.current?.value.trim() || `手记_${Date.now()}`;
  }, []);

  const handleExportMd = useCallback(() => {
    const content = editorRef.current?.innerText || "";
    if (!content.trim()) return;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${getSaveName()}.md`;
    link.click();
  }, [getSaveName]);

  const handleExportWord = useCallback(async () => {
    const content = editorRef.current?.innerText || "";
    if (!content.trim()) return;
    try {
      const docx = await import("docx");
      const { Document, Packer, Paragraph, TextRun } = docx;
      const children = content.split("\n").map(
        (line) =>
          new Paragraph({
            children: [new TextRun({ text: line, size: 24, font: "Microsoft YaHei" })],
            spacing: { before: 120, after: 120, line: 360 },
          })
      );
      const doc = new Document({ sections: [{ children }] });
      const blob = await Packer.toBlob(doc);
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${getSaveName()}.docx`;
      link.click();
    } catch {
      // docx not installed, fallback
      alert("Word 导出需要 docx 库，请安装后重试");
    }
  }, [getSaveName]);

  const handleFormat = useCallback((command: "bold" | "italic") => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command);
    onInput();
  }, [onInput]);

  const handleClear = useCallback(() => {
    if (!editorRef.current) return;
    editorRef.current.innerHTML = "";
    localStorage.setItem(contentStorageKey, "");
    onInput();
  }, [onInput, contentStorageKey]);

  const handleTitleInput = useCallback(() => {
    localStorage.setItem(titleStorageKey, titleRef.current?.value || "");
  }, [titleStorageKey]);

  useEffect(() => {
    const savedContent = localStorage.getItem(contentStorageKey);
    const savedTitle = localStorage.getItem(titleStorageKey);
    if (savedContent && editorRef.current) {
      editorRef.current.innerHTML = savedContent;
    }
    if (savedTitle && titleRef.current) {
      titleRef.current.value = savedTitle;
    }
  }, [contentStorageKey, titleStorageKey]);

  useEffect(() => {
    const interval = setInterval(() => {
      const content = editorRef.current?.innerHTML || "";
      const title = titleRef.current?.value || "";
      localStorage.setItem(contentStorageKey, content);
      localStorage.setItem(titleStorageKey, title);
    }, 30000);

    return () => clearInterval(interval);
  }, [contentStorageKey, titleStorageKey]);

  return (
    <div className="flex justify-center items-center h-screen relative z-[3]">
      <div
        className="w-[850px] h-[85vh] rounded-3xl p-[60px_80px] flex flex-col"
        style={{ background: "var(--vibe-paper-bg)" }}
      >
        <input
          ref={titleRef}
          type="text"
          placeholder="在此输入标题..."
          spellCheck={false}
          onInput={handleTitleInput}
          className="bg-transparent border-none outline-none text-[1.8rem] font-bold mb-5 pb-2.5"
          style={{
            color: "var(--vibe-paper-text)",
            borderBottomColor: "var(--vibe-divider)",
            borderBottomWidth: "1px",
            borderBottomStyle: "solid",
          }}
        />
        <div className="flex gap-2 mb-3">
          <button className="vibe-btn" onClick={() => handleFormat("bold")}>
            加粗
          </button>
          <button className="vibe-btn" onClick={() => handleFormat("italic")}>
            斜体
          </button>
          <button className="vibe-btn" onClick={handleClear}>
            清空内容
          </button>
        </div>
        <div
          ref={editorRef}
          contentEditable
          spellCheck={false}
          data-placeholder="请输入文本..."
          className="vibe-editor"
          onInput={onInput}
          onKeyDown={onKeyDown}
        />
        <div className="flex gap-2 mt-4 justify-end">
          <button className="vibe-btn" onClick={handleExportMd}>
            MD
          </button>
          <button className="vibe-btn" onClick={handleExportWord}>
            WORD
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditorPanel;
