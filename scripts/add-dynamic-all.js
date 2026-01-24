const fs = require('fs');
const path = require('path');

function addDynamicExport(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Skip if already has dynamic export
  if (content.includes("export const dynamic = 'force-dynamic'") || 
      content.includes('export const dynamic = "force-dynamic"')) {
    return false;
  }
  
  // Find position after imports
  const lines = content.split('\n');
  let insertIndex = 0;
  let foundImport = false;
  
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith('import ') || trimmed.startsWith('import{')) {
      foundImport = true;
      insertIndex = i + 1;
    } else if (foundImport && (trimmed === '' || trimmed.startsWith('export') || trimmed.startsWith('const') || trimmed.startsWith('function'))) {
      insertIndex = i;
      break;
    }
  }
  
  // Insert dynamic export
  if (lines[insertIndex]?.trim() === '') {
    lines[insertIndex] = "export const dynamic = 'force-dynamic'";
  } else {
    lines.splice(insertIndex, 0, '', "export const dynamic = 'force-dynamic'");
  }
  
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
  return true;
}

function processDirectory(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    
    if (item.isDirectory()) {
      processDirectory(fullPath);
    } else if (item.name === 'route.ts' || item.name === 'route.tsx') {
      if (addDynamicExport(fullPath)) {
        console.log(`✅ ${fullPath.replace(process.cwd() + path.sep, '')}`);
      }
    }
  }
}

// Process all API routes
const apiDir = path.join(process.cwd(), 'app', 'api');
if (fs.existsSync(apiDir)) {
  console.log('Processing API routes...\n');
  processDirectory(apiDir);
}

// Process dynamic page routes
const dynamicPages = [
  'app/jobs/[id]/page.tsx',
  'app/jobs/[id]/edit/page.tsx',
  'app/talent/jobs/[jobId]/page.tsx',
  'app/user/jobs/[jobId]/page.tsx',
];

console.log('\nProcessing dynamic pages...\n');
dynamicPages.forEach(pagePath => {
  const fullPath = path.join(process.cwd(), pagePath);
  if (fs.existsSync(fullPath)) {
    if (addDynamicExport(fullPath)) {
      console.log(`✅ ${pagePath}`);
    }
  }
});

console.log('\n✅ Done! All routes updated.');
