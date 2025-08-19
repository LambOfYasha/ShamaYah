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
    if (!settings) return;

    const { appearance } = settings;
    
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
    document.documentElement.setAttribute('data-theme', appearance.theme);
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
