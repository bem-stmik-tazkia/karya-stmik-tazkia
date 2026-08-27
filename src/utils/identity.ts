export function getDeviceId(): string {
  if (typeof window === 'undefined') return 'unknown';
  
  let deviceId = localStorage.getItem('tazkia_device_id');
  
  if (!deviceId) {
    // Migrasi ID lama jika ada, agar histori like sebelumnya tidak hilang
    deviceId = localStorage.getItem('karya_device_id');
    
    if (!deviceId) {
      // Buat ID baru jika benar-benar pengunjung baru
      deviceId = 'dev_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
    
    // Simpan sebagai identitas universal yang baru
    localStorage.setItem('tazkia_device_id', deviceId);
    localStorage.removeItem('karya_device_id'); // Bersihkan yang lama
  }
  
  return deviceId;
}
