import { useEffect, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

function App() {
  const [pesanan, setPesanan] = useState([]);
  const [form, setForm] = useState({
    nama_pemesan: "",
    jenis_jahitan: "",
    tanggal_masuk: "",
    tanggal_janji: "",
    catatan: "",
  });

  const load = () =>
    axios.get(`${API}/pesanan/`).then((r) => setPesanan(r.data));
  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    await axios.post(`${API}/pesanan/`, form);
    setForm({
      nama_pemesan: "",
      jenis_jahitan: "",
      tanggal_masuk: "",
      tanggal_janji: "",
      catatan: "",
    });
    load();
  };

  const ubahStatus = async (id, status) => {
    await axios.patch(`${API}/pesanan/${id}/`, { status });
    load();
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>Catatan Pesanan Jahit</h1>

      <form onSubmit={submit} style={{ marginBottom: 20 }}>
        <input
          placeholder="Nama pemesan"
          value={form.nama_pemesan}
          onChange={(e) => setForm({ ...form, nama_pemesan: e.target.value })}
          required
        />
        <input
          placeholder="Jenis jahitan"
          value={form.jenis_jahitan}
          onChange={(e) => setForm({ ...form, jenis_jahitan: e.target.value })}
          required
        />
        <input
          type="date"
          value={form.tanggal_masuk}
          onChange={(e) => setForm({ ...form, tanggal_masuk: e.target.value })}
          required
        />
        <input
          type="date"
          value={form.tanggal_janji}
          onChange={(e) => setForm({ ...form, tanggal_janji: e.target.value })}
          required
        />
        <input
          placeholder="Catatan"
          value={form.catatan}
          onChange={(e) => setForm({ ...form, catatan: e.target.value })}
        />
        <button type="submit">Tambah Pesanan</button>
      </form>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Nama</th>
            <th>Jahitan</th>
            <th>Masuk</th>
            <th>Janji</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {pesanan.map((p) => (
            <tr key={p.id}>
              <td>{p.nama_pemesan}</td>
              <td>{p.jenis_jahitan}</td>
              <td>{p.tanggal_masuk}</td>
              <td>{p.tanggal_janji}</td>
              <td>{p.status}</td>
              <td>
                {["BARU", "DIJAHIT", "SELESAI", "DIAMBIL"].map((s) => (
                  <button
                    key={s}
                    onClick={() => ubahStatus(p.id, s)}
                    disabled={p.status === s}
                  >
                    {s}
                  </button>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
