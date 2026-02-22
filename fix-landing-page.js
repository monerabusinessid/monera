const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

console.log('🔧 Applying landing page improvements...\n');

// 1. Simplify spacing
content = content.replace(/py-16 md:py-20/g, 'py-20');
content = content.replace(/py-16/g, 'py-20');
content = content.replace(/pb-16 md:pb-20/g, 'pb-20');
content = content.replace(/pt-44 sm:pt-40 md:pt-40/g, 'pt-40');

// 2. Remove rounded corners from sections (except hero)
content = content.replace(/rounded-t-\[3rem\] -mt-8 relative z-10/g, '');
content = content.replace(/rounded-t-\[3rem\] -mt-8/g, '');

// 3. Simplify backgrounds
content = content.replace(/bg-gradient-to-b from-white to-purple-50\/30/g, 'bg-white');
content = content.replace(/bg-gradient-to-br from-purple-50 via-yellow-50\/20 to-purple-50\/30/g, 'bg-[#F9F7FC]');
content = content.replace(/bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900/g, 'bg-brand-purple');
content = content.replace(/bg-gradient-to-b from-gray-50 to-purple-50\/30/g, 'bg-white');
content = content.replace(/bg-gradient-to-b from-white to-purple-50\/20/g, 'bg-[#F9F7FC]');
content = content.replace(/bg-gradient-to-br from-purple-50\/50 via-white to-yellow-50\/20/g, 'bg-white');
content = content.replace(/bg-gradient-to-b from-white to-gray-50/g, 'bg-[#F9F7FC]');
content = content.replace(/bg-gradient-to-br from-brand-purple via-purple-700 to-indigo-800/g, 'bg-brand-purple');
content = content.replace(/bg-gray-900/g, 'bg-brand-purple');

// 4. Unify card borders
content = content.replace(/border-2 border-gray-200/g, 'border border-gray-200');
content = content.replace(/border-0/g, 'border border-gray-200');

// 5. Standardize border radius
content = content.replace(/rounded-2xl/g, 'rounded-xl');
content = content.replace(/rounded-3xl/g, 'rounded-xl');

// 6. Simplify hero background
content = content.replace(
  /bg-gradient-to-br from-brand-purple via-purple-900 to-indigo-950/g,
  'bg-brand-purple'
);

// Write back
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Spacing standardized (py-20)');
console.log('✅ Rounded corners removed from sections');
console.log('✅ Backgrounds simplified (3 colors only)');
console.log('✅ Card borders unified');
console.log('✅ Border radius standardized (rounded-xl)');
console.log('\n🎉 Landing page improvements applied successfully!');
console.log('\n📝 Check LANDING_PAGE_IMPROVEMENTS.md for details');
