import { useState, useEffect, useRef, useCallback } from "react";

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const THEME = {
  strawberry: "#E8476A",
  strawberryLight: "#F9D0DA",
  strawberryPale: "#FDF0F3",
  strawberryDark: "#C4304F",
  matcha: "#7BAE7F",
  matchaLight: "#D4EDD5",
  matchaPale: "#F0F7F0",
  matchaDark: "#5A8C5E",
  cream: "#FFFAF8",
  charcoal: "#2D2020",
  muted: "#8A7070",
  border: "#F0D8DC",
  white: "#FFFFFF",
  shadow: "rgba(232, 71, 106, 0.12)",
};

// ─── SEED DATA ────────────────────────────────────────────────────────────────
const SEED_STUDENTS = [
  { id: 1, class_name: "3 AMETHYST", full_name: "Ahmad Faris bin Aziz" },
  { id: 2, class_name: "3 AMETHYST", full_name: "Siti Nur Aisyah" },
  { id: 3, class_name: "3 AMETHYST", full_name: "Muhammad Haziq" },
  { id: 4, class_name: "3 AMETHYST", full_name: "Nur Batrisyia" },
  { id: 5, class_name: "3 AMETHYST", full_name: "Amirul Afiq" },
  { id: 6, class_name: "3 AMETHYST", full_name: "Farah Diyana" },
  { id: 7, class_name: "3 AMETHYST", full_name: "Izzatul Husna" },
  { id: 8, class_name: "3 AMETHYST", full_name: "Luqman Hakim" },
  { id: 9, class_name: "3 AMETHYST", full_name: "Nur Izzati" },
  { id: 10, class_name: "3 AMETHYST", full_name: "Danish Irfan" },
  { id: 11, class_name: "3 AMETHYST", full_name: "Humaira Zahra" },
  { id: 12, class_name: "3 AMETHYST", full_name: "Ridhwan Arif" },
  { id: 13, class_name: "3 RUBY", full_name: "Alya Sofea" },
  { id: 14, class_name: "3 RUBY", full_name: "Zafran Hadif" },
  { id: 15, class_name: "3 RUBY", full_name: "Nur Hanis" },
  { id: 16, class_name: "3 RUBY", full_name: "Irfan Hadzri" },
];

const SEED_CURRICULUM = [
  { id: 1, set_name: "RBT Tahun 3 2026", tema: "1.0 Reka Bentuk & Teknologi", tajuk_code: "1.1.1", tajuk_title: "Mengenal pasti keperluan dan kehendak" },
  { id: 2, set_name: "RBT Tahun 3 2026", tema: "1.0 Reka Bentuk & Teknologi", tajuk_code: "1.1.2", tajuk_title: "Mengenal pasti masalah" },
  { id: 3, set_name: "RBT Tahun 3 2026", tema: "1.0 Reka Bentuk & Teknologi", tajuk_code: "1.2.1", tajuk_title: "Menjana idea reka bentuk" },
  { id: 4, set_name: "RBT Tahun 3 2026", tema: "2.0 Teknologi Pertanian", tajuk_code: "2.1.1", tajuk_title: "Jenis-jenis tanaman" },
  { id: 5, set_name: "RBT Tahun 3 2026", tema: "2.0 Teknologi Pertanian", tajuk_code: "2.1.2", tajuk_title: "Peralatan pertanian asas" },
  { id: 6, set_name: "RBT Tahun 3 2026", tema: "3.0 Kejuruteraan & Pembinaan", tajuk_code: "3.1.1", tajuk_title: "Struktur binaan asas" },
];

