'use client';

export default function EditableStudentTable({ rows, onChange }) {
  const update = (i, field, val) => {
    const next = rows.map((r, idx) => idx === i ? { ...r, [field]: val } : r);
    onChange(next);
  };
  const addRow = () => onChange([...rows, { class_name: "", full_name: "", _status: "added" }]);
  const removeRow = (i) => onChange(rows.filter((_, idx) => idx !== i));

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1 }}>
          {rows.length} murid · klik sel untuk edit
        </div>
        <button className="btn btn-secondary btn-sm" onClick={addRow} style={{ fontSize: 11 }}>+ Tambah Baris</button>
      </div>
      <div style={{ border: "1.5px solid var(--border)", borderRadius: 12, overflow: "hidden", maxHeight: 340, overflowY: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--strawberry-pale)", position: "sticky", top: 0, zIndex: 2 }}>
              <th style={{ width: 32, padding: "8px 6px", fontSize: 10, fontWeight: 800, color: "var(--muted)", textAlign: "center" }}>#</th>
              <th style={{ padding: "8px 10px", fontSize: 10, fontWeight: 800, color: "var(--muted)", textAlign: "left" }}>KELAS</th>
              <th style={{ padding: "8px 10px", fontSize: 10, fontWeight: 800, color: "var(--muted)", textAlign: "left" }}>NAMA MURID</th>
              <th style={{ width: 32 }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const isError = !row.class_name || !row.full_name;
              return (
                <tr key={i} style={{ borderTop: "1px solid var(--border)", background: row._status === "added" ? "var(--matcha-pale)" : isError ? "#FFF5F7" : "white" }}>
                  <td style={{ padding: "4px 6px", fontSize: 11, color: "var(--muted)", textAlign: "center", fontWeight: 700 }}>{i + 1}</td>
                  <td style={{ padding: "4px 6px" }}>
                    <input
                      value={row.class_name}
                      onChange={e => update(i, "class_name", e.target.value)}
                      style={{ width: "100%", border: "none", outline: "none", fontSize: 13, fontWeight: 700, fontFamily: "var(--font-nunito), Nunito, sans-serif", background: "transparent", color: !row.class_name ? "var(--strawberry)" : "var(--charcoal)", padding: "4px 2px" }}
                      placeholder="Kelas…"
                    />
                  </td>
                  <td style={{ padding: "4px 6px" }}>
                    <input
                      value={row.full_name}
                      onChange={e => update(i, "full_name", e.target.value)}
                      style={{ width: "100%", border: "none", outline: "none", fontSize: 13, fontWeight: 600, fontFamily: "var(--font-nunito), Nunito, sans-serif", background: "transparent", color: !row.full_name ? "var(--strawberry)" : "var(--charcoal)", padding: "4px 2px" }}
                      placeholder="Nama murid…"
                    />
                  </td>
                  <td style={{ padding: "4px 6px", textAlign: "center" }}>
                    <button onClick={() => removeRow(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: 16, lineHeight: 1, padding: "2px 4px" }} title="Padam">×</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {rows.some(r => !r.class_name || !r.full_name) && (
        <div style={{ marginTop: 8, fontSize: 12, color: "var(--strawberry)", fontWeight: 700 }}>
          ⚠ Baris tanpa kelas atau nama akan diabaikan semasa import
        </div>
      )}
    </div>
  );
}
