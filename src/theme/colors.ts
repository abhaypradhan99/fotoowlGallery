export const lightColors = {
  background: '#ffffff',
  surface: '#f5f5f5',
  text: '#000000',
  primary: '#6200ee',
  error: '#b00020',
};

export const darkColors = {
  background: '#121212',
  surface: '#1e1e1e',
  text: '#ffffff',
  primary: '#bb86fc',
  error: '#cf6679',
};

export const useThemeColors = (isDark: boolean) => (isDark ? darkColors : lightColors);