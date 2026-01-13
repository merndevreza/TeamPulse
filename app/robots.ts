import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const vercelEnv = process.env.VERCEL_ENV;
  
  // Use a more specific check for the base URL.
  // Vercel provides VERCEL_URL for preview deployments, otherwise default to the production domain.
  const baseUrl = vercelEnv === 'production' 
    ? 'https://www.mansfieldmgmt.com'
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
  
  // Block all crawling in development/staging/preview
  if (vercelEnv !== 'production') {
    return {
      rules: {
        userAgent: '*',
        disallow: '/', // Disallow everything for non-production environments
      },
    }
  }

  // Allow crawling only in production
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/', '/admin/', '/.well-known/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}