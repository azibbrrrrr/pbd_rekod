'use client';

import { useState, useEffect, useRef, useCallback } from "react";
import { parseCSV, validateStudentCSVFormat, validateCurriculumCSVFormat } from "@/lib/utils";
import { Icons } from "@/components/ui/Icons";
import EditableStudentTable from "@/components/ui/EditableStudentTable";
import EditableCurriculumTable from "@/components/ui/EditableCurriculumTable";

// ─── helpers ────────────────────────────────────────────────────────────────
function readFile(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = e => res(e.target.result);
    r.onerror = () => rej(new Error("Gagal membaca fail"));
    r.readAsText(file, "UTF-8");
  });
}

function excelCellToString(v) {
  if (v == null) return "";
  if (typeof v === "string") return v.trim();
  if (typeof v === "number") return String(v);
  if (v instanceof Date) return v.toISOString().split("T")[0];
  if (typeof v === "object") {
    if (v.richText) return v.richText.map(r => r.text).join("").trim();
    if (v.text != null) return String(v.text).trim();
    if (v.result != null) return String(v.result).trim();
  }
  return String(v).trim();
}

async function readXLSXFile(file) {
  const mod = await import("exceljs/dist/exceljs.min.js");
  const ExcelJS = mod.default || mod;
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(await file.arrayBuffer());
  const ws = wb.worksheets[0];
  if (!ws) return { headers: [], rows: [] };
  const rawRows = [];
  ws.eachRow({ includeEmpty: false }, row => {
    rawRows.push(row.values.slice(1).map(excelCellToString));
  });
  if (rawRows.length < 2) return { headers: [], rows: [] };
  const headers = rawRows[0];
  const rows = rawRows.slice(1).map(cols => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = cols[i] || ""; });
    return obj;
  }).filter(row => Object.values(row).some(v => v !== ""));
  return { headers, rows };
}

function Modal({ title, children, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle"/>
        <div className="modal-title">{title}</div>
        {children}
      </div>
    </div>
  );
}

// Group students into per-class row maps { classId: [{_id, full_name, _status}] }
function buildClassRows(students) {
  const map = {};
  students.forEach(s => {
    if (!map[s.class_id]) map[s.class_id] = [];
    map[s.class_id].push({ _id: s.id, full_name: s.full_name, _status: "saved" });
  });
  return map;
}

// Convert curriculum items into editable rows
function curriculumToRows(items) {
  return items.map(item => ({
    _id: item.id,
    tema: item.tema,
    tajuk: item.tajuk || "",
    _status: "saved",
  }));
}

const normClass = (s) => s.trim().toLowerCase();

const TEMP_PREFIX = "__new__";
const tempId = (name) => `${TEMP_PREFIX}${normClass(name)}`;

