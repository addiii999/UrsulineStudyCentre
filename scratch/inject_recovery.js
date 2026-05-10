import fs from 'fs';

const path = 'src/components/admin/AdminStudents.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add queue state
content = content.replace(
  'const [trashed, setTrashed] = useState<Student[]>([]);',
  'const [trashed, setTrashed] = useState<Student[]>([]);\n  const [queue, setQueue] = useState<any[]>([]);'
);

// 2. Add fetch logic
content = content.replace(
  '        fetch("/api/students?trashed=true"),\n      ]);',
  '        fetch("/api/students?trashed=true"),\n        fetch("/api/students/bulk"),\n      ]);'
);
content = content.replace(
  'const [activeData, trashData] = await Promise.all([activeRes.json(), trashRes.json()]);',
  'const [activeData, trashData, queueData] = await Promise.all([activeRes.json(), trashRes.json(), activeRes[2]?.json ? activeRes[2].json() : Promise.resolve({queue:[]})]);\n      // Wait, Promise.all returns an array of responses.\n      // activeRes is index 0, trashRes is 1, bulkRes is 2.'
);

// Let's rewrite the fetch logic properly
const fetchSearch = `  const fetchStudents = async () => {
    setLoading(true);
    try {
      const [activeRes, trashRes] = await Promise.all([
        fetch("/api/students"),
        fetch("/api/students?trashed=true"),
      ]);
      const [activeData, trashData] = await Promise.all([activeRes.json(), trashRes.json()]);
      if (activeData.students) setStudents(activeData.students);
      if (trashData.students) setTrashed(trashData.students);
      if (activeData.migrationNeeded || trashData.migrationNeeded) setMigrationNeeded(true);
    } catch { alert("Failed to load student records"); }
    finally { setLoading(false); }
  };`;

const fetchReplace = `  const fetchStudents = async () => {
    setLoading(true);
    try {
      const [activeRes, trashRes, queueRes] = await Promise.all([
        fetch("/api/students"),
        fetch("/api/students?trashed=true"),
        fetch("/api/students/bulk"),
      ]);
      const [activeData, trashData, queueData] = await Promise.all([activeRes.json(), trashRes.json(), queueRes.json()]);
      if (activeData.students) setStudents(activeData.students);
      if (trashData.students) setTrashed(trashData.students);
      if (queueData.queue) setQueue(queueData.queue);
      if (activeData.migrationNeeded || trashData.migrationNeeded) setMigrationNeeded(true);
    } catch { alert("Failed to load student records"); }
    finally { setLoading(false); }
  };`;
content = content.replace(fetchSearch, fetchReplace);

// 3. Rename view button
content = content.replace(
  '<Trash2 size={13} /> Trash {trashed.length > 0 && <span className="bg-rose-500 text-white text-[10px] rounded-full px-1.5">{trashed.length}</span>}',
  '<RotateCcw size={13} /> Recovery Manager {(trashed.length + queue.length) > 0 && <span className="bg-rose-500 text-white text-[10px] rounded-full px-1.5">{trashed.length + queue.length}</span>}'
);

// 4. Update the View logic mapping. We can map the arrays into unifiedRecords.
// Wait, I can inject a memo hook or just map it inside the render.
// I will just rewrite the `view === 'trash'` block.

const trashSearchStart = '{/* TRASH VIEW */}';
const trashSearchEnd = '      {/* BULK ACTION CONFIRMATION MODAL */}';

const startIndex = content.indexOf(trashSearchStart);
const endIndex = content.indexOf(trashSearchEnd);

if (startIndex === -1 || endIndex === -1) {
  console.log("MARKER NOT FOUND");
  process.exit(1);
}

