const fs = require('fs');
const path = require('path');

// Warna brand
const brandColors = {
  'purple-500': 'brand-purple',
  'purple-600': 'brand-purple',
  'purple-700': 'purple-700', // Keep for gradients
  'purple-400': 'purple-400', // Keep for gradients
  'purple-800': 'purple-800', // Keep for gradients
};

// Directories to search
const directories = ['./app', './components', './lib'];

function replaceInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Replace purple-600 and purple-500 with brand-purple
    if (content.includes('purple-600') || content.includes('purple-500')) {
      content = content.replace(/purple-600/g, 'brand-purple');
      content = content.replace(/purple-500/g, 'brand-purple');
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

function walkDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules and .next
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        walkDir(filePath, fileList);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Process all files
console.log('Updating brand colors...\n');
directories.forEach(dir => {
  if (fs.existsSync(dir)) {
    const files = walkDir(dir);
    files.forEach(replaceInFile);
  }
});

console.log('\n✅ Brand color update complete!');
