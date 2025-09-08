
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Theme {
  background: string;
  text: string;
  textSecondary: string;
  primary: string;
  surface: string;
  error: string;
}

interface ThemeContextType {
  isDark: boolean;
  colors: Theme;
  toggleTheme: () => void;
}

const lightTheme: Theme = {
  background: '#FFFFFF',
  text: '#000000',
  textSecondary: '#666666',
  primary: '#007AFF',
  surface: '#F0F0F0',
  error: '#FF3B30',
};

const darkTheme: Theme = {
  background: '#000000',
  text: '#FFFFFF',
  textSecondary: '#999999',
  primary: '#0A84FF',
  surface: '#1C1C1E',
  error: '#FF453A',
};

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  colors: lightTheme,
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(Appearance.getColorScheme() === 'dark');

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme) {
        setIsDark(savedTheme === 'dark');
      }
    };
    loadTheme();

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setIsDark(colorScheme === 'dark');
    });
    return () => subscription.remove();
  }, []);

  const toggleTheme = async () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const colors = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ isDark, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
