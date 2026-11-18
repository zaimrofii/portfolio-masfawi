# Cetak Biru — Frontend Sistem Operasional Penjahit Rumahan

> **Status:** hidup (diperbarui tiap akhir fase). **Rujukan ringkas**, bukan kontrak.
> **Kontrak = `src/api/types.ts` + payload aktual.** Backend Django nanti mengikuti frontend.
> `current-project.json` = status fase & pegangan backend.

---

## 1. Prinsip (non-negotiable)

1. **Offline-first, localhost.** Tidak ada cloud, tidak ada auth cloud. Dev = web, finish = Tauri.
2. **Satu layar satu fungsi.** Tiap route = 1 tugas. Tidak ada modal bertumpuk.
3. **Tombol besar.** Min tinggi 48px, font ≥16px, padding lega.
4. **Minim ketik.** Dropdown, autocomplete, default value.
5. **Bahasa Indonesia.** Semua label, error, konfirmasi.
6. **Jangan over-engineered.** Cukup: catat pesanan → ubah status → lihat antrian.
7. **Cetak biru = referensi, bukan aturan mati.** Kalau UX butuh ubah field/aksi, ikuti UX; backend menyesuaikan. Laporkan di `current-project.json`.

---

## 2. Stack & Struktur (terpasang)

- Vite **8.3.8** · React **19.3.1** · TS **7.0.2**
- Tailwind **4.3.5** + `@tailwindcss/vite`
- React Router **7.18.5** (`BrowserRouter`)
- TanStack Query **5.107.1** · Axios **1.21.1**
- RHF + Zod **4.6.7** + `@hookform/resolvers`
- lucide-react **1.73.0**
- MSW **3.0.6** (mock aktif, hanya DEV)

**Struktur folder (target):**

```
src/
├── api/         client.ts, types.ts, pesanan/customer/kain/dashboard/antrian/backup.ts
├── mocks/       browser.ts, handlers.ts, data/
├── components/  layout/, ui/, pesanan/, antrian/, master/
├── pages/       Dashboard, PesananBaru, EditPesanan, DaftarPesanan, DetailPesanan,
│               AntrianProduksi, Arsip, MasterKain, MasterCustomer, PreviewSpk, NotFound
├── hooks/       usePesananList, usePesananDetail, useUbahStatus, useCatatKendala,
│               useAntrian, useMulaiBerikutnya, useDashboard, useCustomerList,
│               useBuatCustomer, useUpdateCustomer, useKainList, useBuatKain,
│               useUpdateKain, useBuatPesanan, useUpdatePesanan
├── lib/         format.ts, status.ts, kalkulasi.ts, cn.ts, downloadFile.ts,
│               spkAturan.ts, spkNomor.ts, gambar.ts (base64), print.css (Fase 7.1)
└── styles/      index.css (token OKLCH — JANGAN DIUBAH)
```

**Aturan akses data:** semua lewat `src/api/*`. Komponen **tidak** boleh `fetch/axios` langsung.

---

## 3. Route

| Path                       | Halaman                                                 | Status           |
| -------------------------- | ------------------------------------------------------- | ---------------- |
| `/`                        | Dashboard                                               | ✅               |
| `/pesanan/baru`            | PesananBaru (wizard 3 step, upload gambar)              | ✅               |
| `/pesanan`                 | DaftarPesanan (tabel, filter, search)                   | ✅               |
| `/pesanan/:id`             | DetailPesanan (info + daftar SPK + AksiPanel + Kendala) | ✅               |
| `/pesanan/:id/edit`        | EditPesanan (reuse wizard, mode=edit)                   | ✅               |
| `/pesanan/:id/spk/:spk_id` | PreviewSpk (A1–D3, print-to-PDF)                        | ✅ Fase 7.1      |
| `/antrian`                 | AntrianProduksi                                         | ✅               |
| `/arsip`                   | Arsip (read-only)                                       | ⏳ Fase 8        |
| `/master/kain`             | MasterKain                                              | ⏳ Fase 7 (asli) |
| `/master/customer`         | MasterCustomer                                          | ⏳ Fase 7 (asli) |

Sidebar 210px xl:220px fixed. TopBar: judul + tanggal + tombol Backup.

---

## 4. Status Map (`lib/status.ts`)

