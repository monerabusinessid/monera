const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Normalize line endings to \n
  content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Remove any duplicate dynamic exports
  const lines = content.split('\n');
  const seen = new Set();
  const filtered = lines.filter(line => {
    const trimmed = line.trim();
    if (trimmed === "export const dynamic = 'force-dynamic'" || trimmed === 'export const dynamic = "force-dynamic"') {
      if (seen.has('dynamic')) {
        return false;
      }
      seen.add('dynamic');
    }
    return true;
  });
  
  content = filtered.join('\n');
  fs.writeFileSync(filePath, content, 'utf8');
}

function processDirectory(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    
    if (item.isDirectory()) {
      processDirectory(fullPath);
    } else if (item.name === 'route.ts' || item.name === 'route.tsx' || item.name === 'page.tsx') {
      fixFile(fullPath);
      console.log(`✅ ${fullPath.replace(process.cwd() + path.sep, '')}`);
    }
  }
}

const apiDir = path.join(process.cwd(), 'app', 'api');
if (fs.existsSync(apiDir)) {
  processDirectory(apiDir);
}

console.log('\n✅ Done!');
