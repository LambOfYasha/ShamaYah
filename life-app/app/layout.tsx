import type { Metadata } from "next";
import "./globals.css";
import "./themes.css";

export const metadata: Metadata = {
  title: "Light Is For Everyone",
  description: "Ask questions, get answers, and grow spiritually together",
  icons: {
    icon: [
      { url: '/assets/logo_light.png', type: 'image/png' },
      { url: '/assets/logo_dark.png', type: 'image/png', media: '(prefers-color-scheme: dark)' }
    ],
    apple: '/assets/logo_light.png',
    shortcut: '/assets/logo_light.png'
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
