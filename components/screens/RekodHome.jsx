'use client';

import { useState } from "react";
import { calcStats, formatDate } from "@/lib/utils";
import { Icons } from "@/components/ui/Icons";

export default function RekodHome({ sessions, students, onOpenSession, onNewSession }) {
  const [search, setSearch] = useState("");
  const [kelasFilter, setKelasFilter] = useState("Semua");
  const classes = ["Semua", ...new Set(students.map(s => s.class_name))];
  const filtered = sessions.filter(s => {
    const matchKelas = kelasFilter === "Semua" || s.kelas === kelasFilter;
    const matchSearch = !search || s.tema.toLowerCase().includes(search.toLowerCase()) || s.tajuk_title.toLowerCase().includes(search.toLowerCase());
    return matchKelas && matchSearch;
  });

  return (
    <div className="screen">
      <div className="page-header">
        <div className="page-title">Rekod PBD</div>
        <div className="page-subtitle">{sessions.length} sesi dicatatkan</div>
      </div>
      <div className="filter-row">
        {classes.map(k => (
          <button key={k} className={`filter-chip ${kelasFilter === k ? "active" : ""}`} onClick={() => setKelasFilter(k)}>{k}</button>
        ))}
      </div>
      <input className="search-input" placeholder="Cari tema / tajuk…" value={search} onChange={e => setSearch(e.target.value)}/>
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <div className="empty-text">Belum ada rekod. Tekan + untuk mula.</div>
        </div>
      ) : filtered.map(session => {
        const studs = students.filter(s => s.class_name === session.kelas);
        const stats = calcStats(session.results, studs);
        const { day, month } = formatDate(session.tarikh);
        return (
          <div key={session.id} className="session-card" onClick={() => onOpenSession(session)}>
            <div className="session-date-box">
              <div className="session-date-day">{day}</div>
              <div className="session-date-month">{month}</div>
            </div>
            <div className="session-info">
              <div className="session-kelas">🏫 {session.kelas}</div>
              <div className="session-tema">{session.tema}</div>
              <div className="session-tajuk">{session.tajuk_code} · {session.tajuk_title}</div>
              <div style={{ display: "flex", gap: 6, marginTop: 6, alignItems: "center" }}>
                <span className="pill pill-pink">✓ {stats.filled}/{stats.total}</span>
                {stats.tdCount > 0 && <span className="pill pill-green">TD: {stats.tdCount}</span>}
                {stats.emptyCount > 0 && <span className="pill pill-gray">Kosong: {stats.emptyCount}</span>}
                <span className="pill pill-gray" style={{ marginLeft: "auto" }}>Avg: {stats.avg}</span>
              </div>
            </div>
          </div>
        );
      })}
      <button className="fab" onClick={onNewSession}><Icons.plus/></button>
    </div>
  );
}
