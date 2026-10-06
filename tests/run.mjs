import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const suites = ['solid', 'circuits', 'jumps', 'reverse', 'aircontacts', 'rebuild', 'smooth'];
for (const name of suites) {
  const result = spawnSync(process.execPath, [fileURLToPath(new URL(`test-${name}.mjs`, import.meta.url))], { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
console.log('All 7 racing regression suites passed.');
