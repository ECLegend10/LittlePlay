import { readdir, readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const pkg = JSON.parse(await readFile('package.json', 'utf8'));
assert.equal(pkg.scripts.build, 'next build', 'Use the native Next.js build');
for (const folder of ['app', 'lib', 'db']) await scan(folder);
async function scan(folder) {
  for (const item of await readdir(folder, { withFileTypes: true })) {
    const path = `${folder}/${item.name}`;
    if (item.isDirectory()) await scan(path);
    else if (/\.[cm]?[jt]sx?$/.test(item.name)) {
      const content = await readFile(path, 'utf8');
      assert(!/cloudflare:workers|drizzle-orm\/d1|oai-authenticated-user-|signin-with-chatgpt|signout-with-chatgpt/.test(content), `Sites runtime dependency in ${path}`);
    }
  }
}
console.log('Native Next.js scripts and runtime adapters verified.');
