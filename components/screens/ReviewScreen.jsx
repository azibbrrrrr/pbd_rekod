'use client';

import { calcStats } from "@/lib/utils";
import { Icons } from "@/components/ui/Icons";

export default function ReviewScreen({ session, students, onBack, onEdit }) {
  const studs = students.filter(s => s.class_name === session.kelas);
  const stats = calcStats(session.results, studs);
  const maxDist = Math.max(...Object.values(stats.dist), 1);
  const distColors = ["#E8476A","#E8688A","#7BAE7F","#5A9660","#3D7042","#2A5030"];

  return (
    <div className="screen">
      <div className="header-bar">
        <button className="header-back" onClick={onBack}><Icons.back/></button>
        <div className="header-info">
          <div className="header-line1">Semakan Sesi</div>
          <div className="header-line2">{session.kelas} · {session.tarikh}</div>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card"><div className="stat-value">{stats.total}</div><div className="stat-label">Jumlah Murid</div></div>
        <div className="stat-card"><div className="stat-value">{stats.filled}</div><div className="stat-label">Ditaksir</div></div>
        <div className="stat-card"><div className="stat-value">{stats.tdCount}</div><div className="stat-label">Tidak Dinilai (TD)</div></div>
        <div className="stat-card"><div className="stat-value" style={{ fontSize: 22 }}>{stats.avg}</div><div className="stat-label">Purata TP</div></div>
      </div>

      {/* Distribution */}
      <div className="card">
        <div className="card-title">Taburan TP</div>
        <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 70, marginBottom: 4 }}>
          {["TP1","TP2","TP3","TP4","TP5","TP6"].map((tp, i) => {
            const count = stats.dist[tp];
            const h = maxDist ? Math.max((count / maxDist) * 56, count > 0 ? 8 : 0) : 0;
            return (
              <div key={tp} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ position: "relative", width: "100%", height: 60, display: "flex", alignItems: "flex-end" }}>
                  <div style={{ width: "100%", height: h, background: distColors[i], borderRadius: "6px 6px 0 0", transition: "height 0.4s" }}>
                    {count > 0 && <div style={{ fontSize: 10, fontWeight: 800, color: "white", textAlign: "center", paddingTop: 3 }}>{count}</div>}
                  </div>
                </div>
                <div style={{ fontSize: 10, fontWeight: 800, color: "var(--muted)", marginTop: 4 }}>{tp}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Empty students */}
      {stats.emptyCount > 0 && (
        <div className="card">
          <div className="card-title">⚠ Belum Isi ({stats.emptyCount})</div>
          {studs.filter(s => !session.results[s.id]).map(s => (
            <div key={s.id} className="review-list-item">
              <span style={{ color: "var(--muted)" }}>○</span>
              <span>{s.full_name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Full list */}
      <div className="card">
        <div className="card-title">Semua Murid</div>
        {studs.map(s => {
          const r = session.results[s.id];
          return (
            <div key={s.id} className="review-list-item">
              <span style={{ color: r && r !== "TD" ? "var(--matcha)" : "var(--muted)" }}>
                {r && r !== "TD" ? "✓" : r === "TD" ? "–" : "○"}
              </span>
              <span style={{ flex: 1 }}>{s.full_name}</span>
              {r ? (
                <span className="pill" style={{
                  background: r === "TD" ? "var(--matcha-light)" : "var(--strawberry-light)",
                  color: r === "TD" ? "var(--matcha-dark)" : "var(--strawberry-dark)",
                  fontSize: 12
                }}>{r}</span>
              ) : <span className="pill pill-gray" style={{ fontSize: 12 }}>Kosong</span>}
            </div>
          );
        })}
      </div>

      <div style={{ padding: "4px 16px 16px", display: "flex", gap: 10 }}>
        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onEdit}>← Edit</button>
        <button className="btn btn-green" style={{ flex: 2 }} onClick={onBack}>Simpan & Selesai ✓</button>
      </div>
    </div>
  );
}
