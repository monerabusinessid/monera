const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..');

const routes = [
  'app/admin/layout.tsx',
  'app/client/layout.tsx',
  'app/user/layout.tsx',
  'app/api/admin/jobs/route.ts',
  'app/api/admin/stats/applications/route.ts',
  'app/api/admin/stats/companies/route.ts',
  'app/api/admin/stats/jobs/route.ts',
  'app/api/admin/stats/talent-requests/route.ts',
  'app/api/admin/stats/users/route.ts',
  'app/api/admin/users/route.ts',
  'app/api/applications/route.ts',
  'app/api/applications/[id]/route.ts',
  'app/api/auth/forgot-password/route.ts',
  'app/api/auth/login/route.ts',
  'app/api/auth/logout/route.ts',
  'app/api/auth/me/route.ts',
  'app/api/auth/register/route.ts',
  'app/api/auth/resend-code/route.ts',
  'app/api/auth/resend-verification/route.ts',
  'app/api/auth/reset-password/route.ts',
  'app/api/auth/set-cookie/route.ts',
  'app/api/auth/verify-email/route.ts',
  'app/api/candidate/jobs/best-match/route.ts',
  'app/api/candidate/profile/check/route.ts',
  'app/api/client/profile/setup/route.ts',
  'app/api/companies/route.ts',
  'app/api/companies/[id]/route.ts',
  'app/api/csrf-token/route.ts',
  'app/api/jobs/route.ts',
  'app/api/jobs/[id]/route.ts',
  'app/api/jobs/[id]/publish/route.ts',
  'app/api/landing/companies/route.ts',
  'app/api/landing/faqs/route.ts',
  'app/api/landing/talent-categories/route.ts',
  'app/api/landing/testimonials/route.ts',
  'app/api/landing/upload-image/route.ts',
  'app/api/messages/route.ts',
  'app/api/notifications/route.ts',
  'app/api/notifications/[id]/route.ts',
  'app/api/profile/candidate/route.ts',
  'app/api/profile/recruiter/route.ts',
  'app/api/request-talent/route.ts',
  'app/api/skills/route.ts',
  'app/api/talent-requests/route.ts',
  'app/api/talent-requests/[id]/route.ts',
  'app/api/user/avatar/upload/route.ts',
  'app/api/user/profile/experience/route.ts',
  'app/api/user/profile/submit/route.ts',
  'app/api/user/profile/update/route.ts',
  'app/api/user/profile/video/route.ts',
  'app/api/user/upload-video/route.ts',
];

routes.forEach(route => {
  const filePath = path.join(baseDir, route);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove edge runtime export
    content = content.replace(/\nexport const runtime = ['"]edge['"]\n/g, '\n');
    content = content.replace(/export const runtime = ['"]edge['"]\n/g, '');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Removed edge runtime from: ${route}`);
  }
});

console.log('\n✅ Done! All edge runtime exports removed.');
