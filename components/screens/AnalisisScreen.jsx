'use client';

import { useState } from "react";

export default function AnalisisScreen({ sessions, students }) {
  const [kelasFilter, setKelasFilter] = useState("Semua");
  const classes = ["Semua", ...new Set(students.map(s => s.class_name))];

  const filteredSessions = sessions.filter(s => kelasFilter === "Semua" || s.kelas === kelasFilter);
  const allStudents = kelasFilter === "Semua" ? students : students.filter(s => s.class_name === kelasFilter);

  const studentStats = allStudents.map(s => {
    const sessResults = filteredSessions.filter(sess => sess.kelas === s.class_name);
    const tps = sessResults.map(sess => sess.results[s.id]).filter(r => r && r !== "TD");
    const tdCount = sessResults.filter(sess => sess.results[s.id] === "TD").length;
    const avg = tps.length ? (tps.map(t => parseInt(t.replace("TP",""))).reduce((a,b)=>a+b,0)/tps.length).toFixed(1) : "–";
    const lastSess = sessResults[sessResults.length - 1];
    return { ...s, avg, tdCount, sessions: sessResults.length, lastTP: lastSess ? (lastSess.results[s.id] || "–") : "–" };
  });

  const globalDist = { TP1:0, TP2:0, TP3:0, TP4:0, TP5:0, TP6:0 };
  filteredSessions.forEach(sess => {
    Object.values(sess.results).forEach(r => { if (r && r !== "TD" && globalDist[r] !== undefined) globalDist[r]++; });
  });
  const totalAssessed = Object.values(globalDist).reduce((a,b)=>a+b,0);
  const maxD = Math.max(...Object.values(globalDist), 1);
  const distColors = ["#E8476A","#E8688A","#7BAE7F","#5A9660","#3D7042","#2A5030"];

  return (
    <div className="screen">
      <div className="page-header">
        <div className="page-title">Analisis</div>
        <div className="page-subtitle">Gambaran keseluruhan prestasi</div>
      </div>
      <div className="filter-row">
        {classes.map(k => (
          <button key={k} className={`filter-chip ${kelasFilter === k ? "active" : ""}`} onClick={() => setKelasFilter(k)}>{k}</button>
        ))}
      </div>

      <div className="stat-grid">
        <div className="stat-card"><div className="stat-value">{filteredSessions.length}</div><div className="stat-label">Jumlah Rekod</div></div>
        <div className="stat-card"><div className="stat-value">{totalAssessed}</div><div className="stat-label">Ditaksir (jumlah)</div></div>
        <div className="stat-card"><div className="stat-value">{allStudents.length}</div><div className="stat-label">Jumlah Murid</div></div>
        <div className="stat-card">
          <div className="stat-value" style={{ fontSize: 20 }}>
            {totalAssessed ? (Object.entries(globalDist).map(([k,v])=>parseInt(k.replace("TP",""))*v).reduce((a,b)=>a+b,0)/totalAssessed).toFixed(1) : "–"}
          </div>
          <div className="stat-label">Purata TP</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Taburan TP Keseluruhan</div>
        <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 70 }}>
          {["TP1","TP2","TP3","TP4","TP5","TP6"].map((tp, i) => {
            const count = globalDist[tp];
            const h = Math.max((count / maxD) * 56, count > 0 ? 6 : 0);
            return (
              <div key={tp} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: "100%", height: 60, display: "flex", alignItems: "flex-end" }}>
                  <div style={{ width: "100%", height: h, background: distColors[i], borderRadius: "6px 6px 0 0", display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
                    {count > 0 && <span style={{ fontSize: 10, fontWeight: 800, color: "white", paddingTop: 2 }}>{count}</span>}
                  </div>
                </div>
                <div style={{ fontSize: 10, fontWeight: 800, color: "var(--muted)", marginTop: 4 }}>{tp}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="section-label">Rekod Penguasaan Murid</div>
      <div style={{ margin: "0 16px 16px", background: "white", border: "1.5px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
        <table className="data-table">
          <thead>
            <tr><th>Nama</th><th>Kelas</th><th>Purata TP</th><th>TD</th><th>Terakhir</th></tr>
          </thead>
          <tbody>
            {studentStats.map(s => (
              <tr key={s.id}>
                <td style={{ fontWeight: 700, maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.full_name}</td>
                <td style={{ fontSize: 11 }}>{s.class_name}</td>
                <td>
                  {s.avg !== "–" ? (
                    <span className="pill pill-pink" style={{ fontSize: 11 }}>{s.avg}</span>
                  ) : <span style={{ color: "var(--muted)" }}>–</span>}
                </td>
                <td>
                  {s.tdCount > 0 ? <span className="pill pill-green" style={{ fontSize: 11 }}>{s.tdCount}</span> : <span style={{ color: "var(--muted)" }}>–</span>}
                </td>
                <td>
                  {s.lastTP !== "–" ? (
                    <span className="pill" style={{ background: "var(--matcha-light)", color: "var(--matcha-dark)", fontSize: 11 }}>{s.lastTP}</span>
                  ) : <span style={{ color: "var(--muted)" }}>–</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
