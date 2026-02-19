* Goal: teacher key-in TP faster than Excel/Google Sheet

* Key-in UI: per student row shows TP1–TP6 \+ TD (tap to set)

* Bulk: “Mark all students” with 1 TP \+ “Fill empty”

* Seed data: dynamic (Settings), import CSV for:

  * Students: KELAS, NAMA MURID

  * Curriculum: TEMA, TAJUK (auto-split code like 1.1.1)

---

# **IA (Information Architecture)**

Bottom nav (mobile) / top nav (web):

1. Rekod (Key-in / Sessions)

2. Analisis

3. Laporan

4. Tetapan

---

# **0\) Onboarding & Setup (first run)**

## **Screen 0.1 — Welcome**

Content

* App name \+ tagline

* CTA: Mula

* Secondary: Import data later

Behavior

* If no student list exists → force at least student import before key-in.

---

## **Screen 0.2 — Import Students (CSV)**

Card: Import Senarai Murid

* Upload CSV button

* Sample format preview:

  * KELAS, NAMA MURID

Preview table

* 20 rows preview

* Mapping auto-detected:

  * KELAS → class\_name

  * NAMA MURID → full\_name

* Option:

  * ✅ Trim spaces / normalize caps

Buttons

* Import

* Cancel

Validation

* KELAS empty → row rejected

* NAMA empty → row rejected

* Dedup rule (MVP):

  * (class\_name \+ full\_name) exact match → skip duplicate

Import summary modal

* Added X, Skipped Y, Errors Z (show row numbers)

---

## **Screen 0.3 — Import Curriculum Seed (CSV)**

Card: Import Tema/Tajuk

* Upload CSV button

* Expected columns:

  * TEMA, TAJUK

Options

* Curriculum Set Name (text): e.g. “RBT Tahun 3 2026”

* Subject (optional dropdown)

* Grade/Tahun (optional dropdown)

* ✅ Auto-split code from TAJUK (e.g. 1.1.1)

* Import mode:

  * ( ) Create new set

  * ( ) Merge into existing

  * ( ) Replace existing

Preview

* tema | tajuk\_code | tajuk\_title

Validation

* Tema empty → reject

* Tajuk empty → reject

Finish

* Selesai → Pergi Rekod

---

# **1\) Rekod (Sessions)**

## **Screen 1.1 — Rekod Home (Sessions list)**

Top filter row:

* Kelas dropdown (All / pick one)

* Date range (Today/This week/Custom)

* Search (tema/tajuk)

List item (each session):

* Left: date \+ class

* Middle: tema \+ tajuk (1 line each)

* Right: progress badge: 12/19 filled, TD count

* Tap → open session

* More (…) menu:

  * Duplicate

  * Export

  * Delete (confirm)

Floating button:

* \+ Rekod Baru

Empty state:

* “Belum ada rekod. Tekan \+ untuk mula.”

---

## **Screen 1.2 — Create Rekod (Maklumat Pentaksiran)**

Fields (single form):

* Tarikh (default today)

* Kelas (required)

* Curriculum Set (required)

* Tema (required; dropdown from set)

* Tajuk (required; searchable list filtered by Tema)

* Optional:

  * Standard Kandungan (text/dropdown if you want)

  * Kemahiran (dropdown / text)

  * Catatan sesi (text)

Shortcuts:

* Button: Guna yang terakhir (fills curriculum/tema/tajuk)

* “Recent” chips for Tajuk (last 5\)

Buttons:

* Mula Key-In

* Secondary: Simpan Draft

Validation:

* Must have class \+ tema \+ tajuk.

---

# **2\) Key-In Screen (core experience)**

## **Screen 2.1 — Borang Rekod (Key-In)**

Header bar:

* Back

* Session summary line:

  * 18 Feb 2026 • 3 AMETHYST

  * Tema: 1.1 Konsep…

  * Tajuk: 1.1.2 Mengenal pasti…

* Right actions:

  * Dashboard Analisis (for this session)

  * Finish/Review

### **Section A: Bulk row (sticky)**

Label: Pilih Semua:

Chips: TP1 TP2 TP3 TP4 TP5 TP6 TD

Mini actions:

* Isi Kosong Dengan: \[TP dropdown\]

* Mark remaining TD (1 tap)

Bulk behavior:

* Tap TPx → shows confirm sheet:

  * “Set ALL students to TPx?”

  * Buttons: Replace All / Only Empty / Cancel

* After apply → snackbar “Applied to 19 students — UNDO”

### **Section B: Student list**

Top tools:

* Search: “Cari murid…”

* Filters:

  * All

  * Done (has TP)

  * TD

  * Empty (no TP set)

Row layout (desktop/tablet):

* BIL | NAMA MURID | TP options horizontal

