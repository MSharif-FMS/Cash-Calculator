'use client';

import { useLanguage } from '@/contexts/language-context';
import { LanguageSwitcher } from './language-switcher';
import { ThemeToggle } from './theme-toggle';
import { LayoutDashboard } from 'lucide-react'; // Import the desired icon

export function AppHeader() {
  const { t } = useLanguage();
  
  return (
    <header className="fixed top-0 left-0 w-full h-16 bg-background/95 backdrop-blur border-b z-50">
      <div className="container max-w-7xl mx-auto flex items-center justify-between h-full px-4">
        <div className="flex items-center">
          <LayoutDashboard className="mr-2 h-6 w-6" /> {/* Add the icon here */}
          <span className="font-bold text-xl">{t('appName')}</span> {/* Use the application name directly */}
        </div>
        <div className="flex items-center space-x-4">
         <span className='m-4'> <ThemeToggle /></span>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
