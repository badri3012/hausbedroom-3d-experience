import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://hausbedroom.sg',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
      images: [
        'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=2000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1540518614846-7ede433c517a?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1558882224-dda166733046?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop',
      ],
    },
  ];
}
