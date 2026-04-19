
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const MCP_COMMAND = '/usr/local/bin/npx';
const MCP_ARGS = ['-y', '@supabase/mcp-server-supabase@latest'];
const MIGRATION_FILE = 'supabase/migrations/20260419133300_create_profiles.sql';

async function callMcpTool(toolName, args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(MCP_COMMAND, MCP_ARGS, {
      env: {
        ...process.env,
        SUPABASE_ACCESS_TOKEN: 'sbp_b2479f1a1247ce988c2e0ea6734b8e4b4472de83',
        PATH: process.env.PATH + ':/usr/local/bin'
      }
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      const msg = data.toString();
      stdout += msg;
      
      // If the server sends a JSON-RPC response, we try to parse it
      try {
        const lines = stdout.split('\n');
        for (const line of lines) {
          if (line.includes('"result"')) {
             resolve(JSON.parse(line));
          }
        }
      } catch (e) {}
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    // We need to send the JSON-RPC call for 'execute_sql'
    const requestId = Date.now();
    const rpcCall = {
      jsonrpc: '2.0',
      id: requestId,
      method: 'call_tool',
      params: {
        name: toolName,
        arguments: args
      }
    };

    // Wait a bit for the server to initialize
    setTimeout(() => {
      proc.stdin.write(JSON.stringify(rpcCall) + '\n');
    }, 3000);

    proc.on('close', (code) => {
      if (code !== 0) reject(new Error(`MCP process exited with code ${code}: ${stderr}`));
      else resolve(stdout);
    });

    // Timeout if it takes too long
    setTimeout(() => {
      proc.kill();
      reject(new Error('MCP call timed out'));
    }, 15000);
  });
}

const sql = fs.readFileSync(MIGRATION_FILE, 'utf8');

console.log('--- EXECUTING SQL VIA MCP BRIDGE ---');
callMcpTool('execute_sql', { sql })
  .then(res => {
    console.log('RES:', JSON.stringify(res, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error('ERROR:', err);
    process.exit(1);
  });
