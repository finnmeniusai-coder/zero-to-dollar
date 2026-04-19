
import { spawn } from 'child_process';
import fs from 'fs';

const MCP_PATH = '/Users/finnjennen/.npm/_npx/53c4795544aaa350/node_modules/.bin/mcp-server-supabase';
const MIGRATION_FILE = 'supabase/migrations/20260419133300_create_profiles.sql';

async function runMcpTransaction() {
  return new Promise((resolve, reject) => {
    const proc = spawn(MCP_PATH, [], {
      env: {
        ...process.env,
        SUPABASE_ACCESS_TOKEN: 'sbp_b2479f1a1247ce988c2e0ea6734b8e4b4472de83',
        PATH: process.env.PATH + ':/usr/local/bin'
      }
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
      console.log('STDOUT:', data.toString());
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
      console.error('STDERR:', data.toString());
    });

    const send = (obj) => {
        proc.stdin.write(JSON.stringify(obj) + '\n');
    };

    // MCP sequence
    setTimeout(() => {
      console.log('Sending initialize...');
      send({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: 'bridge', version: '1.0' }
        }
      });
    }, 1000);

    setTimeout(() => {
      console.log('Sending initialized notification...');
      send({
        jsonrpc: '2.0',
        method: 'notifications/initialized'
      });
    }, 2000);

    setTimeout(() => {
      console.log('Sending execute_sql tool call...');
      const sql = fs.readFileSync(MIGRATION_FILE, 'utf8');
      send({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'execute_sql',
          arguments: { sql }
        }
      });
    }, 3000);

    setTimeout(() => {
      proc.kill();
      resolve(stdout);
    }, 10000);
  });
}

runMcpTransaction().then(res => {
    console.log('--- DONE ---');
});
