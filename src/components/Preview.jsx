import { useEffect, useState, useRef } from 'react';

function Preview({ files }) {
  const iframeRef = useRef(null);
  const [htmlContent, setHtmlContent] = useState('');
  
  useEffect(() => {
    // Find HTML, CSS and JS files
    const htmlFile = files.find(file => file.path.endsWith('.html'));
    const cssFiles = files.filter(file => file.path.endsWith('.css'));
    const jsFiles = files.filter(file => file.path.endsWith('.js'));
    
    if (htmlFile && htmlFile.content) {
      let content = htmlFile.content;
      
      // Inject CSS into HTML
      if (cssFiles.length) {
        const styleTag = cssFiles.map(file => 
          `<style>${file.content}</style>`
        ).join('');
        
        content = content.replace('</head>', `${styleTag}</head>`);
      }
      
      // Inject JS into HTML
      if (jsFiles.length) {
        const scriptTag = jsFiles.map(file => 
          `<script>${file.content}</script>`
        ).join('');
        
        content = content.replace('</body>', `${scriptTag}</body>`);
      }
      
      setHtmlContent(content);
    } else {
      // Create default HTML if no HTML file exists
      let defaultHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Preview</title>
          ${cssFiles.map(file => `<style>${file.content}</style>`).join('')}
        </head>
        <body>
          <div id="app">
            <h1>Preview</h1>
            <p>Create an HTML file to see your content here.</p>
          </div>
          ${jsFiles.map(file => `<script>${file.content}</script>`).join('')}
        </body>
        </html>
      `;
      
      setHtmlContent(defaultHtml);
    }
  }, [files]);
  
  useEffect(() => {
    if (iframeRef.current && htmlContent) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      
      doc.open();
      doc.write(htmlContent);
      doc.close();
    }
  }, [htmlContent]);
  
  return (
    <iframe 
      ref={iframeRef}
      title="Preview"
      style={{ width: '100%', height: '100%', border: 'none' }}
      sandbox="allow-scripts allow-same-origin"
    />
  );
}

export default Preview;
