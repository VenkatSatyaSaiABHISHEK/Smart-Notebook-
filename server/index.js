const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.post('/api/extract-colab', async (req, res) => {
  const { url } = req.body;
  
  if (!url || !url.includes('colab.research.google.com')) {
    return res.status(400).json({ error: 'Invalid Google Colab URL' });
  }

  try {
    // Extract File ID from Colab Link
    const match = url.match(/\/drive\/([a-zA-Z0-9_-]+)/);
    if (!match || !match[1]) {
      return res.status(400).json({ error: 'Could not extract File ID from URL' });
    }
    
    const fileId = match[1];
    const apiKey = process.env.GOOGLE_DRIVE_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Server missing GOOGLE_DRIVE_API_KEY. Add it to server/.env' });
    }

    // Fetch the .ipynb JSON from Google Drive API
    const response = await axios.get(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`);
    
    const notebookData = response.data;
    
    if (!notebookData || !notebookData.cells) {
      return res.status(400).json({ error: 'Invalid notebook format. No cells found.' });
    }

    // Extract code and text cells
    let extractedCells = [];

    notebookData.cells.forEach(cell => {
      const sourceCode = Array.isArray(cell.source) ? cell.source.join('') : cell.source || '';
      if (!sourceCode.trim()) return;

      if (cell.cell_type === 'code') {
        let outputText = '';
        if (cell.outputs && Array.isArray(cell.outputs)) {
          cell.outputs.forEach(out => {
            if (out.text) {
              outputText += Array.isArray(out.text) ? out.text.join('') : out.text;
            } else if (out.data && out.data['text/plain']) {
              outputText += Array.isArray(out.data['text/plain']) ? out.data['text/plain'].join('') : out.data['text/plain'];
            }
          });
        }
        extractedCells.push({ type: 'code', content: sourceCode, language: 'python', output: outputText.trim() });
      } else if (cell.cell_type === 'markdown') {
        extractedCells.push({ type: 'text', content: sourceCode });
      }
    });

    if (extractedCells.length === 0) {
      extractedCells.push({ type: 'text', content: 'No readable content found in this notebook.' });
    }

    res.json({ cells: extractedCells });

  } catch (error) {
    console.error('Error fetching Colab file:', error.response?.data || error.message);
    if (error.response && (error.response.status === 403 || error.response.status === 404)) {
        return res.status(403).json({ error: 'This Colab link is private. Please share it so "Anyone with the link can view".' });
    }
    res.status(500).json({ error: 'Failed to extract data from Google Drive. Ensure the link is public.' });
  }
});

// Local code execution endpoint replacing Piston API
app.post('/api/execute', (req, res) => {
  const { language, code } = req.body;
  if (!code) return res.status(400).json({ error: 'No code provided' });

  const id = Date.now() + '_' + Math.floor(Math.random() * 100000);
  
  if (language === 'python') {
    const tmpFile = path.join(os.tmpdir(), `script_${id}.py`);
    fs.writeFileSync(tmpFile, code);
    
    exec(`python "${tmpFile}"`, (error, stdout, stderr) => {
      try { fs.unlinkSync(tmpFile); } catch (e) {}
      if (error) {
        return res.json({ output: stderr || error.message });
      }
      res.json({ output: stdout || stderr });
    });
    
  } else if (language === 'c') {
    const cFile = path.join(os.tmpdir(), `script_${id}.c`);
    const exeFile = path.join(os.tmpdir(), `script_${id}.exe`);
    fs.writeFileSync(cFile, code);
    
    exec(`gcc "${cFile}" -o "${exeFile}"`, (compileError, compileStdout, compileStderr) => {
      if (compileError) {
        try { fs.unlinkSync(cFile); } catch (e) {}
        return res.json({ output: compileStderr || compileError.message });
      }
      
      exec(`"${exeFile}"`, (runError, runStdout, runStderr) => {
        try { fs.unlinkSync(cFile); fs.unlinkSync(exeFile); } catch (e) {}
        if (runError) {
          return res.json({ output: runStderr || runError.message });
        }
        res.json({ output: runStdout || runStderr });
      });
    });
    
  } else {
    res.status(400).json({ error: 'Unsupported language' });
  }
});

// Live Syntax Linting Endpoint
app.post('/api/lint', (req, res) => {
  const { language, code } = req.body;
  if (!code) return res.json({ errors: [] });

  const id = Date.now() + '_' + Math.floor(Math.random() * 100000);

  if (language === 'python') {
    const tmpFile = path.join(os.tmpdir(), `lint_${id}.py`);
    fs.writeFileSync(tmpFile, code);
    exec(`python -m py_compile "${tmpFile}"`, (error, stdout, stderr) => {
      try { fs.unlinkSync(tmpFile); } catch (e) {}
      if (error) {
        const out = stderr || stdout || error.message;
        const lineMatch = out.match(/line (\d+)/);
        const line = lineMatch ? parseInt(lineMatch[1]) : 1;
        
        let msg = 'Syntax Error';
        const msgMatch = out.match(/(\w+Error:.*)/);
        if (msgMatch) msg = msgMatch[1];
        else if (out.includes('SyntaxError')) msg = 'SyntaxError: invalid syntax';
        
        // Ignore errors caused by incomplete code while the user is actively typing
        if (msg.includes('expected an indented block') || 
            msg.includes('unexpected EOF while parsing') ||
            msg.includes('incomplete input')) {
          return res.json({ errors: [] });
        }
        
        return res.json({ errors: [{ line, message: msg }] });
      }
      res.json({ errors: [] });
    });
  } else if (language === 'c') {
    const tmpFile = path.join(os.tmpdir(), `lint_${id}.c`);
    fs.writeFileSync(tmpFile, code);
    exec(`gcc -fsyntax-only "${tmpFile}"`, (error, stdout, stderr) => {
      try { fs.unlinkSync(tmpFile); } catch (e) {}
      if (error) {
        const out = stderr || stdout || error.message;
        const errors = [];
        const regex = /:(\d+):\d+: error: (.*)/g;
        let match;
        while ((match = regex.exec(out)) !== null) {
          errors.push({ line: parseInt(match[1]), message: match[2] });
        }
        if (errors.length > 0) return res.json({ errors });
        return res.json({ errors: [{ line: 1, message: 'Compilation Error' }] });
      }
      res.json({ errors: [] });
    });
  } else {
    res.json({ errors: [] });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
