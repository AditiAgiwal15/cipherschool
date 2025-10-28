import React from "react";

export default function FileExplorer() {
  const files = [
    { name: "src/", type: "folder" },
    { name: "  App.js", type: "file" },
    { name: "  index.js", type: "file" },
    { name: "public/", type: "folder" },
    { name: "  index.html", type: "file" },
    { name: "package.json", type: "file" },
  ];

  return (
    <div style={{ background: "#1e1e1e", color: "#fff", padding: "10px", width: "200px" }}>
      <h4>Files</h4>
      {files.map((file, index) => (
        <div key={index}>{file.name}</div>
      ))}
    </div>
  );
}
