import React from "react";
import { Sandpack } from "@codesandbox/sandpack-react";
import FileExplorer from "./FileExplorer";

export default function IDE() {
  return (
    <div style={{ display: "flex", height: "100vh", background: "#121212" }}>
      
      {/* Left - File Explorer */}
      <FileExplorer />

      {/* Right - Code Editor + Preview */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ background: "#222", color: "#fff", padding: "10px" }}>
          <h3>CipherStudio - React IDE</h3>
        </div>
        <Sandpack
          template="react"
          theme="dark"
          options={{
            showTabs: true,
            showLineNumbers: true,
            wrapContent: true,
            editorHeight: "100%",
            showConsoleButton: true,
          }}
        />
      </div>
    </div>
  );
}
