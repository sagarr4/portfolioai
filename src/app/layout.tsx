import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export const metadata: Metadata = {
  title: 'PortfolioAI, Turn Your Resume Into a World-Class Portfolio Website',
  description: 'Upload your PDF resume and get a stunning, AI-generated portfolio website in 2 minutes. Designed specifically for your profession. Used by 2,000+ job seekers.',
  keywords: 'portfolio website, AI portfolio generator, resume to portfolio, free portfolio website, job seeker portfolio, software engineer portfolio, UX designer portfolio',
  authors: [{ name: 'PortfolioAI' }],
  creator: 'PortfolioAI',
  publisher: 'PortfolioAI',
  metadataBase: new URL('https://portfolioai.company'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://portfolioai.company',
    siteName: 'PortfolioAI',
    title: 'PortfolioAI, Turn Your Resume Into a World-Class Portfolio Website',
    description: 'Upload your PDF resume and get a stunning, AI-generated portfolio website in 2 minutes. Designed specifically for your profession.',
    images: [{
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'PortfolioAI, AI-Powered Portfolio Generator',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PortfolioAI, Turn Your Resume Into a World-Class Portfolio',
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
    google: 'add-your-google-search-console-code-here',
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
          "url": "https://portfolioai.company",
          "description": "AI-powered portfolio website generator. Upload your resume and get a world-class portfolio in 2 minutes.",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          }
        })}} />
      </head>
      <body className={inter.className}>
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  )
}