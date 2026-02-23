const fs = require('fs');
const path = require('path');

function addEdgeRuntime(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      addEdgeRuntime(filePath);
    } else if (file === 'route.ts') {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Check if already has runtime export
      if (!content.includes("export const runtime = 'edge'")) {
        // Add after imports, before first export
        const lines = content.split('\n');
        let insertIndex = 0;
        
        // Find last import or first export
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].startsWith('import ') || lines[i].startsWith('export const dynamic')) {
            insertIndex = i + 1;
          }
          if (lines[i].startsWith('export async function') || lines[i].startsWith('export function')) {
            break;
          }
        }
        
        lines.splice(insertIndex, 0, "export const runtime = 'edge'");
        content = lines.join('\n');
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('✅ Added edge runtime to:', filePath);
      } else {
        console.log('⏭️  Already has edge runtime:', filePath);
      }
    }
  });
}

const apiDir = path.join(__dirname, 'app', 'api');
console.log('Adding edge runtime to all API routes...\n');
addEdgeRuntime(apiDir);
console.log('\n✅ Done!');