const SEED_SESSIONS = [
  {
    id: 1,
    tarikh: "2026-02-18",
    kelas: "3 AMETHYST",
    curriculum_set: "RBT Tahun 3 2026",
    tema: "1.0 Reka Bentuk & Teknologi",
    tajuk_code: "1.1.2",
    tajuk_title: "Mengenal pasti masalah",
    catatan: "",
    finalized: false,
    results: {
      1: "TP3", 2: "TP4", 3: "TP2", 4: "TP5", 5: "TP3",
      6: "", 7: "TD", 8: "TP4", 9: "TP3", 10: "TP2",
      11: "TP5", 12: "",
    }
  },
];

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Nunito:wght@400;500;600;700;800&display=swap');
  
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  
  body {
    font-family: 'Nunito', sans-serif;
    background: #FFFAF8;
    color: #2D2020;
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }

  :root {
    --strawberry: #E8476A;
    --strawberry-light: #F9D0DA;
    --strawberry-pale: #FDF0F3;
    --strawberry-dark: #C4304F;
    --matcha: #7BAE7F;
    --matcha-light: #D4EDD5;
    --matcha-pale: #F0F7F0;
    --cream: #FFFAF8;
    --charcoal: #2D2020;
    --muted: #8A7070;
    --border: #F0D8DC;
    --shadow: rgba(232,71,106,0.12);
  }

  .app-wrapper {
    max-width: 900px;
    margin: 0 auto;
    min-height: 100vh;
    position: relative;
  }

  /* Floral corner decorations */
  .floral-corner {
    position: fixed;
    width: 160px;
    height: 160px;
    pointer-events: none;
    z-index: 0;
    opacity: 0.18;
  }
  .floral-tl { top: 0; left: 0; }
  .floral-br { bottom: 0; right: 0; transform: rotate(180deg); }

  /* NAV */
  .bottom-nav {
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 900px;
    background: white;
    border-top: 1.5px solid var(--border);
    display: flex;
    z-index: 100;
    box-shadow: 0 -4px 20px var(--shadow);
  }
  .nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    padding: 10px 4px 8px;
    cursor: pointer;
    border: none;
    background: transparent;
    color: var(--muted);
    font-family: 'Nunito', sans-serif;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    transition: color 0.2s;
  }
  .nav-item.active { color: var(--strawberry); }
  .nav-item svg { width: 22px; height: 22px; }
  .nav-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: var(--strawberry);
    margin-top: 2px;
    opacity: 0;
    transition: opacity 0.2s;
  }
  .nav-item.active .nav-dot { opacity: 1; }

  /* SCREEN */
  .screen {
    padding: 0 0 80px 0;
    min-height: 100vh;
  }

  /* PAGE HEADER */
  .page-header {
    background: white;
    border-bottom: 1.5px solid var(--border);
    padding: 16px 20px;
    position: sticky;
    top: 0;
    z-index: 50;
  }
  .page-title {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    font-weight: 800;
    color: var(--strawberry);
    letter-spacing: -0.5px;
  }
  .page-subtitle { font-size: 12px; color: var(--muted); margin-top: 2px; }

  /* CARDS */
  .card {
    background: white;
    border: 1.5px solid var(--border);
    border-radius: 16px;
    padding: 16px;
    margin: 12px 16px;
  }
  .card-title {
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--muted);
    margin-bottom: 12px;
  }

  /* STAT CARDS */
  .stat-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin: 12px 16px;
  }
  .stat-card {
    background: white;
    border: 1.5px solid var(--border);
    border-radius: 14px;
    padding: 14px;
    text-align: center;
  }
  .stat-value {
    font-family: 'Playfair Display', serif;
    font-size: 28px;
    font-weight: 800;
    color: var(--strawberry);
    line-height: 1;
  }
  .stat-label {
    font-size: 11px;
    color: var(--muted);
    font-weight: 600;
    margin-top: 4px;
  }

  /* TP CHIPS */
  .tp-chip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 38px;
    height: 34px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 800;
    cursor: pointer;
    border: 2px solid transparent;
    transition: all 0.15s;
    user-select: none;
    letter-spacing: 0.3px;
  }
  .tp-chip.empty {
    background: #F5ECEE;
    color: #C4A0A8;
    border-color: #EDDBDF;
  }
  .tp-chip.empty:hover {
    background: var(--strawberry-light);
    color: var(--strawberry-dark);
    border-color: var(--strawberry-light);
  }
  .tp-chip.selected-tp {
    background: var(--strawberry);
    color: white;
    border-color: var(--strawberry-dark);
    box-shadow: 0 3px 10px rgba(232,71,106,0.35);
  }
  .tp-chip.selected-td {
    background: var(--matcha);
    color: white;
    border-color: var(--matcha-dark);
    box-shadow: 0 3px 10px rgba(123,174,127,0.35);
  }

  /* STUDENT ROW */
  .student-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--border);
    animation: fadeSlide 0.3s ease both;
  }
  .student-row:last-child { border-bottom: none; }
  @keyframes fadeSlide {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .student-bil {
    width: 26px;
    font-size: 11px;
    font-weight: 800;
    color: var(--muted);
    text-align: center;
    flex-shrink: 0;
  }
  .student-name {
    flex: 1;
    font-size: 13.5px;
    font-weight: 700;
    color: var(--charcoal);
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .tp-chips-row {
    display: flex;
    gap: 5px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* PILL BADGE */
  .pill {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.3px;
  }
  .pill-pink { background: var(--strawberry-light); color: var(--strawberry-dark); }
  .pill-green { background: var(--matcha-light); color: var(--matcha-dark); }
  .pill-gray { background: #F0EBEC; color: var(--muted); }

  /* BUTTON */
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 11px 20px;
    border-radius: 12px;
    font-family: 'Nunito', sans-serif;
    font-size: 14px;
    font-weight: 800;
    cursor: pointer;
    border: none;
    transition: all 0.15s;
    letter-spacing: 0.2px;
  }
  .btn-primary {
    background: var(--strawberry);
    color: white;
    box-shadow: 0 4px 14px rgba(232,71,106,0.35);
  }
  .btn-primary:hover { background: var(--strawberry-dark); transform: translateY(-1px); }
  .btn-secondary {
    background: white;
    color: var(--strawberry);
    border: 2px solid var(--strawberry-light);
  }
  .btn-secondary:hover { background: var(--strawberry-pale); }
  .btn-green {
    background: var(--matcha);
    color: white;
    box-shadow: 0 4px 14px rgba(123,174,127,0.35);
  }
  .btn-ghost {
    background: transparent;
    color: var(--muted);
    padding: 8px 12px;
    font-size: 13px;
  }
  .btn-sm { padding: 7px 14px; font-size: 12px; border-radius: 10px; }
  .btn-full { width: 100%; justify-content: center; }

  /* INPUT */
  .field-label {
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--muted);
    margin-bottom: 6px;
  }
  .field-input {
    width: 100%;
    padding: 11px 14px;
    border: 2px solid var(--border);
    border-radius: 12px;
    font-family: 'Nunito', sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: var(--charcoal);
    background: white;
    outline: none;
    transition: border-color 0.2s;
  }
  .field-input:focus { border-color: var(--strawberry); }
  .field-group { margin-bottom: 14px; }

  /* SESSION CARD */
  .session-card {
    background: white;
    border: 1.5px solid var(--border);
    border-radius: 16px;
    padding: 14px 16px;
    margin: 8px 16px;
    cursor: pointer;
    transition: all 0.15s;
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }
  .session-card:hover {
    border-color: var(--strawberry-light);
    box-shadow: 0 4px 16px var(--shadow);
    transform: translateY(-1px);
  }
  .session-date-box {
    background: var(--strawberry-pale);
    border-radius: 10px;
    padding: 8px 10px;
    text-align: center;
    min-width: 48px;
    flex-shrink: 0;
  }
  .session-date-day {
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    font-weight: 800;
    color: var(--strawberry);
    line-height: 1;
  }
  .session-date-month {
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    color: var(--muted);
  }
  .session-info { flex: 1; min-width: 0; }
  .session-kelas { font-size: 12px; font-weight: 800; color: var(--strawberry); margin-bottom: 2px; }
  .session-tema { font-size: 13px; font-weight: 700; color: var(--charcoal); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .session-tajuk { font-size: 12px; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  /* FAB */
  .fab {
    position: fixed;
    bottom: 80px;
    right: 20px;
    width: 54px;
    height: 54px;
    border-radius: 50%;
    background: var(--strawberry);
    color: white;
    border: none;
    font-size: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 6px 20px rgba(232,71,106,0.45);
    transition: all 0.2s;
    z-index: 90;
  }
  .fab:hover { transform: scale(1.08) rotate(8deg); background: var(--strawberry-dark); }

  /* BULK SECTION */
  .bulk-bar {
    background: var(--strawberry-pale);
    border-bottom: 2px solid var(--strawberry-light);
    padding: 12px 16px;
    position: sticky;
    top: 56px;
    z-index: 40;
  }
  .bulk-label { font-size: 11px; font-weight: 800; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
  .bulk-chips { display: flex; gap: 6px; flex-wrap: wrap; }

  /* FILTER ROW */
  .filter-row {
    display: flex;
    gap: 8px;
    padding: 12px 16px;
    overflow-x: auto;
    background: white;
    border-bottom: 1px solid var(--border);
  }
  .filter-row::-webkit-scrollbar { display: none; }
  .filter-chip {
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
    border: 1.5px solid var(--border);
    background: white;
    color: var(--muted);
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.15s;
  }
  .filter-chip.active {
    background: var(--strawberry);
    color: white;
    border-color: var(--strawberry);
  }

  /* SEARCH */
  .search-input {
    width: calc(100% - 32px);
    margin: 12px 16px;
    padding: 10px 14px 10px 38px;
    border: 2px solid var(--border);
    border-radius: 12px;
    font-family: 'Nunito', sans-serif;
    font-size: 14px;
    font-weight: 600;
    outline: none;
    background: white url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%238A7070' stroke-width='2.5'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.35-4.35'/%3E%3C/svg%3E") no-repeat 12px center;
    transition: border-color 0.2s;
  }
  .search-input:focus { border-color: var(--strawberry); }

  /* PROGRESS BAR */
  .progress-bar-wrap {
    background: var(--strawberry-light);
    border-radius: 20px;
    height: 8px;
    overflow: hidden;
  }
  .progress-bar-fill {
    height: 100%;
    background: var(--strawberry);
    border-radius: 20px;
    transition: width 0.4s;
  }

  /* MODAL / OVERLAY */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(45,32,32,0.4);
    z-index: 200;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    backdrop-filter: blur(2px);
    animation: fadeIn 0.2s;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .modal-sheet {
    background: white;
    border-radius: 20px 20px 0 0;
    padding: 20px;
    width: 100%;
    max-width: 900px;
    max-height: 80vh;
    overflow-y: auto;
    animation: slideUp 0.25s ease;
  }
  @keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  .modal-handle {
    width: 36px; height: 4px;
    background: var(--border);
    border-radius: 2px;
    margin: 0 auto 16px;
  }
  .modal-title {
    font-family: 'Playfair Display', serif;
    font-size: 18px;
    font-weight: 800;
    color: var(--charcoal);
    margin-bottom: 16px;
  }

  /* SNACKBAR */
  .snackbar {
    position: fixed;
    bottom: 90px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--charcoal);
    color: white;
    padding: 10px 20px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 12px;
    z-index: 300;
    animation: snackIn 0.3s ease;
    white-space: nowrap;
    box-shadow: 0 4px 20px rgba(0,0,0,0.25);
  }
  @keyframes snackIn { from { transform: translateX(-50%) translateY(20px); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }
  .snackbar-undo {
    color: var(--strawberry-light);
    font-weight: 800;
    cursor: pointer;
    text-decoration: underline;
  }

  /* DISTRIBUTION BAR */
  .dist-bars { display: flex; gap: 4px; align-items: flex-end; height: 60px; }
  .dist-bar { flex: 1; border-radius: 6px 6px 0 0; transition: height 0.4s; position: relative; min-width: 30px; }
  .dist-bar-label { font-size: 10px; font-weight: 800; text-align: center; margin-top: 4px; color: var(--muted); }
  .dist-bar-count { position: absolute; top: -18px; left: 50%; transform: translateX(-50%); font-size: 11px; font-weight: 800; color: var(--charcoal); }

  /* ONBOARDING */
  .onboard-hero {
    text-align: center;
    padding: 60px 24px 40px;
  }
  .app-logo {
    font-family: 'Playfair Display', serif;
    font-size: 36px;
    font-weight: 800;
    color: var(--strawberry);
    letter-spacing: -1px;
    line-height: 1.1;
  }
  .app-tagline {
    font-size: 14px;
    color: var(--muted);
    font-weight: 600;
    margin-top: 8px;
  }
  .strawberry-emoji { font-size: 56px; margin-bottom: 16px; }

  /* EMPTY STATE */
  .empty-state {
    text-align: center;
    padding: 48px 24px;
    color: var(--muted);
  }
  .empty-icon { font-size: 40px; margin-bottom: 12px; }
  .empty-text { font-size: 14px; font-weight: 600; }

  /* HEADER BAR */
  .header-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: white;
    border-bottom: 1.5px solid var(--border);
    position: sticky;
    top: 0;
    z-index: 50;
  }
  .header-back {
    width: 36px; height: 36px;
    border-radius: 10px;
    background: var(--strawberry-pale);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--strawberry);
    flex-shrink: 0;
  }
  .header-info { flex: 1; min-width: 0; }
  .header-line1 { font-size: 13px; font-weight: 800; color: var(--charcoal); }
  .header-line2 { font-size: 11px; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  
  /* IMPORT DROPZONE */
  .drop-zone {
    border: 2.5px dashed var(--strawberry-light);
    border-radius: 16px;
    padding: 32px;
    text-align: center;
    background: var(--strawberry-pale);
    cursor: pointer;
    transition: all 0.2s;
  }
  .drop-zone:hover { border-color: var(--strawberry); background: var(--strawberry-light); }
  .drop-icon { font-size: 32px; margin-bottom: 8px; }
  .drop-text { font-size: 14px; font-weight: 700; color: var(--strawberry); }
  .drop-hint { font-size: 12px; color: var(--muted); margin-top: 4px; }

  /* DIVIDER */
  .divider { height: 1px; background: var(--border); margin: 16px 0; }
  .section-label {
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: var(--muted);
    padding: 16px 16px 8px;
  }

  /* ANALYSIS TABLE */
  .data-table { width: 100%; border-collapse: collapse; }
  .data-table th {
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--muted);
    padding: 8px 10px;
    text-align: left;
    border-bottom: 1.5px solid var(--border);
    background: var(--strawberry-pale);
  }
  .data-table td {
    padding: 10px 10px;
    font-size: 13px;
    font-weight: 600;
    border-bottom: 1px solid var(--border);
  }
  .data-table tr:hover td { background: var(--strawberry-pale); }

  /* REVIEW */
  .review-list-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 16px;
    border-bottom: 1px solid var(--border);
    font-size: 13px;
    font-weight: 600;
  }

  .key-in-footer {
    position: sticky;
    bottom: 0;
    background: white;
    border-top: 1.5px solid var(--border);
    padding: 10px 16px;
    display: flex;
    gap: 8px;
    align-items: center;
    z-index: 30;
  }

  @media (max-width: 480px) {
    .tp-chip { min-width: 33px; height: 30px; font-size: 11px; }
    .stat-value { font-size: 24px; }
  }
`;

// ─── SVG DECORATIONS ─────────────────────────────────────────────────────────
const FloralCorner = () => (
  <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="14" fill="#E8476A" opacity="0.6"/>
    <circle cx="44" cy="10" r="9" fill="#E8476A" opacity="0.4"/>
    <circle cx="10" cy="44" r="9" fill="#E8476A" opacity="0.4"/>
    <circle cx="60" cy="22" r="6" fill="#7BAE7F" opacity="0.5"/>
    <circle cx="22" cy="60" r="6" fill="#7BAE7F" opacity="0.5"/>
    <circle cx="38" cy="38" r="5" fill="#F9D0DA" opacity="0.7"/>
    <circle cx="80" cy="15" r="5" fill="#E8476A" opacity="0.3"/>
    <circle cx="15" cy="80" r="5" fill="#E8476A" opacity="0.3"/>
    <path d="M5 5 Q30 5 30 30 Q30 5 55 5" stroke="#E8476A" strokeWidth="1.5" fill="none" opacity="0.4"/>
    <path d="M5 5 Q5 30 30 30 Q5 30 5 55" stroke="#E8476A" strokeWidth="1.5" fill="none" opacity="0.4"/>
    <circle cx="95" cy="20" r="4" fill="#F9D0DA" opacity="0.5"/>
    <circle cx="20" cy="95" r="4" fill="#F9D0DA" opacity="0.5"/>
    <circle cx="70" cy="70" r="3" fill="#7BAE7F" opacity="0.3"/>
  </svg>
);

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icons = {
  rekod: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 7h8M8 12h8M8 17h5"/></svg>,
  analisis: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  laporan: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  tetapan: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  back: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>,
  plus: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  check: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>,
  upload: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
};

const TP_OPTIONS = ["TP1", "TP2", "TP3", "TP4", "TP5", "TP6", "TD"];
const TP_COLORS = {
  TP1: "#E8476A", TP2: "#E8688A", TP3: "#7BAE7F",
  TP4: "#5A9660", TP5: "#3D7042", TP6: "#2A5030", TD: "#A0A0A0"
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return { day: d.getDate(), month: d.toLocaleString("ms-MY", { month: "short" }).toUpperCase() };
}
function calcStats(results, students) {
  const studentIds = students.map(s => s.id);
  const filled = studentIds.filter(id => results[id] && results[id] !== "TD");
  const tdCount = studentIds.filter(id => results[id] === "TD").length;
  const empty = studentIds.filter(id => !results[id]);
  const tpVals = filled.map(id => parseInt(results[id].replace("TP", ""))).filter(v => !isNaN(v));
  const avg = tpVals.length ? (tpVals.reduce((a, b) => a + b, 0) / tpVals.length).toFixed(1) : "–";
  const dist = {};
  ["TP1","TP2","TP3","TP4","TP5","TP6"].forEach(tp => {
    dist[tp] = studentIds.filter(id => results[id] === tp).length;
  });
  return { filled: filled.length, tdCount, emptyCount: empty.length, avg, dist, total: studentIds.length };
}

// ─── SNACKBAR COMPONENT ───────────────────────────────────────────────────────
function Snackbar({ msg, onUndo, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="snackbar">
      <span>{msg}</span>
      {onUndo && <span className="snackbar-undo" onClick={onUndo}>UNDO</span>}
    </div>
  );
}

// ─── CSV PARSER UTILITY ──────────────────────────────────────────────────────
function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return { headers: [], rows: [] };
  // Detect delimiter: comma or semicolon
  const delim = lines[0].includes(";") ? ";" : ",";
  const headers = lines[0].split(delim).map(h => h.trim().replace(/^["']|["']$/g, ""));
  const rows = lines.slice(1).map(line => {
    const cols = line.split(delim).map(c => c.trim().replace(/^["']|["']$/g, ""));
    const obj = {};
    headers.forEach((h, i) => { obj[h] = cols[i] || ""; });
    return obj;
  }).filter(row => Object.values(row).some(v => v !== ""));
  return { headers, rows };
}

function normalizeStr(s, doNormalize) {
  if (!doNormalize) return s;
  return s.trim().replace(/\s+/g, " ").toUpperCase();
}

// Detect which CSV column maps to which field (fuzzy match)
function detectStudentCols(headers) {
  const find = (keywords) => headers.find(h => keywords.some(k => h.toUpperCase().includes(k))) || headers[0];
  return {
    kelas: find(["KELAS", "CLASS", "DARJAH"]),
    nama: find(["NAMA", "NAME", "MURID", "STUDENT"]),
  };
}
function detectCurriculumCols(headers) {
  const find = (keywords, fallback) => headers.find(h => keywords.some(k => h.toUpperCase().includes(k))) || fallback || headers[0];
  return {
    tema: find(["TEMA", "THEME", "TOPIK"], headers[0]),
    tajuk: find(["TAJUK", "TAJUK PEMBELAJARAN", "LEARNING", "STANDARD"], headers[1] || headers[0]),
  };
}

// Auto-extract code from tajuk like "1.1.1 Mengenal pasti..."
function extractTajukCode(tajuk) {
  const match = tajuk.match(/^(\d+(\.\d+)+)\s*/);
  if (match) return { code: match[1], title: tajuk.slice(match[0].length).trim() };
  return { code: "", title: tajuk.trim() };
}

// ─── EDITABLE STUDENT TABLE ──────────────────────────────────────────────────
function EditableStudentTable({ rows, onChange }) {
  const update = (i, field, val) => {
    const next = rows.map((r, idx) => idx === i ? { ...r, [field]: val } : r);
    onChange(next);
  };
  const addRow = () => onChange([...rows, { class_name: "", full_name: "", _status: "added" }]);
  const removeRow = (i) => onChange(rows.filter((_, idx) => idx !== i));

  // Group by class for display, but keep flat editing
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
                      style={{ width: "100%", border: "none", outline: "none", fontSize: 13, fontWeight: 700, fontFamily: "Nunito, sans-serif", background: "transparent", color: !row.class_name ? "var(--strawberry)" : "var(--charcoal)", padding: "4px 2px" }}
                      placeholder="Kelas…"
                    />
                  </td>
                  <td style={{ padding: "4px 6px" }}>
                    <input
                      value={row.full_name}
                      onChange={e => update(i, "full_name", e.target.value)}
                      style={{ width: "100%", border: "none", outline: "none", fontSize: 13, fontWeight: 600, fontFamily: "Nunito, sans-serif", background: "transparent", color: !row.full_name ? "var(--strawberry)" : "var(--charcoal)", padding: "4px 2px" }}
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

// ─── EDITABLE CURRICULUM TABLE ────────────────────────────────────────────────
function EditableCurriculumTable({ rows, onChange }) {
  const update = (i, field, val) => {
    const next = rows.map((r, idx) => idx === i ? { ...r, [field]: val } : r);
    onChange(next);
  };
  const addRow = () => onChange([...rows, { tema: "", tajuk_code: "", tajuk_title: "", _status: "added" }]);
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
              <th style={{ padding: "8px 8px", fontSize: 10, fontWeight: 800, color: "var(--muted)", textAlign: "left", width: "15%" }}>KOD</th>
              <th style={{ padding: "8px 8px", fontSize: 10, fontWeight: 800, color: "var(--muted)", textAlign: "left" }}>TAJUK</th>
              <th style={{ width: 28 }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const isError = !row.tema || !row.tajuk_title;
              return (
                <tr key={i} style={{ borderTop: "1px solid var(--border)", background: row._status === "added" ? "var(--matcha-pale)" : isError ? "#FFF5F7" : "white" }}>
                  <td style={{ padding: "4px", fontSize: 11, color: "var(--muted)", textAlign: "center", fontWeight: 700 }}>{i + 1}</td>
                  <td style={{ padding: "4px 6px" }}>
                    <input
                      value={row.tema}
                      onChange={e => update(i, "tema", e.target.value)}
                      style={{ width: "100%", border: "none", outline: "none", fontSize: 12, fontWeight: 700, fontFamily: "Nunito, sans-serif", background: "transparent", color: !row.tema ? "var(--strawberry)" : "var(--charcoal)", padding: "4px 2px" }}
                      placeholder="Tema…"
                    />
                  </td>
                  <td style={{ padding: "4px 6px" }}>
                    <input
                      value={row.tajuk_code}
                      onChange={e => update(i, "tajuk_code", e.target.value)}
                      style={{ width: "100%", border: "none", outline: "none", fontSize: 12, fontWeight: 800, fontFamily: "Nunito, sans-serif", background: "transparent", color: "var(--strawberry)", padding: "4px 2px" }}
                      placeholder="1.1.1"
                    />
                  </td>
                  <td style={{ padding: "4px 6px" }}>
                    <input
                      value={row.tajuk_title}
                      onChange={e => update(i, "tajuk_title", e.target.value)}
                      style={{ width: "100%", border: "none", outline: "none", fontSize: 12, fontWeight: 600, fontFamily: "Nunito, sans-serif", background: "transparent", color: !row.tajuk_title ? "var(--strawberry)" : "var(--charcoal)", padding: "4px 2px" }}
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
      {rows.some(r => !r.tema || !r.tajuk_title) && (
        <div style={{ marginTop: 8, fontSize: 12, color: "var(--strawberry)", fontWeight: 700 }}>
          ⚠ Baris tanpa tema atau tajuk akan diabaikan semasa import
        </div>
      )}
    </div>
  );
}

// ─── ONBOARDING ───────────────────────────────────────────────────────────────
function OnboardingScreen({ onComplete }) {
  const [step, setStep] = useState(0);

  // Step 1 — Students state
  const [studentRows, setStudentRows] = useState([]);
  const [studentError, setStudentError] = useState("");
  const [trimCaps, setTrimCaps] = useState(true);
  const [importSummary, setImportSummary] = useState(null); // { added, skipped, errors }
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
      if (rows.length === 0) { setStudentError("Fail CSV kosong atau format tidak dikenali."); return; }
      const cols = detectStudentCols(headers);
      const seen = new Set();
      let added = 0, skipped = 0, errors = 0;
      const parsed = [];
      rows.forEach((row, i) => {
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
      if (rows.length === 0) { setCurriculumError("Fail CSV kosong atau format tidak dikenali."); return; }
      const cols = detectCurriculumCols(headers);
      let added = 0, errors = 0;
      const parsed = [];
      rows.forEach(row => {
        const tema = (row[cols.tema] || "").trim();
        const tajukRaw = (row[cols.tajuk] || "").trim();
        if (!tema || !tajukRaw) { errors++; return; }
        let tajuk_code = "";
        let tajuk_title = tajukRaw;
        if (autoSplitCode) {
          const extracted = extractTajukCode(tajukRaw);
          tajuk_code = extracted.code;
          tajuk_title = extracted.title || tajukRaw;
        }
        parsed.push({ tema, tajuk_code, tajuk_title });
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

  // ── Finalize: validate + pass data up ────────────────────────────────────
  const finalize = () => {
    const validStudents = studentRows
      .filter(r => r.class_name && r.full_name)
      .map((r, i) => ({ id: i + 1, class_name: r.class_name, full_name: r.full_name }));
    const validCurriculum = curriculumRows
      .filter(r => r.tema && r.tajuk_title)
      .map((r, i) => ({ id: i + 1, set_name: setName || "Set Kurikulum", ...r }));
    onComplete(
      validStudents.length ? validStudents : null,
      validCurriculum.length ? validCurriculum : null
    );
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
        <button className="btn btn-ghost btn-full" onClick={() => onComplete(null, null)}>Guna data contoh & langkau</button>
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
  const validCurrCount = curriculumRows.filter(r => r.tema && r.tajuk_title).length;

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

        {/* Options */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <input type="checkbox" id="autoCode" checked={autoSplitCode} onChange={e => setAutoSplitCode(e.target.checked)} style={{ accentColor: "var(--strawberry)", width: 16, height: 16 }}/>
          <label htmlFor="autoCode" style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)", cursor: "pointer" }}>
            Auto-extract kod dari tajuk (cth. "1.1.1 Mengenal pasti…" → kod: 1.1.1)
          </label>
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
              Kod tajuk (1.1.1) boleh disertakan terus dalam lajur TAJUK — ia akan diasingkan secara automatik jika "Auto-extract kod" diaktifkan.
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
        <button className="btn btn-green" style={{ flex: 2 }} onClick={finalize}>
          Selesai — Pergi Rekod ✓ {validCurrCount > 0 ? `(${validCurrCount} tajuk)` : ""}
        </button>
        <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => onComplete(null, null)}>Langkau</button>
      </div>
    </div>
  );
}

// ─── REKOD HOME ───────────────────────────────────────────────────────────────
function RekodHome({ sessions, students, onOpenSession, onNewSession }) {
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

// ─── CREATE SESSION ────────────────────────────────────────────────────────────
function CreateSession({ curriculum, students, onSave, onBack }) {
  const classes = [...new Set(students.map(s => s.class_name))];
  const sets = [...new Set(curriculum.map(c => c.set_name))];
  const [form, setForm] = useState({
    tarikh: new Date().toISOString().split("T")[0],
    kelas: classes[0] || "",
    curriculum_set: sets[0] || "",
    tema: "",
    tajuk_code: "",
    tajuk_title: "",
    catatan: "",
  });

  const themes = [...new Set(curriculum.filter(c => c.set_name === form.curriculum_set).map(c => c.tema))];
  const tajuks = curriculum.filter(c => c.set_name === form.curriculum_set && c.tema === form.tema);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const isValid = form.kelas && form.tema && form.tajuk_code;

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
            <select className="field-input" value={form.curriculum_set} onChange={e => { set("curriculum_set", e.target.value); set("tema", ""); set("tajuk_code", ""); }}>
              {sets.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="field-group">
            <div className="field-label">Tema *</div>
            <select className="field-input" value={form.tema} onChange={e => { set("tema", e.target.value); set("tajuk_code", ""); }}>
              <option value="">— Pilih Tema —</option>
              {themes.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          {form.tema && (
            <div className="field-group">
              <div className="field-label">Tajuk *</div>
              <select className="field-input" value={form.tajuk_code} onChange={e => {
                const t = tajuks.find(t => t.tajuk_code === e.target.value);
                set("tajuk_code", e.target.value);
                set("tajuk_title", t ? t.tajuk_title : "");
              }}>
                <option value="">— Pilih Tajuk —</option>
                {tajuks.map(t => <option key={t.id} value={t.tajuk_code}>{t.tajuk_code} · {t.tajuk_title}</option>)}
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

// ─── KEY-IN SCREEN ────────────────────────────────────────────────────────────
function KeyInScreen({ session, students, onUpdateResult, onFinish, onBack }) {
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
          <div className="header-line2">{session.tajuk_code} · {session.tajuk_title}</div>
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
            <button key={tp} className={`tp-chip ${tp === "TD" ? "empty" : "empty"}`}
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

// ─── SESSION REVIEW ────────────────────────────────────────────────────────────
function ReviewScreen({ session, students, onBack, onEdit }) {
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

// ─── ANALISIS ──────────────────────────────────────────────────────────────────
function AnalisisScreen({ sessions, students }) {
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

// ─── LAPORAN ──────────────────────────────────────────────────────────────────
function LaporanScreen({ sessions, students }) {
  const [tab, setTab] = useState("Sesi");
  const [selectedSession, setSelectedSession] = useState(sessions[0] || null);
  const tabs = ["Sesi", "Murid", "Kelas"];

  const renderSesi = () => {
    if (!selectedSession) return <div className="empty-state"><div className="empty-icon">📋</div><div className="empty-text">Tiada sesi</div></div>;
    const studs = students.filter(s => s.class_name === selectedSession.kelas);
    const stats = calcStats(selectedSession.results, studs);
    const distColors = ["#E8476A","#E8688A","#7BAE7F","#5A9660","#3D7042","#2A5030"];
    return (
      <div>
        <div style={{ padding: "12px 16px" }}>
          <div className="field-label">Pilih Sesi</div>
          <select className="field-input" value={selectedSession.id} onChange={e => setSelectedSession(sessions.find(s => s.id == e.target.value))}>
            {sessions.map(s => <option key={s.id} value={s.id}>{s.tarikh} · {s.kelas} · {s.tajuk_code}</option>)}
          </select>
        </div>
        <div className="card" style={{ background: "var(--strawberry-pale)", border: "2px solid var(--strawberry-light)" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "var(--strawberry)", marginBottom: 4 }}>LAPORAN SESI PBD</div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>Tarikh: {selectedSession.tarikh}</div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>Kelas: {selectedSession.kelas}</div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>Tema: {selectedSession.tema}</div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>Tajuk: {selectedSession.tajuk_code} · {selectedSession.tajuk_title}</div>
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
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => window.print()}>🖨 Cetak</button>
          <button className="btn btn-green" style={{ flex: 1 }}>⬇ PDF</button>
        </div>
      </div>
    );
  };

  const renderMurid = () => {
    const classes = [...new Set(students.map(s => s.class_name))];
    return (
      <div style={{ padding: "12px 16px" }}>
        {students.map(student => {
          const sessResults = sessions.filter(s => s.kelas === student.class_name);
          const tps = sessResults.map(s => s.results[student.id]).filter(r => r && r !== "TD");
          const avg = tps.length ? (tps.map(t => parseInt(t.replace("TP",""))).reduce((a,b)=>a+b,0)/tps.length).toFixed(1) : "–";
          return (
            <div key={student.id} className="card" style={{ marginLeft: 0, marginRight: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>{student.full_name}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{student.class_name}</div>
                </div>
                {avg !== "–" && <span className="pill pill-pink" style={{ fontSize: 14 }}>Avg: {avg}</span>}
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
    const classes = [...new Set(students.map(s => s.class_name))];
    return (
      <div style={{ padding: "12px 16px" }}>
        {classes.map(kelas => {
          const studs = students.filter(s => s.class_name === kelas);
          const sess = sessions.filter(s => s.kelas === kelas);
          const allResults = sess.flatMap(s => studs.map(st => s.results[st.id]).filter(r => r && r !== "TD"));
          const avg = allResults.length ? (allResults.map(t => parseInt(t.replace("TP",""))).reduce((a,b)=>a+b,0)/allResults.length).toFixed(1) : "–";
          const lowTP = studs.filter(s => {
            const tps = sess.map(ses => ses.results[s.id]).filter(r => r && r !== "TD");
            const a = tps.length ? tps.map(t => parseInt(t.replace("TP",""))).reduce((a,b)=>a+b,0)/tps.length : null;
            return a !== null && a <= 2;
          });
          return (
            <div key={kelas} className="card" style={{ marginLeft: 0, marginRight: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontWeight: 800, fontSize: 16 }}>🏫 {kelas}</div>
                <span className="pill pill-pink">Avg: {avg}</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>{studs.length} murid · {sess.length} sesi</div>
              {lowTP.length > 0 && (
                <div style={{ marginTop: 10, padding: "8px 10px", background: "var(--strawberry-pale)", borderRadius: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "var(--strawberry)", marginBottom: 4 }}>⚠ Perlu Perhatian ({lowTP.length})</div>
                  {lowTP.map(s => <div key={s.id} style={{ fontSize: 12, fontWeight: 600 }}>· {s.full_name}</div>)}
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

// ─── TETAPAN ──────────────────────────────────────────────────────────────────
function TetapanScreen({ students, curriculum, onAddStudent, onImportStudents }) {
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

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [onboarded, setOnboarded] = useState(false);
  const [activeTab, setActiveTab] = useState("rekod");
  const [sessions, setSessions] = useState(SEED_SESSIONS);
  const [students, setStudents] = useState(SEED_STUDENTS);
  const [curriculum, setCurriculum] = useState(SEED_CURRICULUM);
  const [view, setView] = useState("home"); // home | create | keyin | review
  const [activeSession, setActiveSession] = useState(null);

  const openSession = (session) => {
    setActiveSession(session);
    setView("keyin");
  };

  const newSession = () => setView("create");

  const saveNewSession = (form) => {
    const newSess = {
      id: Date.now(),
      ...form,
      finalized: false,
      results: {},
    };
    setSessions(prev => [...prev, newSess]);
    setActiveSession(newSess);
    setView("keyin");
  };

  const updateResult = useCallback((studentId, tp) => {
    setSessions(prev => prev.map(s => s.id === activeSession.id
      ? { ...s, results: { ...s.results, [studentId]: tp } }
      : s
    ));
    setActiveSession(prev => ({ ...prev, results: { ...prev.results, [studentId]: tp } }));
  }, [activeSession]);

  const navItems = [
    { key: "rekod", label: "Rekod", Icon: Icons.rekod },
    { key: "analisis", label: "Analisis", Icon: Icons.analisis },
    { key: "laporan", label: "Laporan", Icon: Icons.laporan },
    { key: "tetapan", label: "Tetapan", Icon: Icons.tetapan },
  ];

  if (!onboarded) return (
    <>
      <style>{globalCSS}</style>
      <div className="app-wrapper">
        <svg className="floral-corner floral-tl" viewBox="0 0 160 160"><FloralCorner/></svg>
        <svg className="floral-corner floral-br" viewBox="0 0 160 160"><FloralCorner/></svg>
        <OnboardingScreen onComplete={(importedStudents, importedCurriculum) => {
          if (importedStudents) setStudents(importedStudents);
          if (importedCurriculum) setCurriculum(importedCurriculum);
          // Reset sessions since student IDs may have changed
          if (importedStudents) setSessions([]);
          setOnboarded(true);
        }}/>
      </div>
    </>
  );

  // Full screen views (no nav)
  if (view === "create") return (
    <>
      <style>{globalCSS}</style>
      <div className="app-wrapper">
        <CreateSession curriculum={curriculum} students={students} onSave={saveNewSession} onBack={() => setView("home")}/>
      </div>
    </>
  );

  if (view === "keyin" && activeSession) {
    const currentSession = sessions.find(s => s.id === activeSession.id) || activeSession;
    return (
      <>
        <style>{globalCSS}</style>
        <div className="app-wrapper">
          <KeyInScreen session={currentSession} students={students} onUpdateResult={updateResult}
            onFinish={() => setView("review")} onBack={() => setView("home")}/>
        </div>
      </>
    );
  }

  if (view === "review" && activeSession) {
    const currentSession = sessions.find(s => s.id === activeSession.id) || activeSession;
    return (
      <>
        <style>{globalCSS}</style>
        <div className="app-wrapper">
          <ReviewScreen session={currentSession} students={students}
            onBack={() => { setView("home"); setActiveSession(null); }}
            onEdit={() => setView("keyin")}/>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{globalCSS}</style>
      <div className="app-wrapper">
        <svg className="floral-corner floral-tl" viewBox="0 0 160 160" style={{ opacity: 0.12 }}><FloralCorner/></svg>
        <svg className="floral-corner floral-br" viewBox="0 0 160 160" style={{ opacity: 0.12 }}><FloralCorner/></svg>

        {activeTab === "rekod" && (
          <RekodHome sessions={sessions} students={students} onOpenSession={openSession} onNewSession={newSession}/>
        )}
        {activeTab === "analisis" && (
          <AnalisisScreen sessions={sessions} students={students}/>
        )}
        {activeTab === "laporan" && (
          <LaporanScreen sessions={sessions} students={students}/>
        )}
        {activeTab === "tetapan" && (
          <TetapanScreen students={students} curriculum={curriculum}/>
        )}

        <nav className="bottom-nav">
          {navItems.map(({ key, label, Icon }) => (
            <button key={key} className={`nav-item ${activeTab === key ? "active" : ""}`} onClick={() => setActiveTab(key)}>
              <Icon/>
              {label}
              <div className="nav-dot"/>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
