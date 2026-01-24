const fs = require('fs');
const path = require('path');
const glob = require('glob');

const baseDir = path.join(__dirname, '..');

// Find all route files with [id] or [jobId] in path
const patterns = [
  'app/api/**/[id]/route.ts',
  'app/api/**/[jobId]/route.ts',
  'app/jobs/[id]/**/*.tsx',
  'app/talent/jobs/[jobId]/**/*.tsx',
  'app/user/jobs/[jobId]/**/*.tsx',
];

patterns.forEach(pattern => {
  const files = glob.sync(pattern, { cwd: baseDir });
  
  files.forEach(file => {
    const filePath = path.join(baseDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if already has dynamic export
    if (!content.includes("export const dynamic = 'force-dynamic'")) {
      // Find first line after imports
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
      console.log(`✅ Added dynamic to: ${file}`);
    }
  });
});

console.log('\n✅ Done!');
