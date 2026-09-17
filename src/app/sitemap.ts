import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://karya.stmik.tazkia.ac.id',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    // Halaman lain dapat ditambahkan di sini secara dinamis nantinya
  ];
}
