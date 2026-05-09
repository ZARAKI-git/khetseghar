import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import Script from 'next/script'
import './globals.css'

const geistSans = Geist({ 
  subsets: ["latin"],
  variable: '--font-geist-sans',
});
const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: 'KhetSeGhar - Farm Fresh to Your Doorstep',
  description: 'Buy fresh produce directly from Indian farmers. Set your own prices, chat with farmers, and get farm-fresh crops delivered to your doorstep.',
  keywords: ['farmers market', 'direct from farm', 'fresh produce', 'Indian agriculture', 'kisan', 'organic'],
}

export const viewport: Viewport = {
  themeColor: '#2d8a4e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <div id="google_translate_element" style={{ display: 'none' }}></div>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
        <Script id="google-translate-init" strategy="afterInteractive">
          {`
            function googleTranslateElementInit() {
              new google.translate.TranslateElement({
                pageLanguage: 'en',
                includedLanguages: 'hi,bn,te,mr,ta,ur,gu,kn,or,ml,pa,as,mai,sat,ks,ne,sd,kok,doi,mni,bho,en',
                layout: google.translate.TranslateElement.InlineLayout.SIMPLE
              }, 'google_translate_element');
            }
          `}
        </Script>
        <Script src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" strategy="afterInteractive" />
        <style dangerouslySetInnerHTML={{
          __html: `
            body { top: 0 !important; }
            .skiptranslate iframe { display: none !important; }
            #goog-gt-tt { display: none !important; }
          `
        }} />
      </body>
    </html>
  )
}
