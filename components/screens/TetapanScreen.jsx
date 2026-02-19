'use client';

import { useState } from "react";
import { Icons } from "@/components/ui/Icons";

export default function TetapanScreen({ students, curriculum }) {
  const [section, setSection] = useState("home");
  const classes = [...new Set(students.map(s => s.class_name))];
  const sets = [...new Set(curriculum.map(c => c.set_name))];

  if (section === "students") return (
    <div className="screen">
      <div className="header-bar">
        <button className="header-back" onClick={() => setSection("home")}><Icons.back/></button>
        <div className="header-info"><div className="header-line1">Murid & Kelas</div></div>
      </div>
      {classes.map(k => {
        const studs = students.filter(s => s.class_name === k);
        return (
          <div key={k}>
            <div className="section-label">{k} ({studs.length} murid)</div>
            {studs.map(s => (
              <div key={s.id} style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center" }}>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 700 }}>{s.full_name}</span>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>#{s.id}</span>
              </div>
            ))}
          </div>
        );
      })}
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        <button className="btn btn-primary btn-full">+ Import CSV Murid</button>
        <button className="btn btn-secondary btn-full">+ Tambah Kelas Manual</button>
      </div>
    </div>
  );

  if (section === "curriculum") return (
    <div className="screen">
      <div className="header-bar">
        <button className="header-back" onClick={() => setSection("home")}><Icons.back/></button>
        <div className="header-info"><div className="header-line1">Set Kurikulum</div></div>
      </div>
      {sets.map(set => {
        const items = curriculum.filter(c => c.set_name === set);
        const themes = [...new Set(items.map(c => c.tema))];
        return (
          <div key={set} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontWeight: 800, fontSize: 14 }}>{set}</div>
              <span className="pill pill-green" style={{ fontSize: 11 }}>Aktif</span>
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, marginTop: 4 }}>{items.length} tajuk · {themes.length} tema</div>
            <div style={{ marginTop: 10 }}>
              {themes.map(tema => (
                <div key={tema} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "var(--strawberry)", marginBottom: 4 }}>{tema}</div>
                  {items.filter(i => i.tema === tema).map(item => (
                    <div key={item.id} style={{ fontSize: 12, fontWeight: 600, color: "var(--charcoal)", padding: "2px 0 2px 10px", borderLeft: "2px solid var(--border)" }}>
                      {item.tajuk_code} — {item.tajuk_title}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        );
      })}
      <div style={{ padding: 16 }}>
        <button className="btn btn-primary btn-full">+ Import CSV Kurikulum</button>
      </div>
    </div>
  );

  return (
    <div className="screen">
      <div className="page-header">
        <div className="page-title">Tetapan</div>
        <div className="page-subtitle">Konfigurasi & Data</div>
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
      <div className="section-label">Backup</div>
      <div style={{ padding: "0 16px 16px", display: "flex", gap: 10 }}>
        <button className="btn btn-secondary" style={{ flex: 1 }}>⬇ Export Data</button>
        <button className="btn btn-ghost" style={{ flex: 1 }}>⬆ Import Backup</button>
      </div>
    </div>
  );
}