| Status        | Label       | Warna token | Aksi                               |
| ------------- | ----------- | ----------- | ---------------------------------- |
| `DRAFT`       | Draft       | muted       | export_spk, kirim_spk, edit, batal |
| `SPK_DIKIRIM` | SPK Dikirim | info        | revisi, setujui                    |
| `REVISI`      | Revisi      | warning     | edit, export_spk, setujui          |
| `DISETUJUI`   | Disetujui   | accent-blue | mulai_produksi                     |
| `PRODUKSI`    | Produksi    | warning     | kendala, selesai                   |
| `SELESAI`     | Selesai     | success     | export_invoice, diambil            |
| `DIAMBIL`     | Diambil     | emerald     | (read-only)                        |
| `BATAL`       | Batal       | danger      | (read-only)                        |

**Catatan Fase 7.1** : export_spk tetap ada di STATUS_MAP (id tidak berubah), tapi label UI di AksiPanel = Lihat SPK (buka SPK pertama). Ekspor PDF via window.print() di halaman PreviewSpk.

Badge deadline: `≤0` → danger "Lewat"; `≤3` → warning "X hari lagi"; else muted.

---

## 5. Tipe Data Inti (`src/api/types.ts` = kontrak)

- **Customer**: id, nama, no_wa, alamat, **catatan?**, created_at
- **BahanKain**: id, nama, **warna?**, harga_per_meter, **stok_meter**, aktif, created_at
- **Pesanan**: id, nomor (`PS-YYYYMMDD-NNN`), customer, status, deadline, catatan, total_harga, **designer?**, items[], **spk[]**, log[], kendala?[], created_at, updated_at
- ItemPesanan: id, pesanan_id, jenis, kain, lengan, warna, saku, varian[] (sumber pcs), desain[] (daftar desain: label, jenis_spk, gambar_depan/belakang/desain, bordir, spesifikasi[]), spesifikasi?[] (umum item)
- SpkProduksi (VIEW TURUNAN — tidak disimpan): id, nomor_spk (${nomor}-${urut}), nomor_urut, item_id, desain_index, label_desain?, jenis_spk?. Semua field lain dibaca dari item.desain[desain_index].
- VarianUkuran: id, item_id (bukan spk_id), kategori, ukuran, jumlah, harga_satuan, subtotal
- **LogStatus**: id, pesanan_id, status_lama, status_baru, keterangan, created_at
- **Kendala**: id, pesanan_id, jenis, catatan, estimasi_mundur_hari, created_at, **pesanan_nomor?** (turunan)

**Aturan generate SPK:** 1 item dengan N desain → N SPK. 0 desain → 1 SPK "Polos". Nomor `${nomor}-${urut}`.

**Perubahan `types.ts` wajib dicatat di `django_notes_untuk_backend` (`current-project.json`).**

---

## 6. Endpoint API (ringkas, termasuk mock)

| Aksi             | Method + Path                                                              |
| ---------------- | -------------------------------------------------------------------------- |
| Dashboard        | `GET /dashboard/`                                                          |
| List pesanan     | `GET /pesanan/?status=&q=`                                                 |
| Detail           | `GET /pesanan/:id/` (mengembalikan `spk[]`)                                |
| Buat             | `POST /pesanan/` (payload `items[].desain[]`)                              |
| Edit             | `PUT /pesanan/:id/`                                                        |
| Ubah status      | `PATCH /pesanan/:id/status/`                                               |
| Catat kendala    | `POST /pesanan/:id/kendala/`                                               |
| Daftar SPK       | `GET /pesanan/:id/spk/`                                                    |
| Detail SPK       | `GET /pesanan/:id/spk/:spk_id/`                                            |
| Export SPK PDF   | `GET /pesanan/:id/spk/:spk_id.pdf` (Fase 7.1; sementara **404**)           |
| Export Invoice   | `GET /pesanan/:id/invoice.pdf` (sementara 404)                             |
| Antrian          | `GET /antrian/`                                                            |
| Mulai berikutnya | `POST /antrian/mulai-berikutnya/` (400 bila ada PRODUKSI, 404 bila kosong) |
| Master kain      | `GET/POST/PUT /kain/`                                                      |
| Master customer  | `GET/POST/PUT /customer/`                                                  |
| Backup           | `POST /backup/`                                                            |

