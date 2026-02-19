'use client';

import { useState } from "react";
import { Icons } from "@/components/ui/Icons";

export default function CreateSession({ curriculum, students, onSave, onBack }) {
  const classes = [...new Set(students.map(s => s.class_name))];
  const sets = [...new Set(curriculum.map(c => c.set_name))];
  const [form, setForm] = useState({
    tarikh: new Date().toISOString().split("T")[0],
    kelas: classes[0] || "",
    curriculum_set: sets[0] || "",
    tema: "",
    tajuk: "",
    catatan: "",
  });

  const themes = [...new Set(curriculum.filter(c => c.set_name === form.curriculum_set).map(c => c.tema))];
  const tajuks = curriculum.filter(c => c.set_name === form.curriculum_set && c.tema === form.tema);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const isValid = form.kelas && form.tema && form.tajuk;

  return (
    <div className="screen">
      <div className="header-bar">
        <button className="header-back" onClick={onBack}><Icons.back/></button>
        <div className="header-info">
          <div className="header-line1">Rekod Baru</div>
          <div className="header-line2">Maklumat Pentaksiran</div>
        </div>
      </div>
      <div style={{ padding: "12px 16px" }}>
        <div className="card">
          <div className="field-group">
            <div className="field-label">Tarikh</div>
            <input className="field-input" type="date" value={form.tarikh} onChange={e => set("tarikh", e.target.value)}/>
          </div>
          <div className="field-group">
            <div className="field-label">Kelas *</div>
            <select className="field-input" value={form.kelas} onChange={e => set("kelas", e.target.value)}>
              {classes.map(k => <option key={k}>{k}</option>)}
            </select>
          </div>
          <div className="field-group">
            <div className="field-label">Set Kurikulum *</div>
            <select className="field-input" value={form.curriculum_set} onChange={e => { set("curriculum_set", e.target.value); set("tema", ""); set("tajuk", ""); }}>
              {sets.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="field-group">
            <div className="field-label">Tema *</div>
            <select className="field-input" value={form.tema} onChange={e => { set("tema", e.target.value); set("tajuk", ""); }}>
              <option value="">— Pilih Tema —</option>
              {themes.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          {form.tema && (
            <div className="field-group">
              <div className="field-label">Tajuk *</div>
              <select className="field-input" value={form.tajuk} onChange={e => set("tajuk", e.target.value)}>
                <option value="">— Pilih Tajuk —</option>
                {tajuks.map(t => <option key={t.id} value={t.tajuk}>{t.tajuk}</option>)}
              </select>
            </div>
          )}
          <div className="field-group">
            <div className="field-label">Catatan Sesi</div>
            <input className="field-input" placeholder="Nota tambahan (pilihan)…" value={form.catatan} onChange={e => set("catatan", e.target.value)}/>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, margin: "4px 0" }}>
          <button className="btn btn-primary" style={{ flex: 2 }} disabled={!isValid} onClick={() => onSave(form)}>
            Mula Key-In →
          </button>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onBack}>Batal</button>
        </div>
      </div>
    </div>
  );
}
