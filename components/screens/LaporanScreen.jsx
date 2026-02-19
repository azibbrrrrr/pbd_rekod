'use client';

import { useState, useMemo } from "react";
import { calcStats } from "@/lib/utils";
import {
  createBorangTransitFilename,
  downloadXLSX,
  generateMultiClassWorkbook,
} from "@/lib/exportXLSX";

export default function LaporanScreen({ sessions, students, curriculum, classes }) {
  const [tab, setTab] = useState("Sesi");
  const [selectedSession, setSelectedSession] = useState(sessions[0] || null);
  const tabs = ["Sesi", "Murid", "Kelas"];

  // Export state
  const [showExport, setShowExport] = useState(false);
  const [exportClass, setExportClass] = useState("");
  const [exportSet, setExportSet] = useState("");
  const [exportBusy, setExportBusy] = useState("");

  // Derive class names from students (consistent with other screens)
  const classNames = useMemo(
    () => [...new Set(students.map(s => s.class_name))].sort(),
    [students]
  );

  // Derive sets from curriculum
  const curriculumSets = useMemo(() => {
    const map = new Map();
    curriculum.forEach(c => {
      if (!map.has(c.set_id)) map.set(c.set_id, { id: c.set_id, name: c.set_name });
    });
    return [...map.values()];
  }, [curriculum]);

  const isAllClasses = exportClass === "__all__";

  // Export handler
  const handleExportXLSX = async () => {
    if (!exportClass || !exportSet) return;

    const setObj = curriculumSets.find(s => s.id === exportSet);
    if (!setObj) return;

    const targetClasses = isAllClasses ? classNames : [exportClass];

    const setItems = curriculum.filter(c => c.set_id === exportSet);
    const setItemIds = new Set(setItems.map(i => i.id));

    const temaOrder = [];
    const temaMap = {};
    setItems.forEach(item => {
      if (!temaMap[item.tema]) {
        temaMap[item.tema] = [];
        temaOrder.push(item.tema);
      }
      temaMap[item.tema].push(item);
    });

    const temaGroups = temaOrder.map(tema => ({
      tema,
      tajuks: temaMap[tema].map(t => ({
        id: t.id,
        tajuk: t.tajuk,
      })),
    }));

    const classEntries = targetClasses.map(cn => {
      const classStudents = students
        .filter(s => s.class_name === cn)
        .sort((a, b) => a.full_name.localeCompare(b.full_name));

      const relevantSessions = sessions.filter(
        s => s.kelas === cn && setItemIds.has(s.curriculum_item_id)
      );

      const resultMatrix = {};
      classStudents.forEach(s => { resultMatrix[s.id] = {}; });

      relevantSessions.forEach(sess => {
        const itemId = sess.curriculum_item_id;
        Object.entries(sess.results || {}).forEach(([studentId, tpVal]) => {
          if (resultMatrix[studentId] && !resultMatrix[studentId][itemId]) {
            resultMatrix[studentId][itemId] = tpVal;
          }
        });
      });

      return { className: cn, students: classStudents, resultMatrix };
    });

    setExportBusy("xlsx");
    try {
      const workbookBuffer = await generateMultiClassWorkbook({
        classes: classEntries,
        temaGroups,
        title: `BORANG TRANSIT PBD ${setObj.name.toUpperCase()} / ${new Date().getFullYear()}`,
        schoolName: '',
        subjectName: setObj.name,
        teacherName: '',
      });

      const label = isAllClasses ? 'Semua_Kelas' : exportClass;
      const filename = createBorangTransitFilename(label, setObj.name, "xlsx");
      downloadXLSX(workbookBuffer, filename);
      setShowExport(false);
    } catch (error) {
      alert(`Ralat eksport XLSX: ${error.message}`);
    } finally {
      setExportBusy("");
    }
  };

  // Preview counts
  const previewStudentCount = exportClass && exportSet
    ? (isAllClasses ? students : students.filter(s => s.class_name === exportClass)).length
    : 0;
  const previewTajukCount = exportSet
    ? curriculum.filter(c => c.set_id === exportSet).length
    : 0;
  const previewSessionCount = exportClass && exportSet
    ? (isAllClasses ? sessions : sessions.filter(s => s.kelas === exportClass)).length
    : 0;

  const renderSesi = () => {
    if (!selectedSession) return <div className="empty-state"><div className="empty-icon">-</div><div className="empty-text">Tiada sesi</div></div>;
    const studs = students.filter(s => s.class_name === selectedSession.kelas);
    const stats = calcStats(selectedSession.results, studs);
    return (
      <div>
        <div style={{ padding: "12px 16px" }}>
          <div className="field-label">Pilih Sesi</div>
          <select className="field-input" value={selectedSession.id} onChange={e => setSelectedSession(sessions.find(s => s.id == e.target.value))}>
            {sessions.map(s => <option key={s.id} value={s.id}>{s.tarikh} / {s.kelas} / {s.tajuk}</option>)}
          </select>
        </div>
        <div className="card" style={{ background: "var(--strawberry-pale)", border: "2px solid var(--strawberry-light)" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "var(--strawberry)", marginBottom: 4 }}>LAPORAN SESI PBD</div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>Tarikh: {selectedSession.tarikh}</div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>Kelas: {selectedSession.kelas}</div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>Tema: {selectedSession.tema}</div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>Tajuk: {selectedSession.tajuk}</div>
        </div>
        <div className="stat-grid">
          <div className="stat-card"><div className="stat-value">{stats.filled}</div><div className="stat-label">Ditaksir</div></div>
          <div className="stat-card"><div className="stat-value">{stats.avg}</div><div className="stat-label">Purata TP</div></div>
          <div className="stat-card"><div className="stat-value">{stats.tdCount}</div><div className="stat-label">TD</div></div>
          <div className="stat-card"><div className="stat-value">{stats.emptyCount}</div><div className="stat-label">Kosong</div></div>
        </div>
        <div style={{ margin: "0 16px 12px", background: "white", border: "1.5px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
          <table className="data-table">
            <thead><tr><th>#</th><th>Nama Murid</th><th>TP</th></tr></thead>
            <tbody>
              {studs.map((s, i) => {
                const r = selectedSession.results[s.id];
                return (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 700, color: "var(--muted)" }}>{i + 1}</td>
                    <td style={{ fontWeight: 700 }}>{s.full_name}</td>
                    <td>
                      {r ? <span className="pill" style={{
                        background: r === "TD" ? "var(--matcha-light)" : "var(--strawberry-light)",
                        color: r === "TD" ? "var(--matcha-dark)" : "var(--strawberry-dark)", fontSize: 12
                      }}>{r}</span> : <span style={{ color: "var(--muted)", fontSize: 12 }}>Kosong</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ padding: "4px 16px 16px", display: "flex", gap: 10 }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => window.print()}>Cetak</button>
        </div>
      </div>
    );
  };

  const renderMurid = () => {
    return (
      <div style={{ padding: "12px 16px" }}>
        {students.map(student => {
          const sessResults = sessions.filter(s => s.kelas === student.class_name);
          const tps = sessResults.map(s => s.results[student.id]).filter(r => r && r !== "TD");
          const avg = tps.length ? (tps.map(t => parseInt(t.replace("TP",""))).reduce((a,b)=>a+b,0)/tps.length).toFixed(1) : "-";
          return (
            <div key={student.id} className="card" style={{ marginLeft: 0, marginRight: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>{student.full_name}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{student.class_name}</div>
                </div>
                {avg !== "-" && <span className="pill pill-pink" style={{ fontSize: 14 }}>Avg: {avg}</span>}
              </div>
              {sessResults.length > 0 && (
                <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {sessResults.map(s => {
                    const r = s.results[student.id];
                    return r ? (
                      <div key={s.id} style={{ fontSize: 11, fontWeight: 700, background: "var(--strawberry-pale)", padding: "3px 8px", borderRadius: 8, color: "var(--charcoal)" }}>
                        {s.tarikh}: <span style={{ color: r === "TD" ? "var(--matcha-dark)" : "var(--strawberry)" }}>{r}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderKelas = () => {
    return (
      <div style={{ padding: "12px 16px" }}>
        {classNames.map(kelas => {
          const studs = students.filter(s => s.class_name === kelas);
          const sess = sessions.filter(s => s.kelas === kelas);
          const allResults = sess.flatMap(s => studs.map(st => s.results[st.id]).filter(r => r && r !== "TD"));
          const avg = allResults.length ? (allResults.map(t => parseInt(t.replace("TP",""))).reduce((a,b)=>a+b,0)/allResults.length).toFixed(1) : "-";
          const lowTP = studs.filter(s => {
            const tps = sess.map(ses => ses.results[s.id]).filter(r => r && r !== "TD");
            const a = tps.length ? tps.map(t => parseInt(t.replace("TP",""))).reduce((a,b)=>a+b,0)/tps.length : null;
            return a !== null && a <= 2;
          });
          return (
            <div key={kelas} className="card" style={{ marginLeft: 0, marginRight: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontWeight: 800, fontSize: 16 }}>Kelas {kelas}</div>
                <span className="pill pill-pink">Avg: {avg}</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>{studs.length} murid / {sess.length} sesi</div>
              {lowTP.length > 0 && (
                <div style={{ marginTop: 10, padding: "8px 10px", background: "var(--strawberry-pale)", borderRadius: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "var(--strawberry)", marginBottom: 4 }}>Perlu Perhatian ({lowTP.length})</div>
                  {lowTP.map(s => <div key={s.id} style={{ fontSize: 12, fontWeight: 600 }}>{s.full_name}</div>)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="screen">
      <div className="page-header">
        <div className="page-title">Laporan</div>
        <div className="page-subtitle">Eksport & Analisis</div>
      </div>

      {/* Export Borang Transit Button */}
      <div style={{ padding: "0 16px 8px" }}>
        <button className="btn btn-green btn-full" onClick={() => setShowExport(true)}>
          Eksport Borang Transit PBD (XLSX)
        </button>
      </div>

      {/* Export Modal */}
      {showExport && (
        <div className="modal-overlay" onClick={() => setShowExport(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle"/>
            <div className="modal-title">Eksport Borang Transit PBD</div>
            <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600, marginBottom: 16 }}>
              Pilih kelas dan set kurikulum untuk dijana sebagai XLSX.
            </div>

            <div className="field-group" style={{ marginBottom: 12 }}>
              <div className="field-label">Kelas</div>
              <select className="field-input" value={exportClass} onChange={e => setExportClass(e.target.value)}>
                <option value="">-- Pilih Kelas --</option>
                <option value="__all__">Semua Kelas</option>
                {classNames.map(cn => <option key={cn} value={cn}>{cn}</option>)}
              </select>
            </div>

            <div className="field-group" style={{ marginBottom: 16 }}>
              <div className="field-label">Set Kurikulum</div>
              <select className="field-input" value={exportSet} onChange={e => setExportSet(e.target.value)}>
                <option value="">-- Pilih Set Kurikulum --</option>
                {curriculumSets.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            {exportClass && exportSet && (
              <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, marginBottom: 12, padding: "8px 12px", background: "var(--matcha-pale)", borderRadius: 10 }}>
                {previewStudentCount} murid /{" "}
                {previewTajukCount} tajuk /{" "}
                {previewSessionCount} sesi
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-primary btn-full"
                disabled={!exportClass || !exportSet || !!exportBusy}
                onClick={handleExportXLSX}>
                {exportBusy === "xlsx" ? "Menjana..." : "Muat Turun XLSX"}
              </button>
              <button className="btn btn-ghost btn-full" onClick={() => setShowExport(false)}>Batal</button>
            </div>
          </div>
        </div>
      )}

      <div className="filter-row">
        {tabs.map(t => (
          <button key={t} className={`filter-chip ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            Laporan {t}
          </button>
        ))}
      </div>
      {tab === "Sesi" && renderSesi()}
      {tab === "Murid" && renderMurid()}
      {tab === "Kelas" && renderKelas()}
    </div>
  );
}