Base URL: `import.meta.env.VITE_API_BASE_URL` (fallback `http://127.0.0.1:8000/api`).

---

## 7. Fase Kerja

| Fase    | Deliverable                                                              | Status |
| ------- | ------------------------------------------------------------------------ | ------ |
| 0       | Scaffold + `index.css` + TS + Tailwind + `current-project.json`          | ✅     |
| 1       | MSW + data dummy + `api/*` + `hooks/*`                                   | ✅     |
| 2       | UI kit + `lib/*`                                                         | ✅     |
| 3       | Layout + Router + Dashboard                                              | ✅     |
| 4       | Wizard Pesanan Baru + lucide                                             | ✅     |
| 5       | Daftar + Detail + AksiPanel + Kendala                                    | ✅     |
| 5.1     | Edit Pesanan + Bordir + Layout wizard 85–92%                             | ✅     |
| 6       | Antrian Produksi                                                         | ✅     |
| **7.0** | **Restrukturisasi SPK (per unit produksi) + Upload Gambar + Daftar SPK** | ✅     |
| **7.1** | **Preview SPK A1–D3 + `window.print()` (Fase 7.1)**                      | ✅     |
| 7.2     | Perbaikan struktural: varian per item, SPK view turunan, close-up Step 3 | ✅     |
| 7       | Master Kain + Master Customer                                            | ⏳     |
| 8       | Arsip + polish (empty/loading/error, manualChunks, bersih-bersih)        | ⏳     |
| 9       | Demo klien (data dummy) → matikan Vercel Protection                      | ⏳     |
| 10      | Revisi klien                                                             | ⏳     |
| —       | **Tauri packaging** (setelah frontend stabil)                            | ⏳     |

**Aturan potong lingkup kalau molor:** potong Master Customer (gabung ke form pesanan) & Arsip (cukup filter di Daftar). **Jangan potong** Antrian, Detail Pesanan, **SPK**.

### 7.0 — SPK per unit produksi

- 1 SPK = 1 item × 1 desain. Nomor `${pesanan.nomor}-${urut}`.
- Gambar: base64 data URL (dev). Kompres `<canvas>` max 1200px q=0.8, tolak >5 MB.
- Spesifikasi kolom C: array `{label, nilai}` free-form (klien isi manual).
- Designer: input free-text di Step 1 wizard.
- Varian: tetap di ItemPesanan (bukan di SPK). Bordir: pindah dari ItemPesanan ke desain[] (per desain).
  Gambar close-up: di Step 3 (per desain), bukan Step 2.
- Detail: section "Surat Perintah Kerja" berisi kartu per SPK.

### 7.1 — Preview & Export SPK (A1–D3)

- Layout A4 portrait, 9 blok: A1 logo, A2 info pesanan, A3 tanggal/deadline/designer, B1 gambar depan, B2 gambar belakang, C tabel spesifikasi + ukuran, D1 aturan produksi statis, D2 gambar desain close-up, D3 peringatan.
- Print via `window.print()`. `@media print` di `src/styles/print.css` (**jangan** ubah `index.css`).
- Konstanta `ATURAN_PRODUKSI` (D1) & `PERINGATAN_SPK` (D3) di `lib/spkAturan.ts`.
- Backend PDF menyusul (template HTML sama).

---

## 8. Tauri-Ready (patuhi dari Fase 0)

1. `client.ts` **selalu** baca `import.meta.env.VITE_API_BASE_URL`.
2. **Tidak ada data bisnis di `localStorage`/`sessionStorage`.** UI state boleh.
3. Router: **`BrowserRouter`** (bukan Hash).
4. **Tidak ada `window.open` untuk download.** Pakai `lib/downloadFile.ts` (nanti plugin fs/dialog Tauri).
5. **Tidak ada dependency Node** di runtime React.
6. `src/styles/index.css` = **kunci visual** (sha256 tercatat di `current-project.json`).
7. Gambar dev = **base64**; nanti backend `ImageField` → URL. Ganti `gambar_*` base64 → `gambar_*_url` saat backend.
8. Saat Tauri: Django = **sidecar** (PyInstaller `.exe` di-rename `-$TARGET_TRIPLE`), port dinamis, DB di `%LOCALAPPDATA%`, `SECRET_KEY` runtime. **Belum dikerjakan.**

