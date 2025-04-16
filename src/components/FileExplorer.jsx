import { useState, useRef, useEffect } from 'react';
import { FaFile, FaFolder, FaFolderOpen, FaPlus, FaTrash } from 'react-icons/fa';

function FileExplorer({ files, currentFile, onFileSelect, onFileCreate, onFileDelete }) {
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0 });
  const [newFileMode, setNewFileMode] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (newFileMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [newFileMode]);

  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY
    });
  };

  const handleClick = () => {
    setContextMenu({ show: false, x: 0, y: 0 });
  };

  useEffect(() => {
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  const handleNewFile = () => {
    setNewFileMode(true);
    setContextMenu({ show: false, x: 0, y: 0 });
  };

  const handleNewFolder = () => {
    setNewFileMode(true);
    setNewFileName('New Folder/');
    setContextMenu({ show: false, x: 0, y: 0 });
  };

  const handleSubmitNewFile = (e) => {
    e.preventDefault();
    if (newFileName.trim()) {
      const isDirectory = newFileName.endsWith('/');
      const name = isDirectory ? newFileName.slice(0, -1) : newFileName;
      onFileCreate(name, isDirectory);
    }
    setNewFileMode(false);
    setNewFileName('');
  };

  const renderFiles = (filesList) => {
    return filesList.map((file) => (
      <div
        key={file.path}
        className={`file-item ${currentFile && currentFile.path === file.path ? 'active' : ''}`}
        onClick={() => !file.isDirectory && onFileSelect(file)}
        onContextMenu={(e) => {
          e.stopPropagation();
          handleContextMenu(e);
        }}
      >
        <div className="file-item-icon">
          {file.isDirectory ? (
            file.expanded ? <FaFolderOpen /> : <FaFolder />
          ) : (
            <FaFile />
          )}
        </div>
        <div className="file-item-name">{file.name}</div>
        <div 
          className="file-item-action"
          onClick={(e) => {
            e.stopPropagation();
            onFileDelete(file);
          }}
        >
          <FaTrash />
        </div>
      </div>
    ));
  };

  return (
    <div 
      className="file-explorer"
      onContextMenu={handleContextMenu}
    >
      <div className="file-explorer-header">
        <button 
          className="button"
          onClick={handleNewFile}
          style={{ marginRight: '8px' }}
        >
          <FaPlus /> File
        </button>
        <button 
          className="button"
          onClick={handleNewFolder}
        >
          <FaPlus /> Folder
        </button>
      </div>
      
      {newFileMode ? (
        <form onSubmit={handleSubmitNewFile}>
          <input
            ref={inputRef}
            type="text"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onBlur={() => {
              setNewFileMode(false);
              setNewFileName('');
            }}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-color)',
              color: 'var(--text-color)',
              padding: '4px 8px',
              width: '100%',
              marginTop: '8px'
            }}
          />
        </form>
      ) : null}
      
      {renderFiles(files)}
      
      {contextMenu.show && (
        <div 
          className="context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <div className="context-menu-item" onClick={handleNewFile}>
            New File
          </div>
          <div className="context-menu-item" onClick={handleNewFolder}>
            New Folder
          </div>
        </div>
      )}
    </div>
  );
}

export default FileExplorer;
