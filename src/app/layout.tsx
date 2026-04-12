import type { Metadata, Viewport } from 'next';
import { Bitter, DM_Sans } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth';

const bitter = Bitter({ 
  subsets: ['latin'], 
  weight: ['600', '700', '800'],
  variable: '--font-bitter' 
});

const dmSans = DM_Sans({ 
  subsets: ['latin'], 
  weight: ['400', '500', '700'],
  variable: '--font-dm-sans'
});

export const viewport: Viewport = {
  themeColor: "#4A3728",
};

export const metadata: Metadata = {
  title: "G&S Good Stuff | Farm Operations",
  description: "Dahlia Tuber execution and administrative environment scaling beyond the bounds of ordinary fields.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${bitter.variable} ${dmSans.variable}`}>
      <body className="font-sans bg-cream text-root">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
