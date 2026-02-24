const fs = require('fs');
const path = require('path');

const routesToFix = [
  'app/admin/analytics/page.tsx',
  'app/admin/applications/page.tsx',
  'app/admin/audit-logs/page.tsx',
  'app/admin/dashboard/page.tsx',
  'app/admin/jobs/page.tsx',
  'app/admin/landing-page/page.tsx',
  'app/admin/settings/page.tsx',
  'app/admin/skills/page.tsx',
  'app/admin/talent-requests/page.tsx',
  'app/admin/talent-review/[id]/page.tsx',
  'app/admin/talent-review/page.tsx',
  'app/admin/test-roles/page.tsx',
  'app/admin/users/clients/page.tsx',
  'app/admin/users/talents/page.tsx',
  'app/admin/users/page.tsx',
  'app/admin/page.tsx',
  'app/blog/[id]/page.tsx',
  'app/client/applications/page.tsx',
  'app/client/find-talent/page.tsx',
  'app/client/help/page.tsx',
  'app/client/jobs/page.tsx',
  'app/client/messages/page.tsx',
  'app/client/onboarding/page.tsx',
  'app/client/post-job/page.tsx',
  'app/client/projects/page.tsx',
  'app/client/reports/spending/page.tsx',
  'app/client/reports/transactions/page.tsx',
  'app/client/reports/weekly/page.tsx',
  'app/client/request-talent/page.tsx',
  'app/client/settings/page.tsx',
  'app/client/talent-requests/page.tsx',
  'app/client/page.tsx',
  'app/jobs/[id]/edit/page.tsx',
  'app/jobs/[id]/page.tsx',
  'app/talent/jobs/[jobId]/page.tsx',
  'app/user/applications/page.tsx',
  'app/user/jobs/[jobId]/page.tsx',
  'app/user/jobs/page.tsx',
  'app/user/onboarding/page.tsx',
  'app/user/profile/page.tsx',
  'app/user/status/page.tsx',
];

let fixed = 0;
let skipped = 0;

routesToFix.forEach(route => {
  const filePath = path.join(__dirname, route);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skip: ${route} (not found)`);
    skipped++;
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if already has runtime export
  if (content.includes("export const runtime = 'edge'") || content.includes('export const runtime = "edge"')) {
    console.log(`✓ Skip: ${route} (already has edge runtime)`);
    skipped++;
    return;
  }
  
  // Add edge runtime at the top after imports
  const lines = content.split('\n');
  let insertIndex = 0;
  
  // Find last import or 'use client'
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('import ') || lines[i].includes("'use client'") || lines[i].includes('"use client"')) {
      insertIndex = i + 1;
    }
  }
  
  // Insert edge runtime
  lines.splice(insertIndex, 0, "export const runtime = 'edge'");
  
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
  console.log(`✅ Fixed: ${route}`);
  fixed++;
});

console.log(`\n✅ Fixed: ${fixed} files`);
console.log(`⚠️  Skipped: ${skipped} files`);
