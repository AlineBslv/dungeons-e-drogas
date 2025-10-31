import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Dungeons e Drogas - RPG Narrativo com IA',
    short_name: 'D&D IA',
    description: 'Sistema narrativo de RPG com Mestre Drogon, narrador de IA baseado em D&D 5e',
    start_url: '/',
    display: 'standalone',
    background_color: '#0C0B09',
    theme_color: '#C5A75B',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
