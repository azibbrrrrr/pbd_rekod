'use client';

export default function EditableCurriculumTable({ rows, onChange }) {
  const update = (i, field, val) => {
    const next = rows.map((r, idx) => idx === i ? { ...r, [field]: val } : r);
    onChange(next);
  };
  const addRow = () => onChange([...rows, { tema: "", tajuk: "", _status: "added" }]);
  const removeRow = (i) => onChange(rows.filter((_, idx) => idx !== i));

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1 }}>
          {rows.length} tajuk · klik sel untuk edit
        </div>
        <button className="btn btn-secondary btn-sm" onClick={addRow} style={{ fontSize: 11 }}>+ Tambah Baris</button>
      </div>
      <div style={{ border: "1.5px solid var(--border)", borderRadius: 12, overflow: "hidden", maxHeight: 360, overflowY: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--strawberry-pale)", position: "sticky", top: 0, zIndex: 2 }}>
              <th style={{ width: 28, padding: "8px 4px", fontSize: 10, fontWeight: 800, color: "var(--muted)", textAlign: "center" }}>#</th>
              <th style={{ padding: "8px 8px", fontSize: 10, fontWeight: 800, color: "var(--muted)", textAlign: "left", width: "30%" }}>TEMA</th>
              <th style={{ padding: "8px 8px", fontSize: 10, fontWeight: 800, color: "var(--muted)", textAlign: "left" }}>TAJUK</th>
              <th style={{ width: 28 }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const isError = !row.tema || !row.tajuk;
              return (
                <tr key={i} style={{ borderTop: "1px solid var(--border)", background: row._status === "added" ? "var(--matcha-pale)" : isError ? "#FFF5F7" : "white" }}>
                  <td style={{ padding: "4px", fontSize: 11, color: "var(--muted)", textAlign: "center", fontWeight: 700 }}>{i + 1}</td>
                  <td style={{ padding: "4px 6px" }}>
                    <input
                      value={row.tema}
                      onChange={e => update(i, "tema", e.target.value)}
                      style={{ width: "100%", border: "none", outline: "none", fontSize: 12, fontWeight: 700, fontFamily: "var(--font-nunito), Nunito, sans-serif", background: "transparent", color: !row.tema ? "var(--strawberry)" : "var(--charcoal)", padding: "4px 2px" }}
                      placeholder="Tema…"
                    />
                  </td>
                  <td style={{ padding: "4px 6px" }}>
                    <input
                      value={row.tajuk}
                      onChange={e => update(i, "tajuk", e.target.value)}
                      style={{ width: "100%", border: "none", outline: "none", fontSize: 12, fontWeight: 600, fontFamily: "var(--font-nunito), Nunito, sans-serif", background: "transparent", color: !row.tajuk ? "var(--strawberry)" : "var(--charcoal)", padding: "4px 2px" }}
                      placeholder="Tajuk pembelajaran…"
                    />
                  </td>
                  <td style={{ padding: "4px", textAlign: "center" }}>
                    <button onClick={() => removeRow(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: 16, lineHeight: 1, padding: "2px 4px" }} title="Padam">×</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {rows.some(r => !r.tema || !r.tajuk) && (
        <div style={{ marginTop: 8, fontSize: 12, color: "var(--strawberry)", fontWeight: 700 }}>
          ⚠ Baris tanpa tema atau tajuk akan diabaikan semasa import
        </div>
      )}
    </div>
  );
}
