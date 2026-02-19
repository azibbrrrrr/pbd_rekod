'use client';

import { useState, useRef } from "react";
import {
  parseCSV,
  normalizeStr,
  validateStudentCSVFormat,
  validateCurriculumCSVFormat,
} from "@/lib/utils";
import { SEED_STUDENTS, SEED_CURRICULUM } from "@/lib/seed-data";
import { Icons } from "@/components/ui/Icons";
import EditableStudentTable from "@/components/ui/EditableStudentTable";
import EditableCurriculumTable from "@/components/ui/EditableCurriculumTable";

export default function OnboardingScreen({ onComplete, createClass, importStudents, importCurriculum }) {
  const [step, setStep] = useState(0);

  // Step 1 — Students state
  const [studentRows, setStudentRows] = useState([]);
  const [studentError, setStudentError] = useState("");
  const [trimCaps, setTrimCaps] = useState(true);
  const [importSummary, setImportSummary] = useState(null);
  const studentFileRef = useRef();

  // Step 2 — Curriculum state
  const [curriculumRows, setCurriculumRows] = useState([]);
  const [curriculumError, setCurriculumError] = useState("");
  const [setName, setSetName] = useState("RBT Tahun 3 2026");
  const [autoSplitCode, setAutoSplitCode] = useState(true);
  const [currSummary, setCurrSummary] = useState(null);
  const currFileRef = useRef();

  // ── CSV reading helpers ──────────────────────────────────────────────────
  const readFile = (file) => new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = e => res(e.target.result);
    reader.onerror = () => rej(new Error("Gagal membaca fail"));
    reader.readAsText(file, "UTF-8");
  });

  // ── Step 1: handle student CSV ───────────────────────────────────────────
  const handleStudentCSV = async (file) => {
    if (!file) return;
    setStudentError("");
    setImportSummary(null);
    try {
      const text = await readFile(file);
      const { headers, rows } = parseCSV(text);
      const formatCheck = validateStudentCSVFormat(headers, { requireClass: true });
      if (!formatCheck.valid) { setStudentError(formatCheck.error); return; }
      if (rows.length === 0) { setStudentError("Fail CSV kosong atau format tidak dikenali."); return; }
      const cols = formatCheck.columns;
      const seen = new Set();
      let added = 0, skipped = 0, errors = 0;
      const parsed = [];
      rows.forEach((row) => {
        let kelas = row[cols.kelas] || "";
        let nama = row[cols.nama] || "";
        if (trimCaps) { kelas = normalizeStr(kelas, true); nama = nama.trim().replace(/\s+/g, " "); }
        if (!kelas || !nama) { errors++; return; }
        const key = `${kelas}||${nama.toUpperCase()}`;
        if (seen.has(key)) { skipped++; return; }
        seen.add(key);
        parsed.push({ class_name: kelas, full_name: nama });
        added++;
      });
      setStudentRows(parsed);
      setImportSummary({ added, skipped, errors });
    } catch (e) {
      setStudentError("Ralat membaca fail: " + e.message);
    }
  };

  // ── Step 2: handle curriculum CSV ───────────────────────────────────────
  const handleCurriculumCSV = async (file) => {
    if (!file) return;
    setCurriculumError("");
    setCurrSummary(null);
    try {
      const text = await readFile(file);
      const { headers, rows } = parseCSV(text);
      const formatCheck = validateCurriculumCSVFormat(headers);
      if (!formatCheck.valid) { setCurriculumError(formatCheck.error); return; }
      if (rows.length === 0) { setCurriculumError("Fail CSV kosong atau format tidak dikenali."); return; }
      const cols = formatCheck.columns;
      let added = 0, errors = 0;
      const parsed = [];
      rows.forEach(row => {
        const tema = (row[cols.tema] || "").trim();
        const tajuk = (row[cols.tajuk] || "").trim();
        if (!tema || !tajuk) { errors++; return; }
        parsed.push({ tema, tajuk });
        added++;
      });
      setCurriculumRows(parsed);
      setCurrSummary({ added, errors });
    } catch (e) {
      setCurriculumError("Ralat membaca fail: " + e.message);
    }
  };

  // ── Drag-and-drop helpers ────────────────────────────────────────────────
  const onDropStudent = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleStudentCSV(file);
  };
  const onDropCurr = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleCurriculumCSV(file);
  };

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // ── Finalize: save to Supabase + pass data up ───────────────────────────
  const finalize = async () => {
    setSaving(true);
    setSaveError("");
    try {
      const validStudents = studentRows.filter(r => r.class_name && r.full_name);
      const validCurriculum = curriculumRows.filter(r => r.tema && r.tajuk);

      // Group students by class and import
      if (validStudents.length > 0 && createClass && importStudents) {
        const byClass = {};
        validStudents.forEach(s => {
          if (!byClass[s.class_name]) byClass[s.class_name] = [];
          byClass[s.class_name].push(s.full_name);
        });
        for (const [className, names] of Object.entries(byClass)) {
          const cls = await createClass(className);
          await importStudents(cls.id, names);
        }
      }

      // Import curriculum
      if (validCurriculum.length > 0 && importCurriculum) {
        await importCurriculum(setName || "Set Kurikulum", validCurriculum);
      }

      onComplete(null, null);
    } catch (err) {
      console.error('Error saving onboarding data:', err);
      setSaveError('Ralat menyimpan data: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── STEP 0: Welcome ───────────────────────────────────────────────────────
  if (step === 0) return (
    <div className="screen" style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--cream)" }}>
      <div className="onboard-hero" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div className="strawberry-emoji">🍓</div>
        <div className="app-logo">PEREKODAN<br/>PBD</div>
        <div className="app-tagline">Rekod Prestasi Murid Lebih Pantas</div>
        <div style={{ marginTop: 12, padding: "6px 14px", borderRadius: 20, background: "var(--matcha-light)", display: "inline-block" }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: "var(--matcha-dark)" }}>✦ TP1 – TP6 + TD dalam sekelip mata</span>
        </div>
      </div>
      <div style={{ padding: "0 24px 40px", display: "flex", flexDirection: "column", gap: 10 }}>
        <button className="btn btn-primary btn-full" onClick={() => setStep(1)}>Mula →</button>
        {/* <button className="btn btn-ghost btn-full" onClick={() => onComplete(null, null)}>Guna data contoh & langkau</button> */}
      </div>
    </div>
  );

  // ── STEP 1: Import Students ───────────────────────────────────────────────
  if (step === 1) {
    const validCount = studentRows.filter(r => r.class_name && r.full_name).length;
    const canProceed = validCount > 0;

    return (
      <div className="screen" style={{ paddingBottom: 20 }}>
        <div className="page-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button className="header-back" onClick={() => setStep(0)}><Icons.back/></button>
            <div>
              <div className="page-title">Import Murid</div>
              <div className="page-subtitle">Langkah 1 daripada 2</div>
            </div>
          </div>
        </div>

        <div style={{ padding: "14px 16px 0" }}>
          {/* Drop zone */}
          <div
            className="drop-zone"
            onDragOver={e => e.preventDefault()}
            onDrop={onDropStudent}
            onClick={() => studentFileRef.current.click()}
          >
            <div className="drop-icon">📂</div>
            <div className="drop-text">Klik atau seret fail CSV murid</div>
            <div className="drop-hint">Format: KELAS, NAMA MURID (header diperlukan)</div>
            <input
              ref={studentFileRef}
              type="file"
              accept=".csv,.txt"
              style={{ display: "none" }}
              onChange={e => handleStudentCSV(e.target.files[0])}
            />
          </div>

          {/* Options */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
            <input type="checkbox" id="trimCaps" checked={trimCaps} onChange={e => setTrimCaps(e.target.checked)} style={{ accentColor: "var(--strawberry)", width: 16, height: 16 }}/>
            <label htmlFor="trimCaps" style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)", cursor: "pointer" }}>Trim spaces & capitalize kelas</label>
          </div>

          {/* Error */}
          {studentError && (
            <div style={{ marginTop: 10, padding: "10px 14px", background: "#FFF0F3", border: "1.5px solid var(--strawberry-light)", borderRadius: 10, fontSize: 13, fontWeight: 700, color: "var(--strawberry)" }}>
              ⚠ {studentError}
            </div>
          )}

          {/* Import summary badge */}
          {importSummary && (
            <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span className="pill pill-green">✓ {importSummary.added} ditambah</span>
              {importSummary.skipped > 0 && <span className="pill pill-gray">⟳ {importSummary.skipped} duplikat dilangkau</span>}
              {importSummary.errors > 0 && <span className="pill" style={{ background: "#FFEDF1", color: "var(--strawberry)" }}>⚠ {importSummary.errors} baris ralat</span>}
            </div>
          )}

          {/* Sample format hint */}
          {studentRows.length === 0 && (
            <div className="card" style={{ marginTop: 14, marginLeft: 0, marginRight: 0 }}>
              <div className="card-title">Format CSV</div>
              <div style={{ fontFamily: "monospace", fontSize: 12, background: "var(--strawberry-pale)", padding: "10px 12px", borderRadius: 8, lineHeight: 1.8, color: "var(--charcoal)" }}>
                KELAS,NAMA MURID<br/>
                3 AMETHYST,Ahmad Faris bin Aziz<br/>
                3 AMETHYST,Siti Nur Aisyah<br/>
                3 RUBY,Alya Sofea
              </div>
              <div style={{ marginTop: 10, fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>
                Header boleh dalam Bahasa Melayu atau Inggeris. Pemisah: koma (,) atau titik koma (;).
              </div>
            </div>
          )}

          {/* Editable table */}
          {studentRows.length > 0 && (
            <EditableStudentTable rows={studentRows} onChange={setStudentRows} />
          )}

          {/* Use sample data */}
          {studentRows.length === 0 && (
            <div style={{ textAlign: "center", margin: "14px 0 4px" }}>
              <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>— atau —</span>
            </div>
          )}
          {studentRows.length === 0 && (
            <button className="btn btn-secondary btn-full" style={{ marginBottom: 4 }} onClick={() => {
              setStudentRows(SEED_STUDENTS.map(s => ({ ...s })));
              setImportSummary({ added: SEED_STUDENTS.length, skipped: 0, errors: 0 });
            }}>
              📋 Guna Data Contoh (16 murid)
            </button>
          )}
        </div>

        {/* Sticky footer */}
        <div style={{ position: "sticky", bottom: 0, background: "white", borderTop: "1.5px solid var(--border)", padding: "12px 16px", marginTop: 16, display: "flex", gap: 10 }}>
          <button className="btn btn-primary" style={{ flex: 2 }} disabled={!canProceed} onClick={() => setStep(2)}>
            Seterusnya → {canProceed ? `(${validCount} murid)` : ""}
          </button>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setStep(2)}>Langkau</button>
        </div>
      </div>
    );
  }

  // ── STEP 2: Import Curriculum ─────────────────────────────────────────────
  const validCurrCount = curriculumRows.filter(r => r.tema && r.tajuk).length;

  return (
    <div className="screen" style={{ paddingBottom: 20 }}>
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button className="header-back" onClick={() => setStep(1)}><Icons.back/></button>
          <div>
            <div className="page-title">Import Kurikulum</div>
            <div className="page-subtitle">Langkah 2 daripada 2</div>
          </div>
        </div>
      </div>

      <div style={{ padding: "14px 16px 0" }}>
        {/* Set name */}
        <div className="field-group">
          <div className="field-label">Nama Set Kurikulum</div>
          <input className="field-input" value={setName} onChange={e => setSetName(e.target.value)} placeholder="cth. RBT Tahun 3 2026"/>
        </div>

     

        {/* Drop zone */}
        <div
          className="drop-zone"
          onDragOver={e => e.preventDefault()}
          onDrop={onDropCurr}
          onClick={() => currFileRef.current.click()}
        >
          <div className="drop-icon">📋</div>
          <div className="drop-text">Klik atau seret fail CSV kurikulum</div>
          <div className="drop-hint">Format: TEMA, TAJUK</div>
          <input
            ref={currFileRef}
            type="file"
            accept=".csv,.txt"
            style={{ display: "none" }}
            onChange={e => handleCurriculumCSV(e.target.files[0])}
          />
        </div>

        {/* Error */}
        {curriculumError && (
          <div style={{ marginTop: 10, padding: "10px 14px", background: "#FFF0F3", border: "1.5px solid var(--strawberry-light)", borderRadius: 10, fontSize: 13, fontWeight: 700, color: "var(--strawberry)" }}>
            ⚠ {curriculumError}
          </div>
        )}

        {/* Summary */}
        {currSummary && (
          <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span className="pill pill-green">✓ {currSummary.added} tajuk ditambah</span>
            {currSummary.errors > 0 && <span className="pill" style={{ background: "#FFEDF1", color: "var(--strawberry)" }}>⚠ {currSummary.errors} baris ralat</span>}
          </div>
        )}

        {/* Sample format */}
        {curriculumRows.length === 0 && (
          <div className="card" style={{ marginTop: 14, marginLeft: 0, marginRight: 0 }}>
            <div className="card-title">Format CSV</div>
            <div style={{ fontFamily: "monospace", fontSize: 12, background: "var(--strawberry-pale)", padding: "10px 12px", borderRadius: 8, lineHeight: 1.8, color: "var(--charcoal)" }}>
              TEMA,TAJUK<br/>
              1.0 Reka Bentuk & Teknologi,1.1.1 Mengenal pasti keperluan<br/>
              1.0 Reka Bentuk & Teknologi,1.1.2 Mengenal pasti masalah<br/>
              2.0 Teknologi Pertanian,2.1.1 Jenis-jenis tanaman
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>
              Kod tajuk (1.1.1) boleh disertakan terus dalam lajur TAJUK — ia akan diasingkan secara automatik jika &quot;Auto-extract kod&quot; diaktifkan.
            </div>
          </div>
        )}

        {/* Editable curriculum table */}
        {curriculumRows.length > 0 && (
          <EditableCurriculumTable rows={curriculumRows} onChange={setCurriculumRows} />
        )}

        {/* Use sample */}
        {curriculumRows.length === 0 && (
          <>
            <div style={{ textAlign: "center", margin: "14px 0 4px" }}>
              <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>— atau —</span>
            </div>
            <button className="btn btn-secondary btn-full" style={{ marginBottom: 4 }} onClick={() => {
              setCurriculumRows(SEED_CURRICULUM.map(c => ({ ...c })));
              setCurrSummary({ added: SEED_CURRICULUM.length, errors: 0 });
            }}>
              📋 Guna Data Contoh (6 tajuk)
            </button>
          </>
        )}
      </div>

      {/* Sticky footer */}
      <div style={{ position: "sticky", bottom: 0, background: "white", borderTop: "1.5px solid var(--border)", padding: "12px 16px", marginTop: 16, display: "flex", gap: 10 }}>
        {saveError && <div className="form-error" style={{ marginBottom: 10, flex: '100%' }}>{saveError}</div>}
        <button className="btn btn-green" style={{ flex: 2 }} onClick={finalize} disabled={saving}>
          {saving ? 'Menyimpan...' : `Selesai — Pergi Rekod ✓ ${validCurrCount > 0 ? `(${validCurrCount} tajuk)` : ''}`}
        </button>
        <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => onComplete(null, null)}>Langkau</button>
      </div>
    </div>
  );
}