// ─── STUDENTS SECTION ────────────────────────────────────────────────────────
function StudentsSection({
  students, classes,
  createClass, deleteClass, deleteAllClasses,
  addStudent, deleteStudent, deleteStudents,
  importStudents,
  onBack,
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [addClassModal, setAddClassModal] = useState(false);
  const [newClassName, setNewClassName] = useState("");

  // Per-class rows: { classId | tempId → [{_id?, full_name, _status}] }
  const [rowsByClass, setRowsByClass] = useState(() => buildClassRows(students));
  const [originalByClass, setOriginalByClass] = useState(() => buildClassRows(students));

  // Pending classes: new classes from CSV not yet in DB { tempId → displayName }
  const [pendingClasses, setPendingClasses] = useState({});

  // Active tab — real class id or tempId
  const [activeClassId, setActiveClassId] = useState(() => classes[0]?.id || null);

  // All tabs = real classes + pending classes
  const allTabs = [
    ...classes,
    ...Object.entries(pendingClasses).map(([id, name]) => ({ id, name, isPending: true })),
  ];

  // Re-sync when students change (NOT when classes change — avoids wiping pending tabs)
  useEffect(() => {
    const fresh = buildClassRows(students);
    setRowsByClass(prev => {
      // Preserve pending tab rows; only reset real class rows
      const pending = Object.fromEntries(
        Object.entries(prev).filter(([id]) => id.startsWith(TEMP_PREFIX))
      );
      return { ...fresh, ...pending };
    });
    setOriginalByClass(prev => {
      const pending = Object.fromEntries(
        Object.entries(prev).filter(([id]) => id.startsWith(TEMP_PREFIX))
      );
      return { ...fresh, ...pending };
    });
    // Set initial active tab if none selected
    setActiveClassId(prev => prev ?? (classes[0]?.id || null));
  }, [students]);

  const activeRows = rowsByClass[activeClassId] || [];
  const activeOriginal = originalByClass[activeClassId] || [];
  const isDirty = activeClassId && (
    activeRows.length !== activeOriginal.length ||
    activeRows.some((r, i) => r._id !== activeOriginal[i]._id || r.full_name !== activeOriginal[i].full_name)
  );

  const wrap = async (fn) => {
    setBusy(true); setErr("");
    try { await fn(); }
    catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  };

  const handleUndo = () => setRowsByClass(prev => ({ ...prev, [activeClassId]: activeOriginal }));

  // Save active class tab
  const handleSave = () => wrap(async () => {
    const validRows = activeRows.filter(r => r.full_name?.trim());

    // Resolve class ID — create if pending
    let classId = activeClassId;
    if (activeClassId.startsWith(TEMP_PREFIX)) {
      const name = pendingClasses[activeClassId];
      const cls = await createClass(name);
      classId = cls.id;
      // Promote temp → real
      setRowsByClass(prev => {
        const next = { ...prev, [cls.id]: prev[activeClassId] };
        delete next[activeClassId];
        return next;
      });
      setOriginalByClass(prev => {
        const next = { ...prev, [cls.id]: [] };
        delete next[activeClassId];
        return next;
      });
      setPendingClasses(prev => {
        const next = { ...prev };
        delete next[activeClassId];
        return next;
      });
      setActiveClassId(cls.id);
    }

    // Deleted students
    const currentIds = new Set(validRows.filter(r => r._id).map(r => r._id));
    const deletedIds = activeOriginal.filter(r => r._id && !currentIds.has(r._id)).map(r => r._id);
    if (deletedIds.length > 0) await deleteStudents(deletedIds);

    // New students
    const newNames = validRows.filter(r => !r._id).map(r => r.full_name.trim());
    if (newNames.length > 0) await importStudents(classId, newNames);

    setOriginalByClass(prev => ({ ...prev, [classId]: validRows }));
  });

  // CSV import: KELAS + NAMA MURID — distributes rows to correct tabs
  const handleImportCSV = async (file) => {
    try {
      setErr("");
      const text = await readFile(file);
      const { headers, rows: csvRows } = parseCSV(text);
      const check = validateStudentCSVFormat(headers, { requireClass: true });
      if (!check.valid) { setErr(check.error); return; }

      const imported = csvRows
        .map(r => ({
          className: (r[check.columns.kelas] || "").trim().toUpperCase(),
          full_name: (r[check.columns.nama] || "").trim().toUpperCase(),
        }))
        .filter(r => r.className && r.full_name);

      // Group by class name
      const byClass = new Map();
      imported.forEach(({ className, full_name }) => {
        const key = normClass(className);
        if (!byClass.has(key)) byClass.set(key, { displayName: className, names: [] });
        byClass.get(key).names.push(full_name);
      });

      const newRowsByClass = {};
      const newPending = {};

      byClass.forEach(({ displayName, names }, key) => {
        const existingCls = classes.find(c => normClass(c.name) === key);
        const id = existingCls
          ? existingCls.id
          : tempId(displayName);
        if (!existingCls) newPending[id] = displayName;
        newRowsByClass[id] = [
          ...(rowsByClass[id] || []),
          ...names.map(n => ({ full_name: n, _status: "added" })),
        ];
      });

      if (!byClass.size) return;

      setRowsByClass(prev => ({ ...prev, ...newRowsByClass }));
      setPendingClasses(prev => ({ ...prev, ...newPending }));

      // Switch to first imported class tab
      const [[firstKey, firstEntry]] = byClass.entries();
      const firstExisting = classes.find(c => normClass(c.name) === firstKey);
      const firstId = firstExisting ? firstExisting.id : tempId(firstEntry.displayName);
      setActiveClassId(firstId);
    } catch (e) { setErr(e.message); }
  };

  // Add new class immediately (real DB call)
  const handleAddClass = () => wrap(async () => {
    const name = newClassName.trim();
    if (!name) return;
    if (classes.some(c => normClass(c.name) === normClass(name)))
      throw new Error(`Kelas "${name}" sudah wujud.`);
    if (Object.values(pendingClasses).some(n => normClass(n) === normClass(name)))
      throw new Error(`Kelas "${name}" sudah wujud (belum disimpan).`);
    const cls = await createClass(name);
    setRowsByClass(prev => ({ ...prev, [cls.id]: [] }));
    setOriginalByClass(prev => ({ ...prev, [cls.id]: [] }));
    setActiveClassId(cls.id);
    setAddClassModal(false);
    setNewClassName("");
  });

  // Delete active class
  const handleDeleteClass = () => wrap(async () => {
    const id = confirmDelete.id;
    if (id.startsWith(TEMP_PREFIX)) {
      // Pending tab — just remove locally
      setPendingClasses(prev => { const n = { ...prev }; delete n[id]; return n; });
      setRowsByClass(prev => { const n = { ...prev }; delete n[id]; return n; });
      setOriginalByClass(prev => { const n = { ...prev }; delete n[id]; return n; });
    } else {
      await deleteClass(id);
    }
    const remaining = allTabs.filter(t => t.id !== id);
    setActiveClassId(remaining[0]?.id || null);
    setConfirmDelete(null);
  });

  // Delete all classes
  const handleDeleteAll = () => wrap(async () => {
    await deleteAllClasses();
    setPendingClasses({});
    setRowsByClass({});
    setOriginalByClass({});
    setActiveClassId(null);
    setConfirmDelete(null);
  });

  const csvRef = useRef();
  const activeTabName = allTabs.find(t => t.id === activeClassId)?.name || "";

  return (
    <div className="screen" style={{ paddingBottom: 20 }}>
      {/* Sticky header */}
      <div className="header-bar sticky-top">
        <button className="header-back" onClick={onBack}><Icons.back/></button>
        <div className="header-info">
          <div className="header-line1">Murid &amp; Kelas</div>
          <div className="header-line2">{students.length} murid · {allTabs.length} kelas</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {isDirty && (
            <button className="btn btn-ghost btn-sm" style={{ fontSize: 12 }} onClick={handleUndo} disabled={busy}>↩ Batal</button>
          )}
          {activeClassId && (
            <button className="btn btn-primary btn-sm"
              style={{ background: isDirty ? undefined : "var(--muted)", opacity: isDirty ? 1 : 0.5, cursor: isDirty ? "pointer" : "default" }}
              onClick={isDirty ? handleSave : undefined} disabled={busy || !isDirty}>
              {busy ? "Menyimpan…" : "💾 Simpan"}
            </button>
          )}
          <button className="btn btn-secondary btn-sm" onClick={() => { setErr(""); setAddClassModal(true); }}>+ Kelas</button>
        </div>
      </div>

      <div style={{ padding: "0 16px 16px" }}>
        {/* Class tabs */}
        {allTabs.length > 0 && (
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 8 }}>
            {allTabs.map(tab => (
              <button key={tab.id}
                onClick={() => setActiveClassId(tab.id)}
                style={{
                  flexShrink: 0, padding: "6px 14px", borderRadius: 20,
                  fontSize: 12, fontWeight: 700, cursor: "pointer",
                  border: activeClassId === tab.id ? "2px solid var(--strawberry)" : "2px solid var(--border)",
                  background: activeClassId === tab.id ? "var(--strawberry-pale)" : "var(--bg-subtle)",
                  color: activeClassId === tab.id ? "var(--strawberry)" : "var(--charcoal)",
                }}>
                {tab.name}{tab.isPending ? " *" : ""}
              </button>
            ))}
          </div>
        )}

        {activeClassId && (
          <>
            {/* CSV import + delete class strip */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => csvRef.current?.click()}>⬆ Import CSV</button>
              <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, flex: 1 }}>Format: KELAS, NAMA MURID</span>
              <button className="btn btn-ghost btn-sm" style={{ color: "var(--strawberry)", fontSize: 11 }}
                onClick={() => setConfirmDelete({ id: activeClassId, label: `kelas "${activeTabName}"` })}>
                🗑 Padam Kelas
              </button>
              <input ref={csvRef} type="file" accept=".csv,.txt" style={{ display: "none" }}
                onChange={e => { handleImportCSV(e.target.files[0]); e.target.value = ""; }}/>
            </div>

            {err && <div style={{ fontSize: 12, color: "var(--strawberry)", fontWeight: 700, marginBottom: 8 }}>⚠ {err}</div>}

            <EditableStudentTable rows={activeRows} onChange={next => setRowsByClass(prev => ({ ...prev, [activeClassId]: next }))}/>

            {isDirty && (
              <div style={{ marginTop: 12, padding: "10px 14px", background: "var(--matcha-pale)", borderRadius: 10, fontSize: 12, fontWeight: 700, color: "var(--matcha-dark)" }}>
                ✏ Ada perubahan yang belum disimpan. Tekan Simpan untuk mengemaskini data.
              </div>
            )}
          </>
        )}

        {allTabs.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">👨‍🎓</div>
            <div className="empty-text">Tiada kelas. Tambah kelas baru atau import CSV.</div>
          </div>
        )}

        {/* Delete all shortcut (only shown when no active class selected and classes exist) */}
        {allTabs.length > 0 && (
          <div style={{ marginTop: 16, textAlign: "center" }}>
            <button className="btn btn-ghost btn-sm" style={{ color: "var(--strawberry)", fontSize: 11 }}
              onClick={() => setConfirmDelete({ id: "__all__", label: "SEMUA KELAS" })}>
              🗑 Padam Semua Kelas
            </button>
          </div>
        )}
      </div>

      {/* Add class modal */}
      {addClassModal && (
        <Modal title="Tambah Kelas Baru" onClose={() => { setAddClassModal(false); setNewClassName(""); setErr(""); }}>
          <input className="field-input" style={{ marginBottom: 12 }} placeholder="Nama kelas (cth. 3 AMETHYST)"
            value={newClassName} onChange={e => setNewClassName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAddClass()}/>
          {err && <div style={{ fontSize: 12, color: "var(--strawberry)", fontWeight: 700, marginBottom: 8 }}>⚠ {err}</div>}
          <button className="btn btn-primary btn-full"
            disabled={busy || !newClassName.trim()}
            onClick={handleAddClass}>
            {busy ? "Menyimpan…" : "Tambah Kelas"}
          </button>
        </Modal>
      )}

      {/* Delete confirm modal */}
      {confirmDelete && (
        <Modal title={`Padam ${confirmDelete.label}?`} onClose={() => setConfirmDelete(null)}>
          <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600, marginBottom: 12 }}>
            {confirmDelete.id === "__all__"
              ? "Semua kelas dan murid akan dipadam. Tindakan ini tidak boleh dibatalkan."
              : "Semua murid dalam kelas ini juga akan dipadam. Tindakan ini tidak boleh dibatalkan."}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-primary btn-full" style={{ background: "var(--strawberry)" }} disabled={busy}
              onClick={confirmDelete.id === "__all__" ? handleDeleteAll : handleDeleteClass}>
              {busy ? "Memadam…" : "Ya, Padam"}
            </button>
            <button className="btn btn-ghost btn-full" onClick={() => setConfirmDelete(null)}>Batal</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── CURRICULUM SECTION ────────────────────────────────────────────────────────
