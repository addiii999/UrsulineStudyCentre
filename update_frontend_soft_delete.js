const fs = require('fs');
const path = require('path');

const sectionsDir = 'c:/Users/adity/Documents/GitHub Projects/UrsulineStudyCentre/src/components/sections';
const files = [
  'FacultySection.tsx',
  'ResultsSection.tsx',
  'TestimonialsSection.tsx',
  'YoutubeSection.tsx'
];

let updatedCount = 0;

for (const file of files) {
  const filePath = path.join(sectionsDir, file);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find .select("*") and append .eq("is_deleted", false) if it doesn't have it yet
  if (!content.includes('is_deleted", false')) {
    content = content.replace(/\.select\(['"]\*['"]\)/g, '.select("*")\n    .eq("is_deleted", false)');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated frontend: ' + file);
    updatedCount++;
  }
}

console.log('Total frontend sections updated: ' + updatedCount);
