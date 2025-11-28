// script.js
// URL backend setelah di-deploy di Render
const BACKEND_URL = "https://your-render-app-name.onrender.com/api/locations"; // GANTI INI

// Inisialisasi peta dan posisi awal (Bandung)
const map = L.map('map').setView([-6.914744, 107.609810], 13);

// Tile layer (seperti sebelumnya)
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// --- Fungsi untuk memuat dan menampilkan lokasi dari Backend ---
async function loadLocations() {
    try {
        const response = await fetch(BACKEND_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const locations = await response.json();

        locations.forEach(location => {
            let layer;

            switch (location.type) {
                case 'marker':
                    // Marker menggunakan [lat, lng]
                    const [lat, lng] = location.coordinates; 
                    layer = L.marker([lat, lng]);
                    
                    if (location.properties.popupText) {
                        layer.bindPopup(location.properties.popupText).openPopup();
                    }
                    break;
                case 'circle':
                    // Circle menggunakan [lat, lng], radius, dan options
                    const [cLat, cLng] = location.coordinates;
                    layer = L.circle([cLat, cLng], {
                        color: location.properties.color || '#00ff99',
                        fillColor: location.properties.fillColor || '#00ff99',
                        fillOpacity: location.properties.fillOpacity || 0.3,
                        radius: location.properties.radius || 500
                    });

                    if (location.properties.popupText) {
                         layer.bindPopup(location.properties.popupText);
                    }
                    break;
                case 'polygon':
                    // Polygon menggunakan array of [lat, lng]
                    layer = L.polygon(location.coordinates);

                    if (location.properties.popupText) {
                        layer.bindPopup(location.properties.popupText);
                    }
                    break;
                default:
                    console.warn(`Unknown location type: ${location.type}`);
                    return; 
            }

            if (layer) {
                layer.addTo(map);
            }
        });

        console.log(`Loaded ${locations.length} locations from backend.`);

    } catch (error) {
        console.error("Failed to load locations from backend:", error);
        // Tampilkan data statis jika gagal koneksi
        addStaticLocations(); 
    }
}

// Data statis yang Anda buat sebelumnya (dapat dihapus jika yakin backend berfungsi)
function addStaticLocations() {
    // Tambahkan marker di Alun-Alun Bandung
    L.marker([-6.9218, 107.6079])
      .addTo(map)
      .bindPopup("<b>Alun-Alun Bandung (Static)</b><br>Pusat kota Bandung yang ramai.")
      .openPopup();

    // Tambahkan lingkaran di sekitar Gedung Sate
    L.circle([-6.9025, 107.6187], {
      color: '#00ff99',
      fillColor: '#00ff99',
      fillOpacity: 0.3,
      radius: 800
    }).addTo(map).bindPopup("Area sekitar Gedung Sate (Static)");
    
    // Tambahkan polygon area (contoh area sekitar Dago)
    L.polygon([
      [-6.887, 107.610],
      [-6.890, 107.625],
      [-6.905, 107.622]
    ]).addTo(map).bindPopup("Area Dago Atas (Static)");
}

// Panggil fungsi untuk memuat lokasi saat script dijalankan
loadLocations();