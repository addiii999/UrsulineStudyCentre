import fs from 'fs';

const path = 'src/components/admin/AdminStorageManager.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove queue from tab type
content = content.replace(
  'const [tab,      setTab]      = useState<"overview" | "trash" | "queue" | "backup" | "audit">("overview");',
  'const [tab,      setTab]      = useState<"overview" | "trash" | "backup" | "audit">("overview");'
);

// 2. Remove from tabs UI
content = content.replace(
  '{ id: "queue",    label: "Deletion Queue", icon: <Clock size={13} /> },\n',
  ''
);
// In case the spacing was different:
content = content.replace(
  '          { id: "queue",    label: "Deletion Queue", icon: <Clock size={13} /> },\n',
  ''
);

// 3. Remove queue render block
const blockStart = '{/* ── DELETION QUEUE TAB ──────────────────────────────────── */}';
const blockEnd = '{/* ── BACKUP & EXPORT TAB ─────────────────────────────────── */}';
const startIndex = content.indexOf(blockStart);
const endIndex = content.indexOf(blockEnd);

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + content.substring(endIndex);
}

fs.writeFileSync(path, content, 'utf8');
console.log('DONE AdminStorageManager');
