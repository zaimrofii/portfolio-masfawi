const MAKS_BYTE = 5 * 1024 * 1024;

/**
 * Baca file gambar, perkecil ke maxDim px, lalu kembalikan data URL JPEG.
 * Catatan: API browser (FileReader + canvas); di Tauri tetap jalan di WebView.
 */
export function kompresGambar(
  file: File,
  maxDim = 1200,
  quality = 0.8,
): Promise<string> {
  if (file.size > MAKS_BYTE) {
    return Promise.reject(new Error('Ukuran gambar maks 5 MB'));
  }

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Gagal membaca gambar'));

    reader.onload = () => {
      const gambar = new Image();

      gambar.onerror = () => reject(new Error('Gambar tidak valid'));

      gambar.onload = () => {
        const skala = Math.min(
          1,
          maxDim / Math.max(gambar.width, gambar.height),
        );

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(gambar.width * skala));
        canvas.height = Math.max(1, Math.round(gambar.height * skala));

        const konteks = canvas.getContext('2d');
        if (!konteks) {
          reject(new Error('Canvas tidak tersedia'));
          return;
        }

        konteks.drawImage(gambar, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };

      gambar.src = String(reader.result);
    };

    reader.readAsDataURL(file);
  });
}