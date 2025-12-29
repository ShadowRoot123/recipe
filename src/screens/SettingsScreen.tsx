import React from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

const SettingsScreen = () => {
    const { theme, isDark, toggleTheme } = useTheme();
    const { user, signOut } = useAuth();
    const navigation = useNavigation<SettingsScreenNavigationProp>();

    const handleLogout = async () => {
        try {
            await signOut();
            Alert.alert('Success', 'Logged out successfully');
        } catch (error) {
            Alert.alert('Error', 'Failed to log out');
        }
    };

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

            {user ? (
                <View style={styles.authContainer}>
                    <Text style={[styles.emailText, { color: theme.colors.text }]}>
                        Logged in as: {user.email}
                    </Text>
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: theme.colors.error }]}
                        onPress={handleLogout}
                    >
                        <Text style={styles.buttonText}>Logout</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.authContainer}>
                    <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                        Log in to rate recipes and add comments.
                    </Text>
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: theme.colors.primary }]}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.buttonText}>Login</Text>
                    </TouchableOpacity>
                </View>
            )}
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
    authContainer: {
        marginTop: 32,
        alignItems: 'center',
    },
    emailText: {
        fontSize: 16,
        marginBottom: 16,
    },
    infoText: {
        fontSize: 14,
        marginBottom: 16,
        textAlign: 'center',
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 8,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default SettingsScreen;