function CurriculumSection({
  curriculum, curriculumSets,
  importCurriculum, updateCurriculumSet, deleteCurriculumSet,
  onBack,
}) {
  const sets = curriculumSets;

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [activeSetId, setActiveSetId] = useState(sets[0]?.id || null);
  const [addSetModal, setAddSetModal] = useState(false);
  const [newSetName, setNewSetName] = useState("");
  const [addSetMode, setAddSetMode] = useState("manual"); // "manual" | "import"
  const [pendingImport, setPendingImport] = useState(null); // null | { items: [] }
  const importSetFileRef = useRef();

  // Per-set editable rows state
  const buildSetRows = useCallback(() => {
    const map = {};
    sets.forEach(s => {
      const items = curriculum.filter(c => c.set_id === s.id);
      map[s.id] = curriculumToRows(items);
    });
    return map;
  }, [curriculum]);

  const [rowsBySet, setRowsBySet] = useState(buildSetRows);
  const [originalBySet, setOriginalBySet] = useState(buildSetRows);

  useEffect(() => {
    const fresh = buildSetRows();
    setRowsBySet(fresh);
    setOriginalBySet(fresh);
    if (!activeSetId && sets.length > 0) setActiveSetId(sets[0].id);
  }, [curriculum]);

  const activeRows = rowsBySet[activeSetId] || [];
  const activeOriginal = originalBySet[activeSetId] || [];
  const isDirty = activeSetId && JSON.stringify(activeRows) !== JSON.stringify(activeOriginal);

  const wrap = async (fn) => {
    setBusy(true); setErr("");
    try { await fn(); }
    catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  };

  const handleUndo = () => {
    setRowsBySet(prev => ({ ...prev, [activeSetId]: activeOriginal }));
  };

  const handleSave = () => wrap(async () => {
    const validRows = activeRows.filter(r => r.tema?.trim() && r.tajuk?.trim());
    await updateCurriculumSet(activeSetId, validRows);
    setOriginalBySet(prev => ({ ...prev, [activeSetId]: activeRows }));
  });

  const handleImportCSV = async (file) => {
    try {
      const text = await readFile(file);
      const { headers, rows: csvRows } = parseCSV(text);
      const check = validateCurriculumCSVFormat(headers);
      if (!check.valid) { setErr(check.error); return; }
      const imported = csvRows.map(r => ({
        tema: (r[check.columns.tema] || "").trim(),
        tajuk: (r[check.columns.tajuk] || "").trim(),
        _status: "added",
      })).filter(r => r.tema && r.tajuk);
      setRowsBySet(prev => ({ ...prev, [activeSetId]: [...(prev[activeSetId] || []), ...imported] }));
    } catch (e) { setErr(e.message); }
  };

  const handleImportSetFile = async (file) => {
    if (!file) return;
    setErr("");
    try {
      let headers, rows;
      if (/\.xlsx?$/i.test(file.name)) {
        ({ headers, rows } = await readXLSXFile(file));
      } else {
        const text = await readFile(file);
        ({ headers, rows } = parseCSV(text));
      }
      const check = validateCurriculumCSVFormat(headers);
      if (!check.valid) { setErr(check.error); setPendingImport(null); return; }
      const items = rows.map(r => ({
        tema: (r[check.columns.tema] || "").trim(),
        tajuk: (r[check.columns.tajuk] || "").trim(),
      })).filter(r => r.tema && r.tajuk);
      if (items.length === 0) { setErr("Tiada data sah ditemui dalam fail."); setPendingImport(null); return; }
      setPendingImport({ items });
    } catch (e) { setErr(e.message); setPendingImport(null); }
  };

  const closeAddSetModal = () => {
    setAddSetModal(false);
    setAddSetMode("manual");
    setPendingImport(null);
    setNewSetName("");
    setErr("");
  };

  const handleAddSet = () => wrap(async () => {
    if (!newSetName.trim()) return;
    const items = addSetMode === "import" ? (pendingImport?.items || []) : [];
    const result = await importCurriculum(newSetName.trim(), items);
    // Activate the new set tab
    setActiveSetId(result.setId);
    // For empty sets, curriculum didn't change so the effect won't fire — seed rowsBySet manually
    if (result.items.length === 0) {
      setRowsBySet(prev => ({ ...prev, [result.setId]: [] }));
      setOriginalBySet(prev => ({ ...prev, [result.setId]: [] }));
    }
    closeAddSetModal();
  });

  const handleDeleteSet = () => wrap(async () => {
    await deleteCurriculumSet(confirmDelete.id);
    if (activeSetId === confirmDelete.id) setActiveSetId(sets.filter(s => s.id !== confirmDelete.id)[0]?.id || null);
    setConfirmDelete(null);
  });

  const csvRef = useRef();

  return (
    <div className="screen" style={{ paddingBottom: 20 }}>
      {/* Sticky header */}
      <div className="header-bar sticky-top">
        <button className="header-back" onClick={onBack}><Icons.back/></button>
        <div className="header-info">
          <div className="header-line1">Set Kurikulum</div>
          <div className="header-line2">{sets.length} set · {curriculum.length} tajuk</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {isDirty && (
            <button className="btn btn-ghost btn-sm" style={{ fontSize: 12 }} onClick={handleUndo} disabled={busy}>↩ Batal</button>
          )}
          {activeSetId && (
            <button className="btn btn-primary btn-sm"
              style={{ background: isDirty ? undefined : "var(--muted)", opacity: isDirty ? 1 : 0.5, cursor: isDirty ? "pointer" : "default" }}
              onClick={isDirty ? handleSave : undefined} disabled={busy || !isDirty}>
              {busy ? "Menyimpan…" : "💾 Simpan"}
            </button>
          )}
          <button className="btn btn-secondary btn-sm" onClick={() => setAddSetModal(true)}>+ Set</button>
        </div>
      </div>

      <div style={{ padding: "0 16px 16px" }}>
        {/* Set tabs */}
        {sets.length > 0 && (
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 8 }}>
            {sets.map(s => (
              <button key={s.id}
                onClick={() => setActiveSetId(s.id)}
                style={{
                  flexShrink: 0, padding: "6px 14px", borderRadius: 20,
                  fontSize: 12, fontWeight: 700, cursor: "pointer",
                  border: activeSetId === s.id ? "2px solid var(--strawberry)" : "2px solid var(--border)",
                  background: activeSetId === s.id ? "var(--strawberry-pale)" : "var(--bg-subtle)",
                  color: activeSetId === s.id ? "var(--strawberry)" : "var(--charcoal)",
                }}>
                {s.name}
              </button>
            ))}
          </div>
        )}

        {activeSetId && (
          <>
            {/* CSV import + delete set strip */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => csvRef.current?.click()}>⬆ Import CSV</button>
              <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, flex: 1 }}>Format: TEMA, TAJUK</span>
              <button className="btn btn-ghost btn-sm" style={{ color: "var(--strawberry)", fontSize: 11 }}
                onClick={() => setConfirmDelete({ id: activeSetId, label: `set "${sets.find(s => s.id === activeSetId)?.name}"` })}>
                🗑 Padam Set
              </button>
              <input ref={csvRef} type="file" accept=".csv,.txt" style={{ display: "none" }}
                onChange={e => { handleImportCSV(e.target.files[0]); e.target.value = ""; }}/>
            </div>

            {err && <div style={{ fontSize: 12, color: "var(--strawberry)", fontWeight: 700, marginBottom: 8 }}>⚠ {err}</div>}

            <EditableCurriculumTable rows={activeRows} onChange={next => setRowsBySet(prev => ({ ...prev, [activeSetId]: next }))}/>

            {isDirty && (
              <div style={{ marginTop: 12, padding: "10px 14px", background: "var(--matcha-pale)", borderRadius: 10, fontSize: 12, fontWeight: 700, color: "var(--matcha-dark)" }}>
                ✏ Ada perubahan yang belum disimpan. Tekan Simpan untuk mengemaskini data.
              </div>
            )}
          </>
        )}

        {sets.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <div className="empty-text">Tiada set kurikulum. Tambah set baru.</div>
          </div>
        )}
      </div>

      {addSetModal && (
        <Modal title="Tambah Set Kurikulum Baru" onClose={closeAddSetModal}>
          <input className="field-input" style={{ marginBottom: 12 }} placeholder="Nama set (cth. PI Tahun 1)"
            value={newSetName} onChange={e => setNewSetName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addSetMode === "manual" && handleAddSet()}/>

          {/* Mode toggle */}
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {[
              { key: "manual", label: "✏ Isi Manual" },
              { key: "import", label: "⬆ Import CSV / Excel" },
            ].map(m => (
              <button key={m.key}
                onClick={() => { setAddSetMode(m.key); setPendingImport(null); setErr(""); }}
                style={{
                  flex: 1, padding: "8px 0", borderRadius: 8,
                  fontSize: 12, fontWeight: 700, cursor: "pointer",
                  border: addSetMode === m.key ? "2px solid var(--strawberry)" : "2px solid var(--border)",
                  background: addSetMode === m.key ? "var(--strawberry-pale, #fff0f0)" : "transparent",
                  color: addSetMode === m.key ? "var(--strawberry)" : "var(--muted)",
                }}>
                {m.label}
              </button>
            ))}
          </div>

          {addSetMode === "import" && (
            <div style={{ marginBottom: 12 }}>
              <button className="btn btn-secondary btn-full"
                onClick={() => importSetFileRef.current?.click()}
                style={{ marginBottom: 6 }}>
                {pendingImport ? `✓ ${pendingImport.items.length} tajuk dimuatkan` : "Pilih fail CSV atau Excel…"}
              </button>
              <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>
                Format: TEMA, TAJUK (CSV atau .xlsx)
              </div>
              <input ref={importSetFileRef} type="file" accept=".csv,.xlsx,.xls,.txt" style={{ display: "none" }}
                onChange={e => { handleImportSetFile(e.target.files[0]); e.target.value = ""; }}/>
              {pendingImport && (
                <div style={{ marginTop: 6, fontSize: 12, fontWeight: 700, color: "var(--matcha-dark, #2e7d32)" }}>
                  ✓ {pendingImport.items.length} tajuk · {[...new Set(pendingImport.items.map(i => i.tema))].length} tema ditemui
                </div>
              )}
            </div>
          )}

          {err && <div style={{ fontSize: 12, color: "var(--strawberry)", fontWeight: 700, marginBottom: 8 }}>⚠ {err}</div>}

          <button className="btn btn-primary btn-full"
            disabled={busy || !newSetName.trim() || (addSetMode === "import" && !pendingImport)}
            onClick={handleAddSet}>
            {busy ? "Menyimpan…" : "Tambah Set"}
          </button>
        </Modal>
      )}

      {confirmDelete && (
        <Modal title={`Padam ${confirmDelete.label}?`} onClose={() => setConfirmDelete(null)}>
          <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600, marginBottom: 12 }}>Semua tajuk dalam set ini akan dipadam. Tindakan ini tidak boleh dibatalkan.</div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-primary btn-full" style={{ background: "var(--strawberry)" }} disabled={busy} onClick={handleDeleteSet}>
              {busy ? "Memadam…" : "Ya, Padam"}
            </button>
            <button className="btn btn-ghost btn-full" onClick={() => setConfirmDelete(null)}>Batal</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── MAIN TETAPAN SCREEN ──────────────────────────────────────────────────────
