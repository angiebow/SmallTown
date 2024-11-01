# SmallTown
# Proposal Proyek

### Anggota Tim
- **5025221051**: Pelangi Masita Wati
- **5025221302**: Muhammad Fahmi Syahputra
- **5025221256**: Aryasatya Wiryawan

---

### Judul Proyek: Three.js - "Small Town"

**Tujuan**: Mengembangkan kota kecil 3D di browser dengan fitur interaktif yang memungkinkan pengguna memindahkan objek dan menanam pohon, mirip dengan gameplay di HayDay.

---

### Rencana Proyek

#### 1. **Persiapan Model Kota di Blender**
   - **Desain Kota**: Membuat model kota kecil di Blender yang mencakup elemen dasar seperti bangunan, jalan, dan area terbuka.
   - **Ekspor Model ke Format Web**: Mengekspor model ke format `.gltf` atau `.glb`, yang mudah diintegrasikan ke Three.js untuk tampilan di browser.

#### 2. **Setup Three.js**
   - **Mengatur Lingkungan Three.js**: Memasang Three.js di proyek dan membuat setup dasar "scene" dengan kamera dan renderer untuk menampilkan kota.
   - **Memuat Model Kota**: Menggunakan fungsi `GLTFLoader` di Three.js untuk memuat dan menampilkan model kota yang dibuat di Blender.

#### 3. **Interaksi Pengguna - Memindahkan Objek**
   - **Menangkap Klik Pengguna**: Menambahkan fitur untuk memungkinkan pengguna klik pada objek di kota, seperti mobil atau pot bunga.
   - **Memindahkan Objek yang Dipilih**: Pengguna dapat mengklik dan menarik objek yang dipilih ke lokasi lain dalam batas kota.
   - **Batasan Gerakan**: Memberikan batas gerakan agar objek hanya dapat dipindahkan dalam area tertentu untuk pengalaman yang lebih realistis.

#### 4. **Menambahkan Pohon di Kota**
   - **Tombol Penanaman Pohon**: Menambahkan tombol atau opsi di layar untuk mengaktifkan mode "Menanam Pohon."
   - **Pilih Lokasi Penanaman**: Dalam mode ini, pengguna dapat mengklik area tertentu seperti taman atau trotoar untuk menanam pohon.
   - **Munculkan Pohon Baru**: Setelah lokasi dipilih, pohon kecil akan muncul secara otomatis.
   - **Batas Jumlah Pohon**: Menetapkan jumlah maksimum pohon untuk menjaga kinerja aplikasi.

#### 5. **Antarmuka dan Pengalaman Pengguna (UX)**
   - **Instruksi di Layar**: Menyertakan panduan singkat yang menjelaskan cara memindahkan objek dan menanam pohon untuk membantu pengguna.
   - **Highlight Area Penanaman**: Area yang dapat ditanami pohon akan diberi tanda seperti perubahan warna atau pencahayaan untuk menunjukkan tempat yang sesuai.
   - **Fitur Reset**: Menyediakan tombol reset jika pengguna ingin mereset kota atau menghapus pohon.

#### 6. **Testing dan Optimasi**
   - **Uji Performa**: Menguji aplikasi di berbagai perangkat untuk memastikan aplikasi berjalan

<br>

•⁠  ⁠pohon tumbuh (pake slider)
•⁠  ⁠⁠matahari (efek cahaya dari movement nya)
•⁠  ⁠⁠move player (belum tau sih, gimana klo auto jalan terus cuma kita bisa drag n drop gitu)
•⁠  ⁠⁠siram pohon (bisa tumbuh)
