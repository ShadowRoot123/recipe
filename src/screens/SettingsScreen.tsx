import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const SettingsScreen = () => {
    const { theme, isDark, toggleTheme } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.option, { borderBottomColor: theme.colors.border }]}>
                <Text style={[styles.text, { color: theme.colors.text }]}>Dark Mode</Text>
                <Switch
                    value={isDark}
                    onValueChange={toggleTheme}
                    trackColor={{ false: '#767577', true: theme.colors.primary }}
                    thumbColor={isDark ? theme.colors.accent : '#f4f3f4'}
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
    option: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    text: {
        fontSize: 18,
    },
});

export default SettingsScreen;
