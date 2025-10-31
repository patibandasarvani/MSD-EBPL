const express = require('express');
const { EBPLCompiler } = require('../compiler/compilerCore');
const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const execAsync = promisify(exec);

router.post('/compile', async (req, res) => {
  try {
    const { sourceCode } = req.body;
    
    if (!sourceCode || sourceCode.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Source code is required'
      });
    }

    const compiler = new EBPLCompiler();
    const result = compiler.compile(sourceCode);

    if (result.success) {
      // Execute the generated Python code
      const executionResult = await executePythonCode(compiler.generatedCode);
      
      res.json({
        success: true,
        tokens: compiler.getTokensDisplay(),
        generatedCode: compiler.generatedCode,
        ast: compiler.getAstDisplay(),
        executionOutput: executionResult.output,
        executionError: executionResult.error
      });
    } else {
      res.json({
        success: false,
        error: result.error,
        errors: compiler.errors
      });
    }
  } catch (error) {
    console.error('Compilation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during compilation'
    });
  }
});

// Function to execute Python code
async function executePythonCode(pythonCode) {
  try {
    // Create a temporary Python file
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const tempFile = path.join(tempDir, `temp_${Date.now()}.py`);
    fs.writeFileSync(tempFile, pythonCode);
    
    // Execute the Python file
    let command = 'python';
    let { stdout, stderr } = await execAsync(`${command} ${tempFile}`);
    
    // If python fails, try python3
    if (stderr && stderr.includes('not found')) {
      command = 'python3';
      const result = await execAsync(`${command} ${tempFile}`);
      stdout = result.stdout;
      stderr = result.stderr;
    }
    
    // Clean up the temporary file
    try {
      fs.unlinkSync(tempFile);
    } catch (e) {
      console.warn('Could not delete temp file:', e.message);
    }
    
    return {
      output: stdout || '',
      error: stderr || ''
    };
  } catch (error) {
    return {
      output: '',
      error: `Python execution failed: ${error.message}`
    };
  }
}

module.exports = router;