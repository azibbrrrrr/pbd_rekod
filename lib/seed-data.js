// ─── SEED DATA ────────────────────────────────────────────────────────────────
export const SEED_STUDENTS = [
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

export const SEED_CURRICULUM = [
  { id: 1, set_name: "RBT Tahun 3 2026", tema: "1.0 Reka Bentuk & Teknologi", tajuk_code: "1.1.1", tajuk_title: "Mengenal pasti keperluan dan kehendak" },
  { id: 2, set_name: "RBT Tahun 3 2026", tema: "1.0 Reka Bentuk & Teknologi", tajuk_code: "1.1.2", tajuk_title: "Mengenal pasti masalah" },
  { id: 3, set_name: "RBT Tahun 3 2026", tema: "1.0 Reka Bentuk & Teknologi", tajuk_code: "1.2.1", tajuk_title: "Menjana idea reka bentuk" },
  { id: 4, set_name: "RBT Tahun 3 2026", tema: "2.0 Teknologi Pertanian", tajuk_code: "2.1.1", tajuk_title: "Jenis-jenis tanaman" },
  { id: 5, set_name: "RBT Tahun 3 2026", tema: "2.0 Teknologi Pertanian", tajuk_code: "2.1.2", tajuk_title: "Peralatan pertanian asas" },
  { id: 6, set_name: "RBT Tahun 3 2026", tema: "3.0 Kejuruteraan & Pembinaan", tajuk_code: "3.1.1", tajuk_title: "Struktur binaan asas" },
];

export const SEED_SESSIONS = [
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