const newTrashView = `{/* RECOVERY MANAGER VIEW */}
      {view === "trash" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
            <div className="flex items-center gap-2 flex-1">
              <RotateCcw size={14} className="text-[#800000]" />
              <span className="text-sm font-bold text-gray-700">Recovery Manager</span>
              <span className="text-xs text-gray-400">({trashed.length + queue.length} records)</span>
              {selectedIds.length > 0 && (
                <span className="ml-2 text-xs font-bold bg-[#800000] text-white px-2.5 py-0.5 rounded-full">{selectedIds.length} selected</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {selectedIds.length > 0 && (
                <button onClick={() => setSelectedIds([])} className="text-xs text-gray-400 hover:text-gray-600 font-medium">Clear</button>
              )}
              <button onClick={() => setBulkModal("restore")} disabled={selectedIds.length === 0}
                className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <RotateCcw size={11} /> Restore Selected
              </button>
              <button onClick={() => setBulkModal("delete")} disabled={selectedIds.length === 0}
                className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg hover:bg-rose-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <AlertTriangle size={11} /> Schedule Permanent Deletion
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden overflow-x-auto">
            <div className="px-5 py-2.5 border-b border-gray-100 bg-amber-50/60 flex items-center justify-between">
              <p className="text-xs text-amber-700 font-medium">Records are retained for 30 days before permanent automatic purge.</p>
            </div>
            <table className="w-full text-sm min-w-[850px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 w-10"></th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  {["Name", "Phone", "Class", "Archived On", "Auto-Purge", "Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={8} className="py-12 text-center text-gray-400"><Loader2 size={20} className="animate-spin mx-auto mb-2" />Loading...</td></tr>
                ) : (trashed.length + queue.length) === 0 ? (
                  <tr><td colSpan={8} className="py-12 text-center text-gray-400">No deleted records found</td></tr>
                ) : (
                  [
                    ...queue.map(q => ({
                      id: q.id, originalId: q.student_id, full_name: q.student_name, present_phone: q.student_phone,
                      present_class: q.student_class, course: "", deleted_at: q.deletion_requested_at,
                      scheduled_at: q.scheduled_deletion_at, isQueue: true, deleted_by: q.deleted_by
                    })),
                    ...trashed.filter(t => !queue.some(q => q.student_id === t.id)).map(t => {
                      // auto purge date defaults to +30 days from deleted_at
                      const sd = new Date(t.deleted_at || Date.now());
                      sd.setDate(sd.getDate() + 30);
                      return {
                        id: t.id, originalId: t.id, full_name: t.full_name, present_phone: t.present_phone,
                        present_class: t.present_class, course: t.course, deleted_at: t.deleted_at,
                        scheduled_at: sd.toISOString(), isQueue: false, deleted_by: t.deleted_by
                      };
                    })
                  ].sort((a, b) => new Date(b.deleted_at || 0).getTime() - new Date(a.deleted_at || 0).getTime())
                  .map((s: any) => {
                  const isSelected = selectedIds.includes(s.originalId);
                  const daysLeft = Math.max(0, Math.ceil((new Date(s.scheduled_at).getTime() - Date.now()) / 86400000));
                  const urgent = daysLeft <= 7;

                  return (
                    <tr key={s.id} className={\`transition-colors \${isSelected ? "bg-blue-50/60" : "hover:bg-gray-50/50"} \${urgent && s.isQueue ? "bg-rose-50/20" : ""}\`}>
                      <td className="px-4 py-3">
                        {!s.isQueue && (
                          <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(s.originalId)}
                            className="w-4 h-4 accent-[#800000] cursor-pointer rounded" />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={\`text-[10px] font-bold px-2 py-1 rounded-md \${s.isQueue ? "bg-rose-100 text-rose-700 border border-rose-200" : "bg-amber-100 text-amber-700 border border-amber-200"}\`}>
                          {s.isQueue ? "Scheduled for Purge" : "Recovery Available"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={\`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0 \${isSelected ? "bg-[#800000]" : "bg-gray-400"}\`}>{(s.full_name || "?")[0]}</div>
                          <p className="font-semibold text-gray-600">{s.full_name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{s.present_phone}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{s.present_class} {s.course ? "— " + s.course : ""}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {s.deleted_at ? new Date(s.deleted_at).toLocaleDateString() : "—"}<br/>
                        <span className="text-[10px]">by {s.deleted_by ?? "admin"}</span>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <span className={\`font-bold \${urgent ? "text-rose-600" : "text-gray-500"}\`}>{daysLeft} days left</span><br/>
                        <span className="text-[10px] text-gray-400">{new Date(s.scheduled_at).toLocaleDateString()}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {s.isQueue ? (
                            <button onClick={async () => {
                              setActionId(s.id);
                              try {
                                const res = await fetch("/api/students/bulk", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "restore_from_queue", ids: [s.id] }) });
                                if (!res.ok) throw new Error("Restore failed");
                                fetchStudents();
                              } catch (err: any) { alert(err.message); }
                              finally { setActionId(null); }
                            }} disabled={actionId === s.id} className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 disabled:opacity-50 transition-colors">
                              {actionId === s.id ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />} Restore
                            </button>
                          ) : (
                            <>
                              <button onClick={() => handleRestore(s.originalId)} disabled={actionId === s.originalId} className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 disabled:opacity-50 transition-colors">
                                {actionId === s.originalId ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />} Restore
                              </button>
                              <button onClick={() => handlePermanentDelete({id: s.originalId, full_name: s.full_name} as any)} disabled={actionId === s.originalId} className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg hover:bg-rose-100 disabled:opacity-50 transition-colors">
                                <AlertTriangle size={12} /> Schedule Purge
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      `;

content = content.substring(0, startIndex) + newTrashView + content.substring(endIndex);

fs.writeFileSync(path, content, 'utf8');
console.log('DONE AdminStudents');
