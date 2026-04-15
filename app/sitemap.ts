import { MetadataRoute } from 'next'
import { getAllProjects } from '@/lib/data'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://iica-chile-plataforma.vercel.app'
    const projects = await getAllProjects()

    const projectUrls = projects.map((p) => ({
        url: `${baseUrl}/proyecto/${p.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }))

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        ...projectUrls,
    ]
}
