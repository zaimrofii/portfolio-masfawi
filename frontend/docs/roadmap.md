# ROADMAP — Sistem Operasional Penjahit Rumahan (Frontend)

> Dokumen hidup. Diperbarui tiap akhir fase.
> **Tujuan dokumen:** memastikan AI (Cline, navigator, reviewer) tahu _big picture_ dan **tidak merancang fitur sekarang secara serampangan** hingga menyulitkan fitur berikutnya.
>
> **Dokumen pendamping:**
>
> - `docs/cetak-biru.md` — referensi desain & data (bukan kontrak)
> - `current-project.json` — status fase & pegangan backend (`types.ts` = kontrak)
> - `ROADMAP.md` (ini) — arah jangka panjang & backlog terdekat

---

## 1. Tujuan Proyek (North Star)

Sistem ini adalah **buku pesanan digital + generator SPK/invoice PDF** untuk **penjahit rumahan** (1 user, laptop lokal, offline). Menggantikan pencatatan manual (buku tulis + WA) yang rawan pesanan terlewat, salah ukuran, dan tidak punya jejak revisi.

**Pengguna utama:** pemilik usaha jahit rumahan (kakak ipar) — bukan operator pabrik, bukan admin cloud.
**Pengguna sekunder:** konsumen (menerima SPK/invoice PDF via WA, tidak memakai aplikasi).
**Prinsip non-negotiable:** offline-first, satu layar satu fungsi, tombol besar, antrian serial (bukan kanban), bahasa Indonesia.

**Ukuran keberhasilan MVP:**

1. Pemilik bisa **buat pesanan → export SPK → kirim WA → terima revisi → produksi → selesai → invoice** tanpa dampingan minimal 3 hari.
2. Bisa **menjelaskan cara pakai** ke orang lain (video 1 menit).
3. **Tidak ada pesanan terlewat** (antrian serial jelas).
4. **SPK PDF** bisa dibuka di HP konsumen dan dikonfirmasi via WA.

---

## 2. Fase Pengembangan (Milestones)

Legenda status: `[x]` Selesai · `[/]` Sedang dikerjakan · `[ ]` Rencana · `[-]` Ditunda/sengaja tidak dikerjakan.

### Fase 0 — Fondasi

- [x] Scaffold Vite + React 19 + TS + Tailwind v4 + Router + TanStack Query + Axios + RHF + Zod + MSW
- [x] `src/styles/index.css` (token OKLCH, sha256 terkunci di `current-project.json`)
- [x] `src/api/types.ts`, `src/api/client.ts` (baseURL dari env)
- [x] `current-project.json` + `docs/cetak-biru.md`
- [x] Bersih-bersih template lama, `node_modules` Linux-flavored (WSL Node 22)

### Fase 1 — Mock & API Layer

- [x] MSW `setupWorker` (DEV only), seed ~12 pesanan (semua 8 status), 5 kain, 6 customer
- [x] `src/api/*` (pesanan, customer, kain, dashboard, antrian, backup)
- [x] `src/hooks/*` (TanStack Query)
- [x] Status transition in-memory di mock

### Fase 2 — Design System

- [x] `lib/{format,status,kalkulasi,cn}.ts`
- [x] UI kit: Button, Input, Select, Textarea, Badge, Card, EmptyState, Table
- [x] `STATUS_MAP`, `warnaBadge`, `bolehTransisi`, `labelSisaHari`

### Fase 3 — Layout + Dashboard

- [x] Sidebar 220px fixed, TopBar (judul dinamis, tanggal, tombol Backup)
- [x] `AppLayout` + Router (BrowserRouter, 8 route + NotFound)
- [x] Dashboard: 4 kartu stat, Deadline Terdekat, Kendala Aktif

### Fase 4 — Wizard Pesanan Baru

- [x] Wizard 3 step: Customer → Item → Varian
- [x] Autocomplete customer (debounce 300ms) + form Customer Baru inline
- [x] Multi-item, multi-varian, total live
- [x] Validasi Zod (Indonesia), submit `POST /pesanan/`
- [x] Ganti emoji UI → **lucide-react**
- [x] `Kendala.pesanan_nomor`

### Fase 5 — Daftar + Detail + Aksi

