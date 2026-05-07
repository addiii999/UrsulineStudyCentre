const fs = require('fs');
const path = require('path');

const apiDir = 'c:/Users/adity/Documents/GitHub Projects/UrsulineStudyCentre/src/app/api';
const routes = [
  'videos/route.ts',
  'testimonials/route.ts',
  'results/route.ts',
  'gallery/route.ts',
  'faqs/route.ts',
  'faculty/route.ts',
  'enquiry/admin/route.ts',
  'courses/route.ts',
  'announcements/route.ts'
];

let updatedCount = 0;

for (const route of routes) {
  const filePath = path.join(apiDir, route);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 1. Replace hard delete with soft delete
  if (content.includes('.delete().eq(')) {
    content = content.replace(/\.delete\(\)\.eq\(/g, '.update({ is_deleted: true, deleted_at: new Date().toISOString() }).eq(');
    
    // 2. Add logAudit import if not exists
    if (!content.includes('import { logAudit }')) {
      content = 'import { logAudit } from "@/lib/audit";\n' + content;
    }
    
    // 3. Inject logAudit call right before returning success
    const tableNameMatch = content.match(/from\(['"]([^'"]+)['"]\)\.update/);
    const tableName = tableNameMatch ? tableNameMatch[1] : 'unknown';
    
    content = content.replace(
      /return NextResponse\.json\(\{ success: true \}\);/g, 
      `logAudit({ action: "soft_delete", table_name: "${tableName}", item_id: id }).catch(() => {});\n    return NextResponse.json({ success: true });`
    );

    // 4. Update GET request to filter is_deleted = false
    if (!content.includes('is_deleted", false')) {
      content = content.replace(/\.select\(['"]\*['"]\)/g, '.select("*").eq("is_deleted", false)');
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated: ' + route);
    updatedCount++;
  }
}

console.log('Total API routes updated: ' + updatedCount);
