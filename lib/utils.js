// ─── UTILITY FUNCTIONS ────────────────────────────────────────────────────────

export function formatDate(dateStr) {
  const d = new Date(dateStr);
  return { day: d.getDate(), month: d.toLocaleString("ms-MY", { month: "short" }).toUpperCase() };
}

export function calcStats(results, students) {
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

export function parseCSV(text) {
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

export function normalizeStr(s, doNormalize) {
  if (!doNormalize) return s;
  return s.trim().replace(/\s+/g, " ").toUpperCase();
}

// Detect which CSV column maps to which field (fuzzy match)
export function detectStudentCols(headers) {
  const find = (keywords) => headers.find(h => keywords.some(k => h.toUpperCase().includes(k))) || headers[0];
  return {
    kelas: find(["KELAS", "CLASS", "DARJAH"]),
    nama: find(["NAMA", "NAME", "MURID", "STUDENT"]),
  };
}

export function detectCurriculumCols(headers) {
  const find = (keywords, fallback) => headers.find(h => keywords.some(k => h.toUpperCase().includes(k))) || fallback || headers[0];
  return {
    tema: find(["TEMA", "THEME", "TOPIK"], headers[0]),
    tajuk: find(["TAJUK", "TAJUK PEMBELAJARAN", "LEARNING", "STANDARD"], headers[1] || headers[0]),
  };
}

// Auto-extract code from tajuk like "1.1.1 Mengenal pasti..."
export function extractTajukCode(tajuk) {
  const match = tajuk.match(/^(\d+(\.\d+)+)\s*/);
  if (match) return { code: match[1], title: tajuk.slice(match[0].length).trim() };
  return { code: "", title: tajuk.trim() };
}