* TP chips: TP1–TP6 \+ TD

Row layout (mobile):

Option 1 (recommended): chips wrap into 2 lines:

* Line 1: TP1 TP2 TP3 TP4

* Line 2: TP5 TP6 TD

   Option 2: horizontal scroll chips container.

Row behavior:

* Tap chip \= set TP for that student (instant)

* Selected TP chip highlighted

* Tap selected again:

  * toggle to “empty” (or stays, depending your rule)

  * Recommended: second tap opens tiny popover “Clear / Keep”

* Long press student name:

  * Add note

  * Add evidence (photo)

  * View history (optional)

### **Section C: Footer quick actions**

* Undo (always visible)

* Bulk Select (optional)

* Jump to TD / Empty

---

## **Screen 2.2 — Student Quick Detail (bottom sheet)**

Open by long-press / tapping a small icon.

Shows:

* Student name \+ class

* Current TP (editable chips)

* Notes textarea

* Evidence upload (image list)

* Save button (auto-save is okay)

---

# **3\) Session Review & Lock**

## **Screen 3.1 — Review Session**

Cards:

* Total students

* Filled count

* TD count

* Average TP (exclude TD)

* Distribution bar (TP1–TP6)

Lists:

* “Belum isi” (empty)

* “TD”

* “Ada catatan/evidence”

Actions:

* Kembali Edit

* Finalize (optional lock)

* Export / Cetak Laporan

Finalize behavior:

* If locked:

  * Editing requires “Unlock” with confirm

  * Or allow edits but record audit trail

---

# **4\) Analisis**

## **Screen 4.1 — Analisis (global)**

Filters:

* Class

* Date range

* Curriculum set

* Tema

* Tajuk

Cards:

* Jumlah Rekod

* Murid Ditaksir

* Purata TP

* Tajuk Ditaksir (count unique)

Charts (simple):

* TP distribution (stacked bar)

* TD count trend over time (optional)

Table:

* “Rekod Penguasaan Murid”

  * Student | class | avg TP | last assessed | TD count

* Tap student → profile

---

## **Screen 4.2 — Analisis (per Session)**

Same as above but scoped to one session.

---

# **5\) Laporan (Export)**

## **Screen 5.1 — Laporan Home**

Tabs:

* Laporan Sesi

* Laporan Murid

* Laporan Kelas

---

## **Screen 5.2 — Laporan Sesi (printable)**

Layout mirrors screenshot:

* Top: session info (tarikh, tema, standard, kemahiran, kelas)

* Cards: totals \+ average

* Table: student rows with TP

   Actions:

* Download PDF

* Download Excel

* Print

---

## **Screen 5.3 — Laporan Murid (profile report)**

* Student info

* List of sessions \+ TP

* Summary: avg TP, distribution, TD

   Export PDF.

---

## **Screen 5.4 — Laporan Kelas**

* Class summary

* Distribution

* Students needing attention (TP1–TP2, high TD)

   Export.

---

# **6\) Tetapan (Dynamic seed \+ import)**

## **Screen 6.1 — Tetapan Home**

Sections:

* Students & Classes

* Curriculum Seed (Tema/Tajuk)

* App Preferences

* Backup/Export

---

## **Screen 6.2 — Students & Classes**

* List classes (count)

* Button: Import Student CSV

* Button: Add class (manual)

* Tap class → student list

  * edit / delete / move student

Rules:

* Deleting student should soft delete (keep history), or block if has results (MVP: block delete).

---

## **Screen 6.3 — Curriculum Sets**

List sets:

* name, subject/year badge, active toggle

   Actions:

* Import Curriculum CSV

* Create new set

* Tap set → detail

---

## **Screen 6.4 — Curriculum Set Detail**

* Name, subject, grade

* Search tajuk

* Themes list (expandable)

  * shows tajuk inside

     Actions:

* Import into set (merge/replace)

* Add tema/tajuk manual

* Deactivate tajuk (for outdated items)

---

## **Screen 6.5 — Preferences**

* Default class

* Default curriculum set

* Default bulk action behavior:

  * Replace All requires confirm ✅

  * Only Empty as default ✅

* TP labels (TP1..TP6/TD)

* “Auto scroll next student” (optional)

---

# **MVP Rules (important decisions for first draft)**

1. TD vs Empty

* Empty \= not keyed yet

* TD \= teacher explicitly marks “not assessed”

* Reports:

  * Avg TP excludes TD & empty

  * “Murid ditaksir” counts non-empty non-TD

2. Duplicates

* Student duplicates by (class \+ name) (MVP)

* Later add stable ID support

3. Version safety

* Sessions store curriculum\_item\_id (tajuk) so if seed changes later, old sessions remain intact.