- [x] Daftar Pesanan (tabel, filter status, search debounce, sort deadline)
- [x] Detail Pesanan 2 kolom: info + item + total + catatan + riwayat, panel Aksi kanan
- [x] `AksiPanel` kontekstual per status (dengan ConfirmDialog)
- [x] `RiwayatStatus` (timeline), `KendalaForm` (inline)
- [x] `ConfirmDialog` (native `<dialog>`), `ToastProvider` (Context)
- [x] `lib/downloadFile.ts` (Tauri-ready)

### Fase 5.1 — Edit + Bordir + Layout

- [x] Route `/pesanan/:id/edit` (reuse wizard mode=edit, hanya DRAFT/REVISI)
- [x] Bordir: `bordir_titik` + `bordir_keterangan` di item
- [x] Harga varian = input kosong (hasil nego, bukan auto-fill kain)
- [x] Layout wizard 92% (mobile) / 85% (desktop)

### Fase 6 — Antrian Produksi

- [x] `KartuSedangDikerjakan` (1 PRODUKSI) + `BarisMenunggu` (list DISETUJUI)
- [x] `Catat Kendala` inline, `Selesai Produksi` (ConfirmDialog)
- [x] `Mulai Pesanan Berikutnya` (manual, bukan auto-transition)
- [x] `POST /antrian/mulai-berikutnya/` (tolak 400 bila masih ada PRODUKSI)

### Fase 7.0 — Restrukturisasi SPK

- [x] **1 SPK = 1 unit produksi** (item × desain). Nomor `${pesanan.nomor}-${urut}`
- [x] `SpkProduksi` (baru), `ItemPesanan` disederhanakan
- [x] `Pesanan.designer?` + `Pesanan.spk[]`
- [x] Upload gambar base64 (`kompresGambar`, max 1200px q=0.8, tolak >5 MB)
- [x] Multi-desain di Step 2 (label, jenis_spk, 3 slot gambar, bordir per desain)
- [x] Varian + spesifikasi bebas per desain di Step 3
- [x] Detail: section "Surat Perintah Kerja" (kartu per SPK)
- [x] Fix bug: Step 2 "Lanjut" terblokir validasi varian (path induk vs leaf)

### Fase 7.1 — Preview SPK A1–D3

- [x] Halaman `/pesanan/:id/spk/:spk_id` layout A4 Potrait 9 blok (A1 logo, A2 info pesanan, A3 tanggal/deadline/designer, B1 gambar depan, B2 gambar belakang, C tabel spesifikasi + ukuran, D1 aturan produksi statis, D2 gambar close-up, D3 peringatan)
- [ ] `src/styles/print.css` (`@media print`, `@page { size: A4 Potrait }`)
- [ ] `window.print()` via tombol `Cetak / Simpan PDF` (Tauri-ready)
- [ ] `lib/spkAturan.ts` (`ATURAN_PRODUKSI`, `PERINGATAN_SPK`)
- [ ] Rapikan `AksiPanel`: label `Lihat SPK` (bukan "Preview Semua SPK")

### Fase 7.2 — Perbaikan Struktural Varian

- [x] `varian[]` kembali ke `ItemPesanan` (sumber pcs), `SpkProduksi` jadi view turunan (`item_id` + `desain_index` saja)
- [x] `DesainItem` (baru): label, jenis_spk, gambar_depan/belakang/desain, bordir, spesifikasi[]
- [x] Step 3 dirombak: varian per item (bukan per desain) + desain ringkas + close-up upload + spesifikasi manual
- [x] Detail: kartu SPK baca data dari `item` + `desain` (via `resolveSpk`)
- [x] PreviewSpk: Spesifikasi Otomatis (dari item+desain) + Spesifikasi Manual + Tabel Ukuran dari `item.varian`

### Fase 7 — Master Data

- [x] `MasterKain` (CRUD inline, nonaktifkan bukan hapus)
- [x] `MasterCustomer` (CRUD inline, search debounce)
- [x] `useBuatKain`/`useUpdateKain`/`useUpdateCustomer`

### Fase 8 — Arsip + Polish