export default function TetapanScreen({
  students, curriculum, curriculumSets, classes,
  createClass, renameClass, deleteClass, deleteAllClasses,
  addStudent, deleteStudent, deleteStudents, importStudents,
  importCurriculum, updateCurriculumSet, deleteCurriculumSet,
}) {
  const [section, setSection] = useState("home");

  const sets = curriculumSets || [];

  if (section === "students") return (
    <StudentsSection
      students={students} classes={classes}
      createClass={createClass} deleteClass={deleteClass} deleteAllClasses={deleteAllClasses}
      addStudent={addStudent} deleteStudent={deleteStudent} deleteStudents={deleteStudents}
      importStudents={importStudents}
      onBack={() => setSection("home")}
    />
  );

  if (section === "curriculum") return (
    <CurriculumSection
      curriculum={curriculum}
      curriculumSets={sets}
      importCurriculum={importCurriculum}
      updateCurriculumSet={updateCurriculumSet}
      deleteCurriculumSet={deleteCurriculumSet}
      onBack={() => setSection("home")}
    />
  );

  return (
    <div className="screen">
      <div className="page-header">
        <div className="page-title">Tetapan</div>
        <div className="page-subtitle">Konfigurasi &amp; Data</div>
      </div>
      {[
        { key: "students", icon: "👨‍🎓", title: "Murid & Kelas", desc: `${students.length} murid, ${classes.length} kelas` },
        { key: "curriculum", icon: "📚", title: "Set Kurikulum", desc: `${sets.length} set, ${curriculum.length} tajuk` },
      ].map(item => (
        <div key={item.key} className="session-card" onClick={() => setSection(item.key)}>
          <div style={{ fontSize: 28 }}>{item.icon}</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14 }}>{item.title}</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>{item.desc}</div>
          </div>
          <div style={{ marginLeft: "auto", color: "var(--muted)" }}>›</div>
        </div>
      ))}
      <div className="section-label">Keutamaan</div>
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 700 }}>Label TP</span>
          <span className="pill pill-pink">TP1–TP6 / TD</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 700 }}>Tindakan Bulk Default</span>
          <span className="pill pill-green">Isi Kosong</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, fontWeight: 700 }}>Ganti Semua Perlu Sahkan</span>
          <span className="pill pill-green">Ya ✓</span>
        </div>
      </div>
    </div>
  );
}
