'use client';

import { useState, useCallback } from "react";
import { calcStats } from "@/lib/utils";
import { TP_OPTIONS } from "@/lib/constants";
import { Icons } from "@/components/ui/Icons";
import Snackbar from "@/components/ui/Snackbar";

export default function KeyInScreen({ session, students, onUpdateResult, onFinish, onBack }) {
  const [search, setSearch] = useState("");
  const [filterMode, setFilterMode] = useState("Semua");
  const [snack, setSnack] = useState(null);
  const [bulkConfirm, setBulkConfirm] = useState(null);
  const [history, setHistory] = useState([]);

  const studs = students.filter(s => s.class_name === session.kelas);
  const stats = calcStats(session.results, studs);

  const filtered = studs.filter(s => {
    const matchSearch = !search || s.full_name.toLowerCase().includes(search.toLowerCase());
    const r = session.results[s.id];
    const matchFilter = filterMode === "Semua" || (filterMode === "Selesai" && r && r !== "TD") || (filterMode === "TD" && r === "TD") || (filterMode === "Kosong" && !r);
    return matchSearch && matchFilter;
  });

  const setTP = (studentId, tp) => {
    const prev = session.results[studentId];
    if (prev === tp) {
      onUpdateResult(studentId, "");
    } else {
      setHistory(h => [...h, { studentId, prev }]);
      onUpdateResult(studentId, tp);
    }
  };

  const applyBulk = (mode, tp) => {
    const targets = mode === "replace"
      ? studs.map(s => s.id)
      : studs.filter(s => !session.results[s.id]).map(s => s.id);
    setHistory(h => [...h, ...targets.map(id => ({ studentId: id, prev: session.results[id] }))]);
    targets.forEach(id => onUpdateResult(id, tp));
    setBulkConfirm(null);
    setSnack({ msg: `Digunakan untuk ${targets.length} murid`, canUndo: true });
  };

  const undo = () => {
    if (!history.length) return;
    const last = history[history.length - 1];
    onUpdateResult(last.studentId, last.prev);
    setHistory(h => h.slice(0, -1));
    setSnack(null);
  };

  const progress = Math.round((stats.filled / stats.total) * 100);

  return (
    <div className="screen" style={{ paddingBottom: 60 }}>
      {/* Header */}
      <div className="header-bar">
        <button className="header-back" onClick={onBack}><Icons.back/></button>
        <div className="header-info">
          <div className="header-line1">{session.tarikh} · {session.kelas}</div>
          <div className="header-line2">{session.tajuk}</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={onFinish}>Siap ✓</button>
      </div>

      {/* Progress */}
      <div style={{ padding: "10px 16px 0", background: "white", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)" }}>Kemajuan</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: "var(--strawberry)" }}>{stats.filled}/{stats.total} · TD: {stats.tdCount}</span>
        </div>
        <div className="progress-bar-wrap" style={{ marginBottom: 10 }}>
          <div className="progress-bar-fill" style={{ width: `${progress}%` }}/>
        </div>
      </div>

      {/* Bulk bar */}
      <div className="bulk-bar">
        <div className="bulk-label">Pilih Semua:</div>
        <div className="bulk-chips">
          {TP_OPTIONS.map(tp => (
            <button key={tp} className="tp-chip empty"
              style={{ fontSize: 11 }}
              onClick={() => setBulkConfirm(tp)}>
              {tp}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
          <button className="btn btn-secondary btn-sm" onClick={() => {
            studs.filter(s => !session.results[s.id]).forEach(s => onUpdateResult(s.id, "TD"));
            setSnack({ msg: "Kosong → TD", canUndo: false });
          }}>Mark Kosong sebagai TD</button>
        </div>
      </div>

      {/* Filters & Search */}
      <div style={{ background: "white" }}>
        <input className="search-input" placeholder="Cari murid…" value={search} onChange={e => setSearch(e.target.value)}/>
        <div className="filter-row" style={{ paddingTop: 0 }}>
          {["Semua", "Selesai", "TD", "Kosong"].map(f => (
            <button key={f} className={`filter-chip ${filterMode === f ? "active" : ""}`} onClick={() => setFilterMode(f)}>
              {f} {f === "Kosong" && stats.emptyCount > 0 ? `(${stats.emptyCount})` : ""}
            </button>
          ))}
        </div>
      </div>

      {/* Student list */}
      <div style={{ background: "white", marginTop: 6, borderRadius: 0 }}>
        {filtered.map((s, i) => {
          const cur = session.results[s.id] || "";
          return (
            <div key={s.id} className="student-row" style={{ animationDelay: `${i * 0.03}s` }}>
              <div className="student-bil">{i + 1}</div>
              <div className="student-name" title={s.full_name}>{s.full_name}</div>
              <div className="tp-chips-row">
                {TP_OPTIONS.map(tp => (
                  <button key={tp} className={`tp-chip ${cur === tp ? (tp === "TD" ? "selected-td" : "selected-tp") : "empty"}`}
                    onClick={() => setTP(s.id, tp)}>
                    {tp}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="empty-state"><div className="empty-icon">🔍</div><div className="empty-text">Tiada murid dijumpai</div></div>
        )}
      </div>

      {/* Footer */}
      <div className="key-in-footer">
        <button className="btn btn-secondary btn-sm" onClick={undo} disabled={!history.length}>↩ Undo</button>
        <button className="btn btn-ghost btn-sm" onClick={() => setFilterMode("Kosong")}>
          → Kosong ({stats.emptyCount})
        </button>
      </div>

      {/* Bulk confirm modal */}
      {bulkConfirm && (
        <div className="modal-overlay" onClick={() => setBulkConfirm(null)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle"/>
            <div className="modal-title">Set semua murid ke {bulkConfirm}?</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button className="btn btn-primary btn-full" onClick={() => applyBulk("replace", bulkConfirm)}>Ganti Semua</button>
              <button className="btn btn-secondary btn-full" onClick={() => applyBulk("empty", bulkConfirm)}>Isi Yang Kosong Sahaja</button>
              <button className="btn btn-ghost btn-full" onClick={() => setBulkConfirm(null)}>Batal</button>
            </div>
          </div>
        </div>
      )}

      {snack && <Snackbar msg={snack.msg} onUndo={snack.canUndo ? undo : null} onClose={() => setSnack(null)}/>}
    </div>
  );
}
