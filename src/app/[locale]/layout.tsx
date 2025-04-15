import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import '../globals.css';
import { i18n } from '../i18n/i18n-config';
import { getDictionary } from '../i18n/dictionaries';
import { Locale } from '../i18n/i18n-config';
import { ThemeProvider } from 'next-themes'; // Import ThemeProvider
import { MoonIcon, SunIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "next-themes";
import { useEffect, useState } from 'react';


const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Firebase Studio App',
  description: 'Generated by Firebase Studio',
};

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale }))
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { locale: Locale };
}>) {
  const dictionary = await getDictionary(params.locale);

  return (
    <html lang={params.locale} dir={params.locale === 'ar' ? 'rtl' : 'ltr'}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="fixed top-0 left-0 w-full h-16 bg-background/95 backdrop-blur border-b z-50">
            <div className="container max-w-7xl mx-auto flex items-center justify-between h-full px-4">
              <span className="font-bold">Firebase Studio App</span>
              <div className="flex items-center space-x-4">
                <LanguageSwitcher locale={params.locale} />
                <ThemeToggleButton />
              </div>
            </div>
          </div>
          <div className="mt-16">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}

function LanguageSwitcher({ locale }: { locale: Locale }) {
  return (
    <Select defaultValue={locale} onValueChange={(value: Locale) => {
      if (value !== locale) {
        window.location.href = `/${value}`;
      }
    }}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a language" />
      </SelectTrigger>
      <SelectContent>
        {i18n.locales.map((locale) => (
          <SelectItem key={locale} value={locale}>
            {locale}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function ThemeToggleButton() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
      {theme === "light" ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
    </button>
  );
}

