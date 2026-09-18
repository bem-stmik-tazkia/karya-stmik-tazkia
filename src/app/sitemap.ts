import { MetadataRoute } from 'next';
import { getKarya, getMahasiswaProfiles } from '@/lib/data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://karya.stmik.tazkia.ac.id';

  // Rute statis yang ingin diindeks (exclude admin, inbox, auth, submit)
  const staticPaths = [
    '',
    '/explore',
    '/feed',
    '/karya',
    '/mahasiswa',
    '/project',
    '/student',
    '/about',
    '/privacy',
    '/terms',
  ];

  const staticRoutes = staticPaths.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  try {
    // Ambil data dinamis dari Supabase
    const [karya, mahasiswa] = await Promise.all([
      getKarya(),
      getMahasiswaProfiles(),
    ]);

    // Rute dinamis untuk detail karya (/karya/[id] dan /project/[id])
    const karyaRoutes = karya.map((k) => ({
      url: `${baseUrl}/karya/${k.id}`,
      lastModified: new Date(k.created_at || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
    
    const projectRoutes = karya.map((k) => ({
      url: `${baseUrl}/project/${k.id}`,
      lastModified: new Date(k.created_at || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    // Rute dinamis untuk profil mahasiswa (/mahasiswa/[id] dan /student/[id])
    const mahasiswaRoutes = mahasiswa.map((m) => ({
      url: `${baseUrl}/mahasiswa/${m.id}`,
      lastModified: new Date(m.updated_at || m.created_at || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
    
    const studentRoutes = mahasiswa.map((m) => ({
      url: `${baseUrl}/student/${m.id}`,
      lastModified: new Date(m.updated_at || m.created_at || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    return [
      ...staticRoutes,
      ...karyaRoutes,
      ...projectRoutes,
      ...mahasiswaRoutes,
      ...studentRoutes,
    ];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Jika gagal fetch, minimal kembalikan rute statis
    return staticRoutes;
  }
}
