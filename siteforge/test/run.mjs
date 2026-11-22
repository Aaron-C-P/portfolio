// Runs each test file in its own Node process (the database is WebAssembly and each file wants a fresh one).
// --liftoff-only keeps the wasm compiler's memory use small enough for modest machines.
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const files = fs.readdirSync('test').filter((f) => f.endsWith('.test.js')).sort();
let failed = 0;
for (const f of files) {
  const code = await new Promise((resolve) => {
    const args = f === 'team.test.js' ? ['--test', '--test-force-exit'] : ['--liftoff-only'];
    const p = spawn(process.execPath, [...args, `test/${f}`], { stdio: ['ignore', 'pipe', 'inherit'] });
    let tail = '';
    let result = null;
    p.stdout.on('data', (d) => {
      process.stdout.write(d);
      tail = (tail + d).slice(-400);
      const m = tail.match(/ℹ fail (\d+)/);
      if (m && result === null) {
        result = Number(m[1]);
        setTimeout(() => p.kill(), 1500); // the summary is printed: a leftover database handle must not hang the run
      }
    });
    const guard = setTimeout(() => p.kill(), 240000);
    p.on('exit', (c) => { clearTimeout(guard); resolve(result !== null ? result : c || 1); });
  });
  if (code) failed++;
}
console.log(failed ? `\n${failed} test file(s) failed` : '\nall test files passed');
process.exit(failed ? 1 : 0);