- [x] `Arsip` (read-only DIAMBIL/BATAL, filter bulan)
- [x] Empty/loading/error state konsisten di semua halaman
- [x] `manualChunks` (pisahkan `lucide-react`, `@tanstack/react-query`) — hilangkan warning chunk >500 kB
- [x] Hapus `mulaiBerikutnya()` lama (klien-side, sudah diganti server-side)
- [x] Audit warna (tidak ada hex/oklch di luar `index.css`)

### Fase 9 — Demo Klien

- [ ] Matikan **Vercel Deployment Protection** untuk URL production
- [ ] Alur demo end-to-end: buat pesanan → export SPK → kirim WA → revisi → produksi → selesai → invoice
- [ ] Kumpulkan revisi → masuk Fase 10

### Fase 10 — Revisi Klien

- [ ] Perubahan sesuai hasil demo (bisa menyentuh `types.ts` → catat di `django_notes_untuk_backend`)

### Fase 11 — Backend Django (di luar frontend)

- [ ] Model Django dari `current-project.json → django_notes_untuk_backend`
- [ ] Serializer, endpoint (termasuk `/spk/`, `/antrian/mulai-berikutnya/`)
- [ ] `SPK PDF` via `weasyprint` (template HTML sama dengan preview frontend)
- [ ] `ImageField` untuk `gambar_*` (ganti base64)
- [ ] Selaraskan mock vs `lib/status.ts` (transisi)

### Fase 12 — Tauri Packaging

- [ ] Sidecar Django via PyInstaller (rename `-$TARGET_TRIPLE`)
- [ ] Port dinamis, DB di `%LOCALAPPDATA%`, `SECRET_KEY` runtime
- [ ] CORS/CSRF untuk `tauri://localhost` + `http://127.0.0.1:<port>`
- [ ] Uji di mesin bersih (tanpa Python) 2–3 putaran

### Sengaja Tidak Dikerjakan (MVP)

- [-] Hosting cloud (Vercel hanya preview; produksi = Tauri lokal)
- [-] Mobile app (HP hanya untuk kirim PDF via WA)
- [-] Auth cloud (cukup PIN 4 digit di Tauri, opsional)
- [-] Modul SDM/mesin (cukup `Kendala`)
- [-] Kanban parallel (antrian serial 1+list)
- [-] Multi-user
- [-] Notifikasi otomatis (WA manual)
- [-] Laporan grafik

---

## 3. Daftar Tugas Atomik (Backlog Terdekat)

Backlog ini untuk **fase yang sedang berjalan** (saat ini **7.1**). Setelah fase selesai, ganti isinya dengan fase berikutnya. Pecahan kecil agar mudah diubah menjadi prompt Cline (1 tugas = 1 prompt = 1 commit).

### Fase 7.1 — Preview SPK (sedang dikerjakan)

**A. Persiapan**

- [ ] Buat `src/styles/print.css`: `@media print` (sembunyikan `.no-print`), `@page { size: A4 Potrait; margin: 8mm }`, `.spk-page`, `.spk-grid`, aturan gambar
- [ ] Tentukan cara import `print.css`: (a) `src/main.tsx` setelah `index.css`, atau (b) `src/pages/PreviewSpk.tsx` saja — **pilih satu**, laporkan
- [ ] Lengkapi `lib/spkAturan.ts` — `ATURAN_PRODUKSI: string[]` (min 4 baris) + `PERINGATAN_SPK: string`

**B. Layout (A1–D3)**

- [ ] `PreviewSpk.tsx`: grid `grid-template-areas` A1 A2 A3 / B1 B2 / C C / D1 D2 / D3 D3, border tipis tiap blok
- [ ] **A1**: `<img src="/logo.png">` + fallback `onError` → teks "NAMA USAHA"
- [ ] **A2**: `nomor_spk`, jenis item, nama + no WA customer, nomor pesanan, `label_desain`
- [ ] **A3**: Tanggal Cetak (hari ini), Deadline, Designer (fallback `-`)
- [ ] **B1/B2**: gambar depan/belakang, fallback "Tidak ada desain depan/belakang"
- [ ] **C**: tabel spesifikasi bebas (label|nilai) + tabel ukuran horizontal (header = ukuran unik, baris = jumlah, baris Total); kolom Kategori hanya jika >1 kategori
- [ ] **D1**: `ATURAN_PRODUKSI` (bullet list statis)
- [ ] **D2**: gambar close-up (`gambar_desain`), fallback teks
- [ ] **D3**: `PERINGATAN_SPK` (border warning)

