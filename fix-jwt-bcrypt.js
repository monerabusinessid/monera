const fs = require('fs');
const path = require('path');

const filesToFix = [
  'app/api/admin/companies/route.ts',
  'app/api/auth/reset-password/route.ts',
  'app/api/auth/verify/route.ts',
  'app/api/company/documents/route.ts',
  'app/api/company/documents/submit/route.ts',
  'app/api/user/onboarding-complete/route.ts',
  'app/api/user/state/route.ts',
];

filesToFix.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.log('⏭️  File not found:', filePath);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Replace jwt import
  if (content.includes("import jwt from 'jsonwebtoken'")) {
    content = content.replace("import jwt from 'jsonwebtoken'", "import { jwtVerify } from 'jose'");
    modified = true;
  }
  
  // Replace bcrypt import
  if (content.includes("import bcrypt from 'bcryptjs'")) {
    content = content.replace("import bcrypt from 'bcryptjs'", "import { verifyPassword, hashPassword } from '@/lib/auth'");
    modified = true;
  }
  
  // Replace jwt.verify calls
  if (content.includes('jwt.verify(')) {
    content = content.replace(/jwt\.verify\(([^,]+),\s*process\.env\.JWT_SECRET!\)/g, 
      'await jwtVerify($1, new TextEncoder().encode(process.env.JWT_SECRET!))');
    modified = true;
  }
  
  // Replace jwt.sign calls
  if (content.includes('jwt.sign(')) {
    content = content.replace(/jwt\.sign\(/g, 'await generateToken(');
    modified = true;
  }
  
  // Replace bcrypt.compare calls
  if (content.includes('bcrypt.compare(')) {
    content = content.replace(/bcrypt\.compare\(/g, 'await verifyPassword(');
    modified = true;
  }
  
  // Replace bcrypt.hash calls
  if (content.includes('bcrypt.hash(')) {
    content = content.replace(/bcrypt\.hash\(/g, 'await hashPassword(');
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ Fixed:', file);
  } else {
    console.log('⏭️  No changes needed:', file);
  }
});

console.log('\n✅ Done!');
