import fs from 'node:fs';
import path from 'node:path';

const roots = ['src', 'entities', 'supabase', 'README.md'];
const textExtensions = new Set([
  '.css',
  '.js',
  '.json',
  '.jsx',
  '.md',
  '.sql',
  '.ts',
  '.tsx',
]);

const mojibakePatterns = [
  {
    name: 'replacement character',
    pattern: /\uFFFD/g,
  },
  {
    name: 'C1 control character',
    pattern: /[\u0080-\u009F]/g,
  },
  {
    name: 'UTF-8 Hebrew decoded as Latin-1',
    pattern: /×[\u0080-\u00FF]|[\u0080-\u00FF]×/g,
  },
  {
    name: 'UTF-8 shekel sign decoded as Latin-1',
    pattern: /â‚ª|ג‚×|ג‚ª/g,
  },
];

const findings = [];

const isTextFile = (filePath) => textExtensions.has(path.extname(filePath).toLowerCase());

const walk = (entryPath) => {
  if (!fs.existsSync(entryPath)) return [];

  const stats = fs.statSync(entryPath);
  if (stats.isFile()) return isTextFile(entryPath) ? [entryPath] : [];

  return fs.readdirSync(entryPath, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') return [];
    return walk(path.join(entryPath, entry.name));
  });
};

const lineInfo = (text, index) => {
  const before = text.slice(0, index);
  const line = before.split(/\r?\n/).length;
  const lineStart = Math.max(text.lastIndexOf('\n', index - 1), 0);
  const lineEnd = text.indexOf('\n', index);
  const rawSnippet = text.slice(lineStart, lineEnd === -1 ? text.length : lineEnd).trim();
  return {
    line,
    snippet: rawSnippet.length > 140 ? `${rawSnippet.slice(0, 137)}...` : rawSnippet,
  };
};

for (const filePath of roots.flatMap(walk)) {
  const text = fs.readFileSync(filePath, 'utf8');

  for (const { name, pattern } of mojibakePatterns) {
    pattern.lastIndex = 0;
    for (const match of text.matchAll(pattern)) {
      const { line, snippet } = lineInfo(text, match.index ?? 0);
      findings.push({ filePath, line, name, snippet });
    }
  }
}

if (findings.length > 0) {
  console.error('Possible broken Hebrew encoding found:');
  for (const finding of findings) {
    console.error(`- ${finding.filePath}:${finding.line} (${finding.name}) ${finding.snippet}`);
  }
  process.exit(1);
}

console.log('Hebrew encoding check passed.');
