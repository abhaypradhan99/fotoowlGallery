import { lightColors, darkColors } from './colors';
import { Appearance } from 'react-native';

export type ThemeColors = typeof lightColors;

export const getSystemTheme = () => Appearance.getColorScheme() === 'dark';

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDark, setIsDark] = useState(getSystemTheme());
  // Toggle logic here
  const colors = isDark ? darkColors : lightColors;
  return <ThemeContext.Provider value={{ colors, isDark, setIsDark }}>{children}</ThemeContext.Provider>;
};