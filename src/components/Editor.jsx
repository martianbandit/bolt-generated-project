import { useEffect, useRef, useState } from 'react';
import * as monaco from 'monaco-editor';

function Editor({ file, onCodeChange, fileSystem }) {
  const editorRef = useRef(null);
  const containerRef = useRef(null);
  const [content, setContent] = useState('');

  useEffect(() => {
    if (!containerRef.current) return;

    editorRef.current = monaco.editor.create(containerRef.current, {
      value: '',
      language: 'javascript',
      theme: 'vs-dark',
      automaticLayout: true,
      minimap: {
        enabled: false
      },
      fontSize: 14,
      lineNumbers: 'on',
      scrollBeyondLastLine: false,
      wordWrap: 'on',
    });

    const model = editorRef.current.getModel();
    
    model.onDidChangeContent(() => {
      const newValue = editorRef.current.getValue();
      setContent(newValue);
      onCodeChange(newValue);
    });

    return () => {
      editorRef.current.dispose();
    };
  }, []);

  useEffect(() => {
    const loadFileContent = async () => {
      if (file && editorRef.current) {
        try {
          const fileContent = await fileSystem.readFile(file.path);
          setContent(fileContent);
          
          // Determine language based on file extension
          const language = getLanguageFromFilename(file.path);
          
          // Update model with new content and language
          const model = monaco.editor.createModel(
            fileContent,
            language
          );
          
          editorRef.current.setModel(model);
        } catch (error) {
          console.error('Error loading file:', error);
        }
      }
    };
    
    loadFileContent();
  }, [file, fileSystem]);

  const getLanguageFromFilename = (filename) => {
    if (filename.endsWith('.js')) return 'javascript';
    if (filename.endsWith('.jsx')) return 'javascript';
    if (filename.endsWith('.ts')) return 'typescript';
    if (filename.endsWith('.tsx')) return 'typescript';
    if (filename.endsWith('.html')) return 'html';
    if (filename.endsWith('.css')) return 'css';
    if (filename.endsWith('.json')) return 'json';
    if (filename.endsWith('.md')) return 'markdown';
    return 'plaintext';
  };

  return (
    <div 
      ref={containerRef} 
      style={{ width: '100%', height: '100%' }}
    />
  );
}

export default Editor;
