import { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

function Terminal() {
  const terminalRef = useRef(null);
  const xtermRef = useRef(null);
  const fitAddonRef = useRef(null);
  
  useEffect(() => {
    // Initialize xterm.js
    xtermRef.current = new XTerm({
      cursorBlink: true,
      theme: {
        background: '#1e1e1e',
        foreground: '#e0e0e0',
        cursor: '#ffffff',
        selection: 'rgba(255, 255, 255, 0.3)',
      },
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      fontSize: 14,
    });
    
    fitAddonRef.current = new FitAddon();
    xtermRef.current.loadAddon(fitAddonRef.current);
    
    // Open the terminal in the container
    xtermRef.current.open(terminalRef.current);
    fitAddonRef.current.fit();
    
    // Initial welcome message
    xtermRef.current.writeln('Welcome to the Code Editor Terminal!');
    xtermRef.current.writeln('This is a simulated terminal.');
    xtermRef.current.writeln('Type "help" for available commands.');
    xtermRef.current.write('\r\n$ ');
    
    // Set up input handling
    let command = '';
    
    xtermRef.current.onKey(({ key, domEvent }) => {
      const printable = !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey;
      
      if (domEvent.keyCode === 13) { // Enter key
        xtermRef.current.writeln('');
        processCommand(command);
        command = '';
        xtermRef.current.write('$ ');
      } else if (domEvent.keyCode === 8) { // Backspace
        if (command.length > 0) {
          command = command.substring(0, command.length - 1);
          xtermRef.current.write('\b \b');
        }
      } else if (printable) {
        command += key;
        xtermRef.current.write(key);
      }
    });
    
    // Resize handler
    const handleResize = () => {
      fitAddonRef.current.fit();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (xtermRef.current) {
        xtermRef.current.dispose();
      }
    };
  }, []);
  
  const processCommand = (command) => {
    const commandMap = {
      help: () => {
        xtermRef.current.writeln('Available commands:');
        xtermRef.current.writeln('  help - Show this help message');
        xtermRef.current.writeln('  clear - Clear the terminal');
        xtermRef.current.writeln('  ls - List files');
        xtermRef.current.writeln('  echo [text] - Echo text');
        xtermRef.current.writeln('  date - Show current date');
      },
      clear: () => {
        xtermRef.current.clear();
      },
      ls: () => {
        xtermRef.current.writeln('index.html');
        xtermRef.current.writeln('main.js');
        xtermRef.current.writeln('style.css');
      },
      date: () => {
        xtermRef.current.writeln(new Date().toString());
      },
      '': () => {
        // Do nothing for empty command
      }
    };
    
    if (command.startsWith('echo ')) {
      xtermRef.current.writeln(command.substring(5));
      return;
    }
    
    const cmd = commandMap[command];
    if (cmd) {
      cmd();
    } else {
      xtermRef.current.writeln(`Command not found: ${command}`);
    }
  };
  
  return (
    <div ref={terminalRef} style={{ width: '100%', height: '100%' }} />
  );
}

export default Terminal;
