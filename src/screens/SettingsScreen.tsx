
import React from 'react';
import { View, Switch, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const SettingsScreen: React.FC = () => {
  const { isDark, toggleTheme, colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.row}>
        <Text style={{ color: colors.text }}>Dark Mode</Text>
        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          trackColor={{ false: colors.textSecondary, true: colors.primary }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
});

export default SettingsScreen;
