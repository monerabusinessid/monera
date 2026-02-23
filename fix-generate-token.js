const fs = require('fs');
const path = require('path');

function fixGenerateToken(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      fixGenerateToken(filePath);
    } else if (file.endsWith('.ts')) {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      
      // Fix: const token = generateToken( -> const token = await generateToken(
      if (content.includes('= generateToken(') && !content.includes('= await generateToken(')) {
        content = content.replace(/= generateToken\(/g, '= await generateToken(');
        modified = true;
      }
      
      // Fix: const token = generateToken({ -> const token = await generateToken({
      if (content.includes('generateToken({') && !content.includes('await generateToken({')) {
        content = content.replace(/([^await\s])generateToken\({/g, '$1await generateToken({');
        modified = true;
      }
      
      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('✅ Fixed generateToken in:', filePath);
      }
    }
  });
}

const appDir = path.join(__dirname, 'app');
const libDir = path.join(__dirname, 'lib');

console.log('Fixing generateToken calls to be async...\n');
fixGenerateToken(appDir);
fixGenerateToken(libDir);
console.log('\n✅ Done!');
