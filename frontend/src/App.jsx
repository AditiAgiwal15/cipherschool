import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";
import FileTree from "./components/FileTree";

export default function App() {
  const navigate = useNavigate();
  // State for theme mode (dark/light)
  const [darkMode, setDarkMode] = useState(true);
  
  // Hierarchical tree state
  // Node: { id, name, type: 'file' | 'folder', children?: Node[] }
  const [tree, setTree] = useState([
    { id: "file-appjs", name: "App.js", type: "file" },
  ]);
  // File contents keyed by node id
  const [fileContents, setFileContents] = useState({
    "file-appjs": `export default function App() {\n  return <h1>Hello world</h1>\n}`,
  });
  const [activeFile, setActiveFile] = useState("file-appjs");

  // State for code editor (mirrors active file content)
  const [code, setCode] = useState(`export default function App() {\n  return <h1>Hello world</h1>\n}`);
  
  // State for preview content
  const [previewContent, setPreviewContent] = useState('Hello world');
  
  // State for save modal
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [customFilename, setCustomFilename] = useState('');
  const [fileExtension, setFileExtension] = useState('.js');
  
  // Ref for file input element
  const fileInputRef = React.useRef(null);

  /* ============================================
     THEME MANAGEMENT SYSTEM
     ============================================
     Priority: localStorage > system preference
  */
  useEffect(() => {
    const savedTheme = localStorage.getItem('cipherStudioTheme');
    
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    } else {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(systemPrefersDark);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cipherStudioTheme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  /* ============================================
     THEME TOGGLE FUNCTION
     ============================================
  */
  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  /* ============================================
     CODE EDITOR HANDLER
     ============================================
     Handles code changes and updates the preview
  */
  const handleCodeChange = (newCode) => {
    setCode(newCode);
    // Keep active file content in sync
    setFileContents((prev) => ({ ...prev, [activeFile]: newCode }));
    updatePreview(newCode);
  };

  /* ============================================
     UPDATE PREVIEW
     ============================================
     Extracts JSX from code and renders it
  */
  const updatePreview_url = (newCode) => {
    try {
      // Extract the return statement content
      const lines = newCode.split('\n');
      let returnFound = false;
      let returnContent = '';
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('return')) {
          returnFound = true;
          returnContent += line.substring(line.indexOf('return') + 6).trim();
          // Get remaining lines
          for (let j = i + 1; j < lines.length; j++) {
            returnContent += ' ' + lines[j].trim();
          }
          break;
        }
      }
      
      if (returnFound && returnContent) {
        returnContent = returnContent.trim();
        // Remove parentheses if present
        if (returnContent.startsWith('(') && returnContent.endsWith(')')) {
          returnContent = returnContent.slice(1, -1).trim();
        }
        // Remove semicolon if present
        if (returnContent.endsWith(';')) {
          returnContent = returnContent.slice(0, -1).trim();
        }
        
        setPreviewContent(returnContent);
      } else {
        setPreviewContent('Write code in the editor to see preview');
      }
    } catch (err) {
      console.error('Preview update error:', err);
      setPreviewContent('Error: Could not render preview');
    }
  };

  const updatePreview = (newCode) => {
    try {
      // Extract return statement content
      const returnMatch = newCode.match(/return\s*([\s\S]*?)(?:;|$)/);
      
      if (returnMatch) {
        let content = returnMatch[1].trim();
        
        // Remove parentheses if present
        if (content.startsWith('(') && content.endsWith(')')) {
          content = content.slice(1, -1).trim();
        }
        
        // Clean up JSX - extract only the actual elements
        const jsxMatch = content.match(/<[^>]+>[\s\S]*?<\/[^>]+>/);
        
        if (jsxMatch) {
          const jsxContent = jsxMatch[0];
          // Extract the text content within JSX
          const textMatch = jsxContent.match(/>(.*?)</);
          if (textMatch) {
            const textContent = textMatch[1].trim();
            // Create a clean HTML string
            setPreviewContent(textContent || jsxContent);
          } else {
            setPreviewContent(jsxContent);
          }
        } else {
          // If no JSX match, try to extract any string or simple content
          const stringMatch = content.match(/(['"])(.*?)\1/);
          if (stringMatch) {
            setPreviewContent(stringMatch[2]);
          } else {
            setPreviewContent(content || 'Write code to see preview');
          }
        }
      } else {
        setPreviewContent('Write your React code in the editor...');
      }
    } catch (err) {
      console.error('Preview update error:', err);
      setPreviewContent('Error: Could not render preview');
    }
  };
  
  // Initialize preview on mount
  useEffect(() => {
    updatePreview(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep editor code in sync when switching active file
  useEffect(() => {
    if (activeFile && fileContents[activeFile] !== undefined) {
      setCode(fileContents[activeFile]);
      updatePreview(fileContents[activeFile]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFile]);

  // Create a new untitled text file and make it active
  // Utilities for tree manipulation
  const findNodeAndParent = (nodes, id, parent = null) => {
    for (const n of nodes) {
      if (n.id === id) return { node: n, parent };
      if (n.type === 'folder' && n.children) {
        const res = findNodeAndParent(n.children, id, n);
        if (res) return res;
      }
    }
    return null;
  };

  const generateUniqueName = (siblings, baseName, isFile) => {
    let counter = 1;
    let name = isFile ? `untitled-${counter}.txt` : `New Folder ${counter}`;
    const siblingNames = new Set(siblings.map((s) => s.name));
    while (siblingNames.has(name)) {
      counter += 1;
      name = isFile ? `untitled-${counter}.txt` : `New Folder ${counter}`;
    }
    return name;
  };

  const addChild = (nodes, parentId, child) => {
    if (parentId == null) return [...nodes, child];
    return nodes.map((n) => {
      if (n.id === parentId && n.type === 'folder') {
        const children = n.children ? [...n.children, child] : [child];
        return { ...n, children };
      }
      if (n.type === 'folder' && n.children) {
        return { ...n, children: addChild(n.children, parentId, child) };
      }
      return n;
    });
  };

  const removeNode = (nodes, id, removed = { node: null }) => {
    const next = [];
    for (const n of nodes) {
      if (n.id === id) {
        removed.node = n;
        continue;
      }
      if (n.type === 'folder' && n.children) {
        const result = removeNode(n.children, id, removed);
        next.push({ ...n, children: result.nodes });
      } else {
        next.push(n);
      }
    }
    return { nodes: next, removed: removed.node };
  };

  const isDescendant = (nodes, possibleAncestorId, id) => {
    const res = findNodeAndParent(nodes, id);
    if (!res) return false;
    let p = res.parent;
    while (p) {
      if (p.id === possibleAncestorId) return true;
      const parentRes = findNodeAndParent(nodes, p.id);
      p = parentRes ? parentRes.parent : null;
    }
    return false;
  };

  // Handlers required by FileTree
  const handleCreateNewFile = (parentId) => {
    const siblings = parentId == null
      ? tree
      : (findNodeAndParent(tree, parentId)?.node.children || []);
    const name = generateUniqueName(siblings, 'untitled', true);
    const id = `file-${Math.random().toString(36).slice(2, 9)}`;
    const newFile = { id, name, type: 'file' };
    const updated = addChild(tree, parentId, newFile);
    setTree(updated);
    const initialContent = "";
    setFileContents((prev) => ({ ...prev, [id]: initialContent }));
    setActiveFile(id);
    setCode(initialContent);
    updatePreview(initialContent);
  };

  const handleCreateNewFolder = (parentId) => {
    const siblings = parentId == null
      ? tree
      : (findNodeAndParent(tree, parentId)?.node.children || []);
    const name = generateUniqueName(siblings, 'New Folder', false);
    const id = `folder-${Math.random().toString(36).slice(2, 9)}`;
    const newFolder = { id, name, type: 'folder', children: [] };
    const updated = addChild(tree, parentId, newFolder);
    setTree(updated);
  };

  const handleMoveNode = (draggedId, targetFolderId) => {
    const target = findNodeAndParent(tree, targetFolderId)?.node;
    if (!target || target.type !== 'folder') return;
    if (draggedId === targetFolderId) return;
    if (isDescendant(tree, draggedId, targetFolderId)) return; // prevent moving parent into child
    const { nodes: withoutDragged, removed } = removeNode(tree, draggedId);
    if (!removed) return;
    const updated = addChild(withoutDragged, targetFolderId, removed);
    setTree(updated);
  };

  const handleDeleteNode = (id) => {
    const res = findNodeAndParent(tree, id);
    if (!res) return;
    const name = res.node.name;
    const confirmMsg = res.node.type === 'folder'
      ? `Delete folder "${name}" and all its contents?`
      : `Delete file "${name}"?`;
    if (!window.confirm(confirmMsg)) return;

    const collectFiles = (node, acc) => {
      if (node.type === 'file') acc.push(node.id);
      if (node.type === 'folder' && node.children) {
        node.children.forEach((c) => collectFiles(c, acc));
      }
    };
    const fileIdsToRemove = [];
    collectFiles(res.node, fileIdsToRemove);

    const { nodes: updated } = removeNode(tree, id);
    setTree(updated);
    if (fileIdsToRemove.length > 0) {
      setFileContents((prev) => {
        const next = { ...prev };
        fileIdsToRemove.forEach((fid) => delete next[fid]);
        return next;
      });
    }
    if (fileIdsToRemove.includes(activeFile)) {
      // Switch to any remaining file
      const firstFileId = (() => {
        const stack = [...updated];
        while (stack.length) {
          const n = stack.shift();
          if (n.type === 'file') return n.id;
          if (n.type === 'folder' && n.children) stack.unshift(...n.children);
        }
        return null;
      })();
      if (firstFileId) {
        setActiveFile(firstFileId);
        const content = fileContents[firstFileId] || "";
        setCode(content);
        updatePreview(content);
      } else {
        setActiveFile(null);
        setCode("");
        updatePreview("");
      }
    }
  };

  /* ============================================
     SAVE PROJECT FUNCTIONALITY
     ============================================
     This function opens a modal dialog to get a custom
     filename from the user before saving the code.
     
     How it works:
     1. Opens a modal dialog asking for filename
     2. User enters custom filename or uses default
     3. User selects file extension (.js, .html, .txt)
     4. Calls handleDownloadFile() to perform the actual save
     
     Features:
     - Custom filename input
     - File extension selection
     - Default name fallback
     - Clean modal UI that works in both themes
  */
  const handleSaveProject = () => {
    // Show the save modal dialog
    setShowSaveModal(true);
    // Reset filename input
    setCustomFilename('');
    // Default to .js extension
    setFileExtension('.js');
  };

  /* ============================================
     DOWNLOAD FILE FUNCTIONALITY
     ============================================
     This function performs the actual file download
     after the user has provided a filename.
     
     How it works:
     1. Validates and sanitizes the filename
     2. Uses default name if no input provided
     3. Creates a Blob object with the code content
     4. Generates a temporary URL for the blob
     5. Creates a hidden anchor element and triggers download
     6. Browser handles saving to user's default folder
     7. Cleans up temporary URL and element
     
     Features:
     - Filename validation and sanitization
     - Default fallback: "untitled_project.txt"
     - Works in both light and dark modes
     - No external dependencies required
     - Cross-browser compatible
  */
  const handleDownloadFile = () => {
    try {
      // Sanitize filename: remove invalid characters and trim whitespace
      const sanitizedFilename = customFilename
        .replace(/[<>:"/\\|?*]/g, '') // Remove invalid file characters
        .trim(); // Remove leading/trailing spaces
      
      // Use default filename if none provided or if it becomes empty after sanitization
      const finalFilename = sanitizedFilename || 'untitled_project';
      
      // Ensure file extension is attached
      const filenameWithExtension = finalFilename.endsWith(fileExtension) 
        ? finalFilename 
        : `${finalFilename}${fileExtension}`;
      
      // Determine MIME type based on file extension
      let mimeType = 'text/plain';
      if (fileExtension === '.js') {
        mimeType = 'text/javascript';
      } else if (fileExtension === '.html') {
        mimeType = 'text/html';
      } else if (fileExtension === '.css') {
        mimeType = 'text/css';
      }
      
      // Create a Blob object with the code content
      // Blob is a browser API that represents data that can be read as text or binary
      const blob = new Blob([code], { type: mimeType });
      
      // Create a temporary URL for the blob
      // This URL points to the in-memory blob data
      const url = URL.createObjectURL(blob);
      
      // Create a temporary anchor element to trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.download = filenameWithExtension; // Set the download filename
      link.style.display = 'none'; // Hide the element (not needed to be visible)
      
      // Add the link to the document body
      document.body.appendChild(link);
      
      // Programmatically click the link to trigger the download
      // This prompts the browser's save dialog
      link.click();
      
      // Clean up: Remove the link from the document
      document.body.removeChild(link);
      
      // Release the blob URL to free up memory
      // This is important for memory management
      URL.revokeObjectURL(url);
      
      // Close the modal after successful download
      setShowSaveModal(false);
      
      // Optional: Log success message (visible in browser console)
      console.log(`Project saved successfully as ${filenameWithExtension}`);
      
    } catch (error) {
      // Handle any errors gracefully
      console.error('Error saving project:', error);
      alert('Failed to save project. Please try again.');
    }
  };

  /* ============================================
     CLOSE SAVE MODAL
     ============================================
     Closes the save modal and resets the form
  */
  const handleCloseSaveModal = () => {
    setShowSaveModal(false);
    setCustomFilename('');
    setFileExtension('.js');
  };

  /* ============================================
     LOAD PROJECT FUNCTIONALITY
     ============================================
     This function allows users to load a code file
     from their computer into the editor.
     
     How it works:
     1. Triggers a hidden file input click
     2. User selects a file from their computer
     3. Reads the file content using FileReader API
     4. Updates the code state with file contents
     5. Preview automatically updates with the new code
     
     Features:
     - Supports text-based files (.js, .html, .txt, .css, etc.)
     - Shows file name in console for debugging
     - Error handling for file reading failures
     - Works in both light and dark modes
     - No external dependencies required
  */
  const handleLoadProject = () => {
    // Trigger the hidden file input click
    // This opens the native file browser dialog
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  /* ============================================
     FILE READER HANDLER
     ============================================
     Processes the selected file and loads its
     contents into the code editor.
     
     How it works:
     1. Receives the file selection event
     2. Validates that a file was selected
     3. Uses FileReader API to read file as text
     4. Updates code state with file contents
     5. Automatically triggers preview update via handleCodeChange
     
     Features:
     - Asynchronous file reading
     - Error handling and user feedback
     - Supports multiple file types
     - Console logging for debugging
  */
  const handleFileChange = (event) => {
    // Get the selected file from the input
    const file = event.target.files[0];
    
    // Check if a file was selected
    if (!file) {
      console.log('No file selected');
      return;
    }
    
    // Log the selected file information
    console.log(`Loading file: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
    
    // Create a FileReader to read the file content
    // FileReader is a built-in browser API for reading files
    const reader = new FileReader();
    
    // This function runs when the file reading is successful
    reader.onload = (e) => {
      try {
        // Get the file content as text
        const fileContent = e.target.result;
        
        // Update the code state with the file content
        // This will automatically trigger the preview update
        handleCodeChange(fileContent);
        
        // Log success message
        console.log(`File "${file.name}" loaded successfully!`);
        
        // Optional: Show user feedback (you can customize this)
        // The code will appear in the editor automatically
        
      } catch (error) {
        // Handle any errors that occur while processing the file
        console.error('Error processing file:', error);
        alert('Failed to process the file. Please try again.');
      }
    };
    
    // This function runs if file reading fails
    reader.onerror = () => {
      console.error('Error reading file');
      alert('Failed to read the file. Please try again.');
    };
    
    // Start reading the file as text
    // This is an asynchronous operation
    reader.readAsText(file);
    
    // Reset the file input so the same file can be selected again
    event.target.value = '';
  };

  return (
    <div className={darkMode ? "app-container dark" : "app-container light"}>
      <header className="header">
        <div className="header-left">
          <h1 className="logo">CipherStudio</h1>
        </div>
        <div className="header-right">
          <span className="theme-label">ChangeTheme</span>
          <div className="toggle-container">
            <div 
              className={`toggle-switch ${darkMode ? 'dark-mode' : 'light-mode'}`}
              onClick={toggleTheme}
            >
              <div className="toggle-handle">
                {darkMode && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
                )}
                {!darkMode && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="5"/>
                    <line x1="12" y1="1" x2="12" y2="3"/>
                    <line x1="12" y1="21" x2="12" y2="23"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                    <line x1="1" y1="12" x2="3" y2="12"/>
                    <line x1="21" y1="12" x2="23" y2="12"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                  </svg>
                )}
              </div>
            </div>
          </div>
          <button className="login-btn" onClick={() => navigate("/login")}>
            Login
          </button>
        </div>
      </header>
      
      <div className="main-content">
        <aside className="sidebar">
          <div className="button-group">
            <button className="btn" onClick={handleSaveProject}>Save Project</button>
            <button className="btn" onClick={handleLoadProject}>Load Project</button>
          </div>
          
          {/* Hidden file input for loading projects */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".js,.html,.txt,.css,.jsx,.ts,.tsx"
            style={{ display: 'none' }}
          />
          
          <div className="files-section">
            <h3 className="files-title">FILES</h3>
            <FileTree
              tree={tree}
              onCreateFile={handleCreateNewFile}
              onCreateFolder={handleCreateNewFolder}
              onRenameNode={(id) => {
                const res = findNodeAndParent(tree, id);
                if (!res) return;
                const currentName = res.node.name;
                const nextName = window.prompt('Rename to:', currentName);
                if (!nextName || nextName.trim() === currentName) return;
                const rename = (nodes) => nodes.map((n) => {
                  if (n.id === id) return { ...n, name: nextName.trim() };
                  if (n.type === 'folder' && n.children) {
                    return { ...n, children: rename(n.children) };
                  }
                  return n;
                });
                setTree((prev) => rename(prev));
              }}
              onSelectFile={(node) => {
                setActiveFile(node.id);
                const content = fileContents[node.id] ?? "";
                setCode(content);
                updatePreview(content);
              }}
              onMoveNode={handleMoveNode}
              onDeleteNode={handleDeleteNode}
              activeFileId={activeFile}
            />
          </div>
        </aside>

        <div className="editor-section">
          <div className="editor-tabs">
            <div className="tab active">{(() => {
              const res = activeFile ? findNodeAndParent(tree, activeFile) : null;
              return res?.node?.name || 'No file';
            })()}</div>
          </div>
          <textarea
            className="code-editor"
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            spellCheck={false}
            placeholder="Write your code here..."
          />
        </div>

        <div className="preview-section">
          <div className="preview-box">
            <div className="preview-content">
              {previewContent ? (
                <div dangerouslySetInnerHTML={{ __html: previewContent }} />
              ) : (
                <p className="preview-placeholder">Write code in the editor to see the output preview...</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer className="status-bar">
        <span>Ln 1, Col 1 | Spaces: 2 | UTF-8</span>
        <span>JavaScript ⚠️ 0</span>
      </footer>

      {/* Save Modal Dialog */}
      {showSaveModal && (
        <div className="modal-overlay" onClick={handleCloseSaveModal}>
          <div className="save-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Save Project</h2>
              <button className="modal-close-btn" onClick={handleCloseSaveModal}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="modal-form-group">
                <label htmlFor="filename-input">File Name</label>
                <input
                  id="filename-input"
                  type="text"
                  className="modal-input"
                  placeholder="Enter filename (or leave blank for default)"
                  value={customFilename}
                  onChange={(e) => setCustomFilename(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleDownloadFile();
                    } else if (e.key === 'Escape') {
                      handleCloseSaveModal();
                    }
                  }}
                  autoFocus
                />
              </div>
              
              <div className="modal-form-group">
                <label htmlFor="extension-select">File Type</label>
                <select
                  id="extension-select"
                  className="modal-select"
                  value={fileExtension}
                  onChange={(e) => setFileExtension(e.target.value)}
                >
                  <option value=".js">JavaScript (.js)</option>
                  <option value=".html">HTML (.html)</option>
                  <option value=".txt">Text (.txt)</option>
                  <option value=".css">CSS (.css)</option>
                </select>
              </div>
              
              <p className="modal-hint">
                Default filename: <span className="hint-filename">untitled_project.txt</span> (if left blank)
              </p>
            </div>
            
            <div className="modal-footer">
              <button className="modal-btn modal-btn-cancel" onClick={handleCloseSaveModal}>
                Cancel
              </button>
              <button className="modal-btn modal-btn-save" onClick={handleDownloadFile}>
                Save File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
