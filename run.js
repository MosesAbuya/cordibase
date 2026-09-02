const { spawn } = require('child_process');
const path = require('path');

const services = [
  { name: 'WEB', path: 'apps/web', cmd: 'npx.cmd', args: ['next', 'dev'] },
  { name: 'CORE', path: 'apps/service-core', cmd: 'npx.cmd', args: ['tsx', 'watch', 'src/index.ts'] },
  { name: 'CRM', path: 'apps/service-crm', cmd: 'npx.cmd', args: ['tsx', 'watch', 'src/index.ts'] },
  { name: 'ACCOUNTING', path: 'apps/service-accounting', cmd: 'npx.cmd', args: ['tsx', 'watch', 'src/index.ts'] },
  { name: 'HRM', path: 'apps/service-hrm', cmd: 'npx.cmd', args: ['tsx', 'watch', 'src/index.ts'] }
];

console.log('\x1b[36m%s\x1b[0m', 'Starting all services in a single terminal...');

services.forEach(s => {
  const child = spawn(s.cmd, s.args, { 
    cwd: path.join(__dirname, s.path),
    stdio: 'inherit',
    shell: true 
  });

  child.on('error', (err) => {
    console.error(`[${s.name}] Error:`, err);
  });
});
