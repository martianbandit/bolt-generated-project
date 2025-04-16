import { useState, useEffect } from 'react';
import Editor from './components/Editor';
import FileExplorer from './components/FileExplorer';
import Terminal from './components/Terminal';
import Preview from './components/Preview';
import SplitPane from 'split-pane-react/esm/SplitPane';
import Divider from 'split-pane-react/esm/Divider';
import SplitPaneContext from 'split-pane-react/esm/SplitPaneContext';
import { createDefaultFiles, FileSystemManager } from './utils/fileSystem';

function App() {
  const [files, setFiles] = useState([]);
  const [currentFile, setCurrentFile] = useState(null);
  const [splitSizes, setSplitSizes] = useState(['250px', 'auto']);
  const [verticalSizes, setVerticalSizes] = useState(['60%', '40%']);
  const [horizontalSizes, setHorizontalSizes] = useState(['50%', '50%']);
  const [viewMode, setViewMode] = useState('editor'); // 'editor', 'preview', 'split'
  const [fileSystem] = useState(new FileSystemManager());

  useEffect(() => {
    const initializeFiles = async () => {
      const defaultFiles = createDefaultFiles();
      await Promise.all(defaultFiles.map(file => fileSystem.writeFile(file.path, file.content)));
      
      const fileList = await fileSystem.listFiles();
      setFiles(fileList);
      
      if (fileList.length > 0) {
        setCurrentFile(fileList[0]);
      }
    };
    
    initializeFiles();
  }, [fileSystem]);

  const handleFileSelect = async (file) => {
    setCurrentFile(file);
  };

  const handleFileCreate = async (name, isDirectory = false) => {
    const path = isDirectory ? name : name.endsWith('.html') || name.endsWith('.js') || name.endsWith('.css') ? name : `${name}.js`;
    
    if (isDirectory) {
      await fileSystem.createDirectory(path);
    } else {
      await fileSystem.writeFile(path, '');
    }
    
    const updatedFiles = await fileSystem.listFiles();
    setFiles(updatedFiles);
    
    if (!isDirectory) {
      const newFile = updatedFiles.find(f => f.path === path);
      if (newFile) {
        setCurrentFile(newFile);
      }
    }
  };

  const handleFileDelete = async (file) => {
    await fileSystem.deleteFile(file.path);
    
    const updatedFiles = await fileSystem.listFiles();
    setFiles(updatedFiles);
    
    if (currentFile && currentFile.path === file.path) {
      setCurrentFile(updatedFiles.length > 0 ? updatedFiles[0] : null);
    }
  };

  const handleCodeChange = async (newCode) => {
    if (currentFile) {
      await fileSystem.writeFile(currentFile.path, newCode);
      const updatedFiles = await fileSystem.listFiles();
      setFiles(updatedFiles);
    }
  };

  const toggleViewMode = () => {
    setViewMode(current => {
      switch (current) {
        case 'editor': return 'preview';
        case 'preview': return 'split';
        case 'split': return 'editor';
        default: return 'editor';
      }
    });
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="app-title">Code Editor App</div>
        <div>
          <button className="button" onClick={toggleViewMode}>
            {viewMode === 'editor' ? 'Preview' : viewMode === 'preview' ? 'Split' : 'Editor'}
          </button>
        </div>
      </header>
      <div className="main-container">
        <SplitPane
          split="horizontal"
          sizes={splitSizes}
          onChange={setSplitSizes}
        >
          <div className="sidebar">
            <div className="sidebar-header">Files</div>
            <FileExplorer 
              files={files} 
              currentFile={currentFile} 
              onFileSelect={handleFileSelect}
              onFileCreate={handleFileCreate}
              onFileDelete={handleFileDelete}
            />
          </div>
          <div className="content-area">
            {viewMode === 'editor' && (
              <SplitPane
                split="vertical"
                sizes={verticalSizes}
                onChange={setVerticalSizes}
              >
                <div className="editor-container">
                  <Editor 
                    file={currentFile} 
                    onCodeChange={handleCodeChange} 
                    fileSystem={fileSystem}
                  />
                </div>
                <div className="terminal-container">
                  <Terminal />
                </div>
              </SplitPane>
            )}
            
            {viewMode === 'preview' && (
              <Preview files={files} />
            )}
            
            {viewMode === 'split' && (
              <SplitPane
                split="horizontal"
                sizes={horizontalSizes}
                onChange={setHorizontalSizes}
              >
                <div className="editor-container">
                  <Editor 
                    file={currentFile} 
                    onCodeChange={handleCodeChange} 
                    fileSystem={fileSystem}
                  />
                </div>
                <div className="preview-container">
                  <Preview files={files} />
                </div>
              </SplitPane>
            )}
          </div>
        </SplitPane>
      </div>
    </div>
  );
}

export default App;
