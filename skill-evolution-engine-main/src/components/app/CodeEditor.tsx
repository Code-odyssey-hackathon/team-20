import Editor from "@monaco-editor/react";

export function CodeEditor({ language, value, onChange }: {
  language: "python" | "cpp";
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/60">
      <Editor
        height="420px"
        language={language === "cpp" ? "cpp" : "python"}
        value={value}
        onChange={(v) => onChange(v ?? "")}
        theme="vs-dark"
        options={{
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 13,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          padding: { top: 14, bottom: 14 },
          smoothScrolling: true,
        }}
      />
    </div>
  );
}