**C. Aksi & Cetak**

- [ ] Header halaman (class `no-print`): judul `Preview SPK <nomor_spk>` + tombol `Kembali` + `Cetak / Simpan PDF` (`window.print()`)
- [ ] Loading `Memuat…`; SPK tidak ditemukan → `EmptyState` + tombol kembali
- [ ] **Verifikasi visual manual** (user): buka `/pesanan/8/spk/<id>` → 9 blok tampil, gambar tidak pecah, print preview hanya area SPK + A4 Potrait

**D. Rapikan AksiPanel**

- [ ] Label `export_spk` di AksiPanel: **`Lihat SPK`** (bukan "Preview Semua SPK")
- [ ] Navigate ke `pesanan.spk[0]?.id`; kosong → `toast.info('Belum ada SPK')`
- [ ] `export_invoice` biarkan (tetap 404 → toast)

**E. Data seed**

- [ ] Pastikan **≥1 SPK punya 3 gambar lengkap** (depan, belakang, close-up) base64 placeholder — untuk demo
- [ ] Catat **id SPK** tersebut di laporan (untuk user buka di browser)

**F. Verifikasi & Dokumentasi**

- [ ] `npm run typecheck` → 0
- [ ] `npm run build` → 0, `grep -c mockServiceWorker dist/assets/*.js` = 0
- [ ] `curl -s localhost:5173/pesanan/8/spk/<id>` = 200, `curl -s localhost:5173/pesanan/999/spk/1` = 200
- [ ] `current-project.json`: `phase: "7.1-done"`, `next_phase: "7 — Master Kain + Master Customer"`, `pages.done += /pesanan/:id/spk/:spk_id`, `features += spk_preview + spk_export`, `tech_debt += logo A1 fallback teks`
- [ ] Hash `index.css` = 7943 B / sha256 `1327aaa…781ae4f96` (bukti tidak tersentuh)

### Fase 7 — Master (setelah 7.1, belum dimulai)

_(Kerangka awal — akan diperdetail saat 7.1 selesai)_

- [ ] `useBuatKain` / `useUpdateKain` di `src/hooks/useKainList.ts`
- [ ] `useUpdateCustomer` di `src/hooks/useCustomerList.ts`
- [ ] `MasterKain.tsx`: form inline + tabel, `Nonaktifkan` (ConfirmDialog), bukan hapus
- [ ] `MasterCustomer.tsx`: form inline + search debounce + kolom "Jumlah Pesanan" (pilih pendekatan: `jumlah_pesanan?: number` di `Customer` vs hitung klien)
- [ ] Verifikasi: `POST /kain/`, `PUT /kain/:id/` (aktif:false), `POST /customer/`, `PUT /customer/:id/`

---

## 4. Aturan Kerja (untuk AI & Manusia)

1. **Satu fase = satu prompt = satu commit** (kecuali prompt panjang → boleh dipecah Tahap 1/2/3 seperti Fase 7.0).
2. **Sebelum menulis prompt**, cek `ROADMAP.md` §3 (backlog fase berjalan) + `current-project.json` (`phase`, `tech_debt`, `django_notes`).
3. **Setiap akhir fase**, update **tiga** dokumen:
   - `current-project.json` (format lengkap; lihat `docs/cetak-biru.md` §13)
   - `ROADMAP.md` (status `[x]`, pindahkan backlog ke fase berikutnya)
   - `docs/cetak-biru.md` **hanya jika** ada keputusan arsitektur baru (bukan tiap fase)
4. **Jangan merancang fitur yang memblokir fase berikutnya.** Contoh: jangan bikin upload logo di Fase 7.1 — itu Fase 8+.
5. **`types.ts` boleh berubah** kapan saja bila perlu; wajib dicatat di `django_notes_untuk_backend`.
6. **Jangan install library baru** tanpa persetujuan (sudah disepakati: lucide-react, tanpa `clsx`/`tailwind-merge`/library PDF).
7. **Jangan sentuh `src/styles/index.css`** (sha256 terkunci).
8. **Jangan sentuh backend** sampai Fase 11 (kecuali baca `django_notes` untuk konteks).

---

