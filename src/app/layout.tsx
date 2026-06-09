import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export const metadata: Metadata = {
  title: 'Free AI Portfolio Website Builder | Resume to Portfolio in 2 Minutes - PortfolioAI',
  description: 'Turn your resume into a stunning portfolio website using AI. Free to try, no signup needed to preview. Perfect for job seekers, developers, designers, marketers. Get hired faster with a professional online portfolio in just 2 minutes.',
  keywords: 'resume to portfolio, free portfolio website builder, AI portfolio generator, job seeker portfolio, online portfolio maker, personal website builder, developer portfolio, designer portfolio, free resume website, portfolio website free, create portfolio website, professional portfolio online, portfolio builder free, AI resume builder, online CV maker, personal branding website, portfolio for recruiters, get hired portfolio, job application portfolio, free website builder for job seekers, portfolio website examples, software engineer portfolio template, UX designer portfolio, data scientist portfolio, marketing portfolio, build portfolio in minutes, AI website generator, professional resume website, online portfolio for jobs',
  authors: [{ name: 'PortfolioAI' }],
  creator: 'PortfolioAI',
  publisher: 'PortfolioAI',
  metadataBase: new URL('https://portfolioai.company'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://portfolioai.company',
    siteName: 'PortfolioAI',
    title: 'Turn Your Resume Into a Portfolio Website with AI - Free',
    description: 'AI-powered portfolio builder for job seekers. Upload resume, get a professional website in 2 minutes. Free to try.',
    images: [{
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'PortfolioAI, AI-Powered Portfolio Generator',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free AI Portfolio Builder - Resume to Website in 2 Minutes',
    description: 'Upload your resume. Get a world-class portfolio in 2 minutes.',
    images: ['/og-image.png'],
    creator: '@portfolioai',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'gkpbVYO9P0VWOgavyXM6pZgIGamN8PFWlmCwpR1pPMA',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://portfolioai.company" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "PortfolioAI",
          "alternateName": "Portfolio AI",
          "url": "https://portfolioai.company",
          "description": "AI-powered portfolio website generator. Turn your resume into a professional portfolio website in 2 minutes. Free to try.",
          "applicationCategory": "BusinessApplication",
          "applicationSubCategory": "Portfolio Builder",
          "operatingSystem": "Web Browser",
          "browserRequirements": "Requires JavaScript. Requires HTML5.",
          "softwareVersion": "1.0",
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "ratingCount": "127",
            "bestRating": "5",
            "worstRating": "1"
          },
          "featureList": [
            "AI-powered portfolio generation",
            "Resume to website conversion",
            "Profession-specific templates",
            "Mobile responsive design",
            "SEO optimized",
            "Custom domain support"
          ],
          "offers": {
            "@type": "Offer",
            "price": "4.99",
            "priceCurrency": "USD",
            "priceValidUntil": "2027-12-31",
            "availability": "https://schema.org/InStock",
            "url": "https://portfolioai.company/pricing"
          }
        })}} />
      </head>
      <body className={inter.className}>
        <Toaster position="top-right" />
        {children}
        <SpeedInsights />
      </body>
    </html>
  )
}