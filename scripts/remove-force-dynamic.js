const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const baseDir = path.join(__dirname, '..');

// Find all files with 'export const dynamic'
try {
  const result = execSync('git grep -l "export const dynamic" -- "*.ts" "*.tsx"', { 
    cwd: baseDir,
    encoding: 'utf8' 
  });
  
  const files = result.trim().split('\n').filter(Boolean);
  
  files.forEach(file => {
    const filePath = path.join(baseDir, file);
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Remove all dynamic exports
      content = content.replace(/\nexport const dynamic = ['"]force-dynamic['"]\n/g, '\n');
      content = content.replace(/export const dynamic = ['"]force-dynamic['"]\n/g, '');
      content = content.replace(/\nexport const dynamic = ['"]force-dynamic['"];?\n/g, '\n');
      content = content.replace(/export const dynamic = ['"]force-dynamic['"];?\n/g, '');
      
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Removed force-dynamic from: ${file}`);
    }
  });
  
  console.log('\n✅ Done! All force-dynamic exports removed.');
} catch (error) {
  console.log('No files with "export const dynamic" found or error:', error.message);
}
