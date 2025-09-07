"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { getUserSettings } from '@/action/settingsActions';

export interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    moderation: boolean;
    community: boolean;
    marketing: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private';
    activityStatus: boolean;
    contentVisibility: 'public' | 'friends' | 'private';
    dataCollection: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    fontSize: 'small' | 'medium' | 'large';
    compactMode: boolean;
    reducedMotion: boolean;
  };
}

interface SettingsContextType {
  settings: UserSettings | null;
  loading: boolean;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  isCompactMode: boolean;
  isReducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large';
  theme: 'light' | 'dark' | 'system';
}

const defaultSettings: UserSettings = {
  notifications: {
    email: true,
    push: true,
    moderation: true,
    community: true,
    marketing: false
  },
  privacy: {
    profileVisibility: 'public',
    activityStatus: true,
    contentVisibility: 'public',
    dataCollection: true
  },
  appearance: {
    theme: 'light',
    fontSize: 'medium',
    compactMode: false,
    reducedMotion: false
  }
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useUser();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user settings
  useEffect(() => {
    const loadSettings = async () => {
      if (!isLoaded) return;
      
      if (!isSignedIn) {
        setSettings(defaultSettings);
        setLoading(false);
        return;
      }

      try {
        const result = await getUserSettings();
        if (result.success && result.settings) {
          setSettings(result.settings);
        } else {
          setSettings(defaultSettings);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
        setSettings(defaultSettings);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [isSignedIn, isLoaded]);

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => prev ? { ...prev, ...newSettings } : null);
  };

  // Apply settings to document
  useEffect(() => {
    // Apply default theme if settings are not loaded yet
    if (!settings) {
      const savedTheme = localStorage.getItem('theme') || 'light';
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
      console.log('Fallback theme applied:', savedTheme, 'Classes:', document.documentElement.className);
      return;
    }

    const { appearance } = settings;
    
    // Ensure we have a valid theme
    const theme = appearance.theme || 'light';
    
    // Apply compact mode
    if (appearance.compactMode) {
      document.documentElement.classList.add('compact-mode');
    } else {
      document.documentElement.classList.remove('compact-mode');
    }

    // Apply reduced motion
    if (appearance.reducedMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }

    // Apply font size
    document.documentElement.classList.remove('text-small', 'text-medium', 'text-large');
    document.documentElement.classList.add(`text-${appearance.fontSize}`);

    // Apply theme
    const applyTheme = () => {
      const root = document.documentElement;
      
      // Remove existing theme classes
      root.classList.remove('light', 'dark');
      
      let appliedTheme = theme;
      
      if (theme === 'system') {
        // Use system preference
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        appliedTheme = systemPrefersDark ? 'dark' : 'light';
      }
      
      // Apply theme class and data attribute
      root.classList.add(appliedTheme);
      root.setAttribute('data-theme', appliedTheme);
      
      // Save to localStorage for immediate application on next load
      localStorage.setItem('theme', appliedTheme);
      
      // Debug logging
      console.log('Theme applied:', appliedTheme, 'Classes:', root.className);
    };

    applyTheme();

    // Listen for system theme changes when using system preference
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme();
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [settings]);

  const value: SettingsContextType = {
    settings,
    loading,
    updateSettings,
    isCompactMode: settings?.appearance.compactMode ?? false,
    isReducedMotion: settings?.appearance.reducedMotion ?? false,
    fontSize: settings?.appearance.fontSize ?? 'medium',
    theme: settings?.appearance.theme ?? 'light'
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
