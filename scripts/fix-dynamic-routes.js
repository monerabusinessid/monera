const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..');

const routes = [
  'app/api/applications/[id]/route.ts',
  'app/api/jobs/[id]/route.ts',
  'app/api/notifications/[id]/route.ts',
  'app/api/talent-requests/[id]/route.ts',
];

routes.forEach(route => {
  const filePath = path.join(baseDir, route);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (!content.includes("export const dynamic = 'force-dynamic'")) {
      const lines = content.split('\n');
      let insertIndex = 0;
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith('import ')) {
          insertIndex = i + 1;
        } else if (lines[i].trim() === '' && insertIndex > 0) {
          insertIndex = i;
          break;
        }
      }
      
      lines.splice(insertIndex, 0, '', "export const dynamic = 'force-dynamic'");
      content = lines.join('\n');
      
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Added dynamic to: ${route}`);
    } else {
      console.log(`⏭️  Skipped: ${route}`);
    }
  }
});

console.log('\n✅ Done!');