---

## 9. Konvensi Kode

- **Bahasa Indonesia** untuk UI, komentar kode boleh Inggris.
- **Import alias** `@/*` → `src/*`.
- **Form:** RHF + Zod, schema mirror serializer Django.
- **Server state:** TanStack Query. Invalidate `['pesanan']`, `['dashboard']`, `['antrian']`, `['customer']`, `['kain']` setelah mutasi terkait.
- **UI state:** `useState` lokal. **Tidak pakai Redux/Zustand.**
- **Warna:** hanya token `--color-*` dari `index.css`. Tidak ada hex/oklch baru di komponen.
- **Ikon:** **lucide-react** (bukan emoji di UI). Emoji hanya di teks konten bebas (mis. empty state).
- **Tombol aksi** hanya muncul sesuai `STATUS_MAP[status].aksi`.
- **Setiap akhir fase:** `npm run typecheck` + `npm run build` wajib exit 0, `grep -c mockServiceWorker dist/assets/*.js` = 0.
- **Setiap akhir fase:** update `current-project.json` (format lengkap, lihat §13).

---

## 10. Catatan Lingkungan

- **Node 22 wajib** (Vite 8). WSL: `source ~/.nvm/nvm.sh && nvm use 22`.
- `node_modules` di WSL = Linux-flavored; **jangan** `npm install` dari Windows.
- **TypeScript 7.0.2** terpasang. Kalau error aneh di fase lanjut, pin `typescript@~5.9`.
- **`.env.local`** (dev, gitignored): `VITE_API_BASE_URL=http://127.0.0.1:8000/api`. **`.env.example`** di-commit.

---

## 11. MSW & Mock Strategy

- `src/mocks/browser.ts` → `setupWorker(...handlers)`, `worker.start({ onUnhandledFrame: 'bypass' })` **hanya saat `import.meta.env.DEV`**.
- `src/mocks/handlers.ts` → semua endpoint §6, **in-memory store**.
- Seed: ~12 pesanan (semua 8 status), 5 kain, 6 customer, **minimal 1 pesanan dengan 3 desain** dan 1 pesanan 2 item (celana+kaos) untuk demo SPK.
- Mock **update state** saat PATCH status / POST / PUT, agar UI konsisten di dev.
- Mock **lebih longgar** dari `lib/status.ts` (DISETUJUI→REVISI, PRODUKSI→BATAL). **Selaraskan saat backend Django.**
- SPK di mock: disimpan sebagai array turunan (spk[]) di objek Pesanan. Saat backend, generate on-the-fly di serializer. Mock boleh tetap menyimpan untuk kemudahan dev.
- Saat backend siap: matikan MSW, isi `VITE_API_BASE_URL`, `msw` tetap dev untuk test.

---

## 12. Sengaja Belum Dikerjakan (MVP)

- Hosting cloud (Vercel URL hanya untuk preview; deploy produksi = Tauri lokal).
- Mobile app (HP hanya untuk kirim PDF via WA).
- Auth (cukup PIN 4 digit nanti di Tauri, opsional).
- Modul SDM/mesin (cukup `Kendala`).
- Kanban parallel (antrian serial 1+list).
- Multi-user.
- Notifikasi otomatis (WA manual).
- Laporan grafik.
- Halaman edit inline (edit lewat `/pesanan/:id/edit`).
- Master motif bordir (cukup angka + teks).

---

## 13. `current-project.json` — aturan update

Tiap akhir fase **wajib** update field: `phase`, `phase_label`, `next_phase`, `last_updated`, `pages.done`/`pages.placeholder`, `features`, `api_layer.files`/`api_layer.hooks`, `deviations_from_blueprint` (bila ada), `django_notes_untuk_backend` (**wajib** untuk setiap field baru di `types.ts`), `tech_debt`. **Jangan** ubah `contract` atau `styles.sha256` (kecuali `index.css` diubah dengan persetujuan).

---

## 14. Ringkasan Satu Kalimat

Buku pesanan digital + generator **SPK per unit produksi** (A1–D3) + invoice, offline di laptop, antrian serial 1+list, wizard 3 langkah + upload gambar, panel aksi kontekstual per status — tombol besar, bahasa Indonesia, tanpa fitur yang tidak diminta.
