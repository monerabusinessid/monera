const fs = require('fs');
const path = require('path');

function fixPrismaImports(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      fixPrismaImports(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      
      // Fix: import { prisma } from '@/lib/db' -> import { db } from '@/lib/db'
      if (content.includes("import { prisma } from '@/lib/db'")) {
        content = content.replace(/import { prisma } from '@\/lib\/db'/g, "import { db } from '@/lib/db'");
        modified = true;
      }
      
      // Fix: prisma. -> db.
      if (content.includes('prisma.')) {
        content = content.replace(/prisma\./g, 'db.');
        modified = true;
      }
      
      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('✅ Fixed prisma imports in:', filePath);
      }
    }
  });
}

const appDir = path.join(__dirname, 'app');
const libDir = path.join(__dirname, 'lib');

console.log('Fixing prisma imports to use db...\n');
fixPrismaImports(appDir);
fixPrismaImports(libDir);
console.log('\n✅ Done!');
