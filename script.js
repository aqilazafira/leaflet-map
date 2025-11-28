// script.js (Terintegrasi dengan Backend Node.js)

// 🚨 Tentukan BASE_URL API
let BASE_URL;

// Cek mode operasi (Lokal vs. Produksi)
if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.protocol === "file:") {
    // Mode Lokal: Backend berjalan di localhost
    BASE_URL = "http://localhost:5000";
    console.log(`Mode Lokal: Menggunakan BASE_URL: ${BASE_URL}`);
} else {
    // Mode Produksi: Ganti dengan URL deployment backend Anda
    BASE_URL = "https://backend-leaflet.vercel.app";
    console.log(`Mode Produksi: Gunakan URL Backend yang sudah di-deploy: ${BASE_URL}`);
}

// Inisialisasi peta & posisi awal Bandung
const map = L.map('map').setView([-6.914744, 107.609810], 13);

// Tile layer OSM
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// ===============================
// 1. AMBIL LOKASI DARI DATABASE (READ)
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
            // Hapus marker lama
            map.eachLayer(layer => {
                if (layer instanceof L.Marker) {
                    map.removeLayer(layer);
                }
            });

            data.forEach(m => {
                L.marker([m.latitude, m.longitude])
                    .addTo(map)
                    .bindPopup(`
                        <b>${m.nama}</b> (${m.kategori})<br>
                        ${m.deskripsi}<br><br>
                        <button 
                            onclick="deleteLocation('${m._id}')" 
                            style="background-color: #f44336; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;"
                        >
                            Hapus Lokasi
                        </button> 
                    `);
            });
        })
        .catch(error => {
            console.error('Gagal mengambil lokasi:', error);
            alert('Gagal mengambil data lokasi. Pastikan backend berjalan di ' + BASE_URL);
        });
}

// Panggil saat aplikasi dimuat
fetchLocations();

// ===============================
// 2. TAMBAH LOKASI KE DATABASE (CREATE)
// ===============================
map.on("click", function (e) {
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
            "Content-Type": "application/json"
        },
        body: JSON.stringify(newLocation)
    })
        .then(res => res.json())
        .then(result => {
            console.log('Response dari backend:', result);
            alert(`Lokasi '${nama}' berhasil ditambahkan!`);
            fetchLocations();
        })
        .catch(error => {
            console.error('Error saat menambah lokasi:', error);
            alert('Gagal menambahkan lokasi!');
        });
});

// ===============================
// 3. HAPUS LOKASI DARI DATABASE (DELETE)
// ===============================
function deleteLocation(id) {
    if (!confirm("Anda yakin ingin menghapus lokasi ini?")) return;

    fetch(`${BASE_URL}/api/locations/${id}`, {
        method: "DELETE"
    })
        .then(res => res.json())
        .then(result => {
            alert(result.message);
            fetchLocations();
        })
        .catch(error => console.error('Error saat menghapus lokasi:', error));
}