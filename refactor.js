const fs = require('fs');
const path = require('path');

const root = 'd:/Client Project/CloudyBD/cloudybd-app';

// 1. Move folders to src
const srcPath = path.join(root, 'src');
if (!fs.existsSync(srcPath)) {
  fs.mkdirSync(srcPath);
}

const foldersToMove = ['app', 'components', 'lib', 'actions', 'hooks', 'types', 'auth.ts', 'proxy.ts'];
for (const item of foldersToMove) {
  const oldPath = path.join(root, item);
  const newPath = path.join(srcPath, item);
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    console.log('Moved ' + item + ' to src/' + item);
  }
}

// 2. Search and replace in all files (recursive)
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (let file of list) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.next') && !file.includes('.git')) {
        results = results.concat(walk(file));
      }
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.md') || file.endsWith('.json') || file.endsWith('.css') || file.endsWith('.prisma')) {
        results.push(file);
      }
    }
  }
  return results;
}

const allFiles = walk(root);
let replaceCount = 0;

for (const file of allFiles) {
  if (file.includes('package-lock.json')) continue;
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  // Replacements
  content = content.replace(/cloudybd\.com/gi, 'fashion.devwonder.shop');
  content = content.replace(/CloudyBD/g, 'DevWonder Fashion');
  content = content.replace(/CLOUDY BD/g, 'DEVWONDER FASHION');
  content = content.replace(/CLOUDY/g, 'DEVWONDER'); // For logo pieces
  content = content.replace(/cloudybd_cart/g, 'devwonder_cart');
  content = content.replace(/cloudybd/gi, 'devwonder');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    replaceCount++;
    console.log('Updated file:', file);
  }
}
console.log('Replaced text in ' + replaceCount + ' files.');

// 3. Update tsconfig.json paths
const tsconfigPath = path.join(root, 'tsconfig.json');
if (fs.existsSync(tsconfigPath)) {
  let tsconfig = fs.readFileSync(tsconfigPath, 'utf8');
  tsconfig = tsconfig.replace(/"@\/\*": \["\.\/\*"\]/g, '"@/*": ["./src/*"]');
  fs.writeFileSync(tsconfigPath, tsconfig, 'utf8');
  console.log('Updated tsconfig.json');
}

// 4. Update tailwind.config.ts content paths (if it exists)
// We didn't create a tailwind.config.ts explicitly, we might have tailwind configs in another file, wait. Let's see if there is one.
const tailwindPath = path.join(root, 'tailwind.config.ts');
if (fs.existsSync(tailwindPath)) {
  let tw = fs.readFileSync(tailwindPath, 'utf8');
  tw = tw.replace(/\.\/app\/\*\*\/\*\.\{js,ts,jsx,tsx,mdx\}/g, './src/app/**/*.{js,ts,jsx,tsx,mdx}');
  tw = tw.replace(/\.\/pages\/\*\*\/\*\.\{js,ts,jsx,tsx,mdx\}/g, './src/pages/**/*.{js,ts,jsx,tsx,mdx}');
  tw = tw.replace(/\.\/components\/\*\*\/\*\.\{js,ts,jsx,tsx,mdx\}/g, './src/components/**/*.{js,ts,jsx,tsx,mdx}');
  fs.writeFileSync(tailwindPath, tw, 'utf8');
  console.log('Updated tailwind.config.ts');
}

console.log('All done.');
