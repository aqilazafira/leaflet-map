// script.js (Terintegrasi dengan Backend Node.js Baru)

// 🚨 Tentukan BASE_URL API
let BASE_URL;

// Cek mode operasi (Lokal vs. Produksi)
if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.protocol === "file:") {
    // Mode Lokal: Sesuaikan dengan PORT di server.js (sekarang 3000)
    BASE_URL = "http://localhost:3000"; 
    console.log(`Mode Lokal: Menggunakan BASE_URL: ${BASE_URL}`);
} else {
    // Mode Produksi: GANTI placeholder ini dengan URL deployment backend Anda!
    // Jika Anda deploy backend Anda ke Render/Heroku/Vercel/dll., masukkan URL tersebut di sini.
    BASE_URL = "https://your-backend-app.onrender.com"; 
    console.log(`Mode Produksi: Gunakan URL Backend yang sudah di-deploy: ${BASE_URL}`);
}
// --- Akhir penentuan BASE_URL ---


// Inisialisasi peta & posisi awal Bandung
const map = L.map('map').setView([-6.914744, 107.609810], 13);

// Tile layer OSM
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);


// ===============================
// 1. AMBIL LOKASI DARI DATABASE (READ)
// Panggilan ke: GET /api/locations
// ===============================
function fetchLocations() {
    fetch(`${BASE_URL}/api/locations`)
      .then(res => {
          if (!res.ok) {
              throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
      })
      .then(data => {
          // Hapus semua marker yang sudah ada sebelum menambahkan yang baru
          map.eachLayer(layer => {
              if (layer instanceof L.Marker) {
                  map.removeLayer(layer);
              }
          });

          data.forEach(m => {
              // Menggunakan nama properti baru: latitude, longitude, nama, deskripsi
              L.marker([m.latitude, m.longitude])
                .addTo(map)
                .bindPopup(`
                    <b>${m.nama}</b> (${m.kategori})<br>
                    ${m.deskripsi}<br><br>
                    <!-- Menggunakan _id MongoDB untuk identifikasi -->
                    <button 
                        onclick="deleteLocation('${m._id}')" 
                        style="background-color: #f44336; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;"
                    >
                        Hapus Lokasi
                    </button> 
                `);
          });
      })
      .catch(error => console.error('Gagal mengambil lokasi:', error));
}

// Panggil saat aplikasi dimuat
fetchLocations();


// ===============================
// 2. TAMBAH LOKASI KE DATABASE (CREATE)
// Panggilan ke: POST /api/locations (MENGGUNAKAN JSON)
// ===============================
map.on("click", function(e) {
    let nama = prompt("Nama Lokasi:");
    if (!nama) return;

    let deskripsi = prompt("Deskripsi Lokasi:");
    if (!deskripsi) return;

    let kategori = prompt("Kategori Lokasi (cth: Wisata, Kuliner, Sekolah):");
    if (!kategori) return;
    
    const newLocation = {
        nama: nama,
        deskripsi: deskripsi,
        kategori: kategori,
        latitude: e.latlng.lat,
        longitude: e.latlng.lng
    };

    fetch(`${BASE_URL}/api/locations`, {
        method: "POST",
        headers: {
            // Penting: Menggunakan JSON sesuai dengan konfigurasi backend (app.use(express.json()))
            "Content-Type": "application/json"
        },
        body: JSON.stringify(newLocation)
    })
    .then(res => res.json())
    .then(result => {
        // Asumsi backend mengembalikan lokasi yang baru disimpan
        alert(`Lokasi '${result.nama}' berhasil ditambahkan!`);
        fetchLocations(); // Muat ulang marker
    })
    .catch(error => console.error('Error saat menambah lokasi:', error));
});


// ===============================
// 3. HAPUS LOKASI DARI DATABASE (DELETE)
// Panggilan ke: DELETE /api/locations/:id
// ===============================
function deleteLocation(id) {
    if (!confirm("Anda yakin ingin menghapus lokasi ini?")) return;

    fetch(`${BASE_URL}/api/locations/${id}`, {
        method: "DELETE"
        // Tidak perlu body karena ID dikirim melalui URL
    })
    .then(res => res.json())
    .then(result => {
        // Asumsi backend mengembalikan pesan sukses
        alert(result.message);
        fetchLocations(); // Muat ulang marker
    })
    .catch(error => console.error('Error saat menghapus lokasi:', error));
}