## 5. Peta Ketergantungan Antar Fase

0 → 1 → 2 → 3 → 4 → 5 → 5.1 → 6 → 7.0 → 7.1 → 7.2 → 7 → 8 → 9 → 10 → 11 → 12
↑
(restrukturisasi SPK
mengubah data model —
semua fase setelahnya
memakai SpkProduksi)

text

**Catatan penting:**

- **7.0** adalah **titik balik data model**. Setelah 7.0, `ItemPesanan` tidak punya `varian`/`sablon`/`bordir` — semua di `SpkProduksi`. Fase 7.1, 7, 8 **wajib** memakai model baru ini.
- **7.1 sebelum 7** — alasan: preview SPK adalah **inti produk**; Master Kain/Customer hanya CRUD, bisa kapan saja. Kalau molor, potong Master (gabung ke form pesanan), **jangan potong SPK**.
- **Fase 9 (demo)** membutuhkan **Vercel Protection dimatikan** — tugas user, bukan Cline.
- **Fase 11–12 (backend & Tauri)** baru bisa dikerjakan setelah **10 (revisi klien)** selesai — karena backend mengikuti frontend final.

---

## 6. Pegangan Backend (ringkas)

Detail lengkap di `current-project.json → django_notes_untuk_backend`. Ringkas:

- `SpkProduksi` (baru): `nomor_spk`, `nomor_urut`, `item` FK, `label_desain`, `jenis_spk`, `gambar_*` (`ImageField`/`TextField` base64), `bordir_titik`, `bordir_keterangan`, `spesifikasi` (`JSONField`), `varian` (related_name).
- `ItemPesanan`: **hapus** `sablon`, `keterangan_sablon`, `bordir_*`, `varian` (pindah ke SPK).
- `Pesanan.designer`: `CharField(max_length=100, blank=True)`.
- `generate_spk`: saat create/update, 1 desain → 1 SPK; nomor `${pesanan.nomor}-${urut}`.
- `VarianUkuran`: FK ke **`SpkProduksi`** (bukan `ItemPesanan`) saat backend.
- `status_transition`: ikuti `lib/status.ts` (mock lebih longgar — selaraskan).
- Endpoint: `GET /api/pesanan/:id/spk/`, `GET /api/pesanan/:id/spk/:spk_id/`, `POST /api/antrian/mulai-berikutnya/`.

---

## 7. Risiko & Mitigasi

| Risiko                                            | Mitigasi                                                                                                            |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Cline kehilangan bagian prompt (chat terpotong)   | Paste seluruh prompt; minta laporan per §; kalau hilang, minta Cline tandai "asumsi" dan koreksi di prompt lanjutan |
| `types.ts` berubah tanpa tercatat                 | Wajib update `django_notes_untuk_backend` tiap akhir fase                                                           |
| Gambar base64 membengkak di memori                | Kompres via canvas (max 1200px q=0.8), tolak >5 MB; nanti backend `ImageField`                                      |
| Wizard jadi rumit (desain + varian + spesifikasi) | Validasi per step (`trigger` leaf path, bukan subtree); pesan error di bawah field                                  |
| Print PDF tidak rapi di browser                   | `print.css` + `@page` A4 Potrait; verifikasi visual manual oleh user                                                |
| Mock vs backend transisi status beda              | Selaraskan di Fase 11; sekarang UI pakai `lib/status.ts`                                                            |
| Chunk >500 kB                                     | `manualChunks` di Fase 8                                                                                            |
| Data klien hilang (SQLite)                        | Tombol Backup (`POST /backup/`) + nanti copy `db.sqlite3` di Tauri                                                  |

---

## 8. Ringkasan Satu Paragraf

Sistem penjahit rumahan yang **offline-first** di laptop: catat pesanan → generate **SPK per unit produksi (A1–D3)** → kirim WA → revisi → produksi serial → selesai → invoice → arsip. Frontend **selesai sampai 7.0** (wizard + SPK + upload gambar), sedang menyelesaikan **7.1 (preview SPK + print)**. Setelah itu Master (7), Arsip+polish (8), demo klien (9), revisi (10), lalu backend Django (11) dan Tauri (12) — semuanya mengikuti `types.ts` sebagai kontrak, bukan cetak biru.
