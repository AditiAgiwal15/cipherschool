import React, { useMemo, useState, useCallback } from "react";

// Types:
// Node = { id, name, type: 'file' | 'folder', children?: Node[] }

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export default function FileTree({
  tree,
  onCreateFile,
  onCreateFolder,
  onRenameNode,
  onSelectFile,
  onMoveNode,
  onDeleteNode,
  activeFileId,
}) {
  const [expanded, setExpanded] = useState(() => new Set());

  const toggle = useCallback((id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleDragStart = (e, node) => {
    e.dataTransfer.setData("application/x-node-id", node.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e, target) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData("application/x-node-id");
    if (!draggedId) return;
    onMoveNode(draggedId, target.id);
  };

  const allowDrop = (e) => {
    e.preventDefault();
  };

  const renderNode = (node, depth = 0) => {
    const isFolder = node.type === 'folder';
    const isExpanded = expanded.has(node.id);
    const isActive = activeFileId === node.id;
    return (
      <div key={node.id} style={{ marginLeft: depth * 12 }}>
        <div
          className="file-item"
          draggable
          onDragStart={(e) => handleDragStart(e, node)}
          onDrop={(e) => isFolder ? handleDrop(e, node) : undefined}
          onDragOver={isFolder ? allowDrop : undefined}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 8px',
            borderRadius: 4,
            background: isActive ? '#2a2a2a' : 'transparent',
            transition: 'background 150ms ease',
            cursor: 'pointer',
          }}
        >
          {isFolder ? (
            <span onClick={() => toggle(node.id)}>{isExpanded ? '📂' : '📁'}</span>
          ) : (
            <span>📄</span>
          )}
          <span
            onClick={() => {
              if (isFolder) toggle(node.id);
              else onSelectFile(node);
            }}
            style={{ flex: 1 }}
          >
            {node.name}
          </span>
          {isFolder && (
            <>
              <button
                title="New File"
                onClick={() => {
                  // Ensure parent is expanded so the new file is visible
                  setExpanded((prev) => new Set(prev).add(node.id));
                  onCreateFile(node.id);
                }}
                style={iconBtnStyle}
              >
                ➕📄
              </button>
              <button
                title="New Folder"
                onClick={() => {
                  // Ensure parent is expanded so the new folder is visible
                  setExpanded((prev) => new Set(prev).add(node.id));
                  onCreateFolder(node.id);
                }}
                style={iconBtnStyle}
              >
                ➕📁
              </button>
            </>
          )}
          <button
            title="Rename"
            onClick={() => onRenameNode && onRenameNode(node.id)}
            style={iconBtnStyle}
          >
            ✏️
          </button>
          <button
            title="Delete"
            onClick={() => onDeleteNode(node.id)}
            style={{ ...iconBtnStyle, color: '#e57373' }}
          >
            🗑️
          </button>
        </div>

        {/* Children */}
        {isFolder && isExpanded && node.children && node.children.length > 0 && (
          <div style={{
            marginTop: 4,
            transition: 'all 180ms ease',
          }}>
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Action tiles at top-level */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <div
          className="file-item"
          style={tileStyle('#4caf50')}
          onClick={() => onCreateFile(null)}
        >
          <span style={{ fontSize: 18 }}>📄</span>
          {/* removed label text */}
        </div>
        <div
          className="file-item"
          style={tileStyle('#64b5f6')}
          onClick={() => onCreateFolder(null)}
        >
          <span style={{ fontSize: 18 }}>📁</span>
          {/* removed label text */}
        </div>
      </div>

      {tree.map((n) => renderNode(n))}
    </div>
  );
}

const tileStyle = (color) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 4,
  padding: '10px 8px',
  cursor: 'pointer',
  borderRadius: 6,
  background: '#1b1b1b',
  color,
  fontWeight: 600,
  flex: 1,
});

const iconBtnStyle = {
  background: 'transparent',
  border: 'none',
  color: 'inherit',
  cursor: 'pointer',
  padding: '2px 4px',
  borderRadius: 4,
};



