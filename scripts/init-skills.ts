import fs from 'fs';
import path from 'path';

const NANOCLAW_DIR = '.nanoclaw';
const BASE_DIR = '.nanoclaw/base';
const BACKUP_DIR = '.nanoclaw/backups';
const STATE_FILE = '.nanoclaw/state.yaml';

const BASE_INCLUDES = ['src', 'container', 'package.json', 'tsconfig.json'];
const BASE_EXCLUDES = ['node_modules', '.nanoclaw', '.git', 'dist', 'data', 'groups', 'store', 'logs'];

function copyDirFiltered(src: string, dest: string, excludes: string[]): void {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (excludes.includes(entry.name)) continue;
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirFiltered(srcPath, destPath, excludes);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const projectRoot = process.cwd();
fs.mkdirSync(BACKUP_DIR, { recursive: true });

if (fs.existsSync(BASE_DIR)) {
  fs.rmSync(BASE_DIR, { recursive: true, force: true });
}
fs.mkdirSync(BASE_DIR, { recursive: true });

for (const include of BASE_INCLUDES) {
  const srcPath = path.join(projectRoot, include);
  if (!fs.existsSync(srcPath)) continue;
  const destPath = path.join(BASE_DIR, include);
  const stat = fs.statSync(srcPath);
  if (stat.isDirectory()) {
    copyDirFiltered(srcPath, destPath, BASE_EXCLUDES);
  } else {
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.copyFileSync(srcPath, destPath);
  }
}

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
const state = {
  skills_system_version: '0.1.0',
  core_version: pkg.version || '0.0.0',
  applied_skills: []
};
fs.writeFileSync(STATE_FILE, `skills_system_version: "${state.skills_system_version}"
core_version: "${state.core_version}"
applied_skills: []
`);
console.log('Skills system initialized.');
