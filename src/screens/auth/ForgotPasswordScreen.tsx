import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

type ForgotPasswordScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const { theme } = useTheme();
    const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
    const { t } = useTranslation();
    const { resetPassword } = useAuth();

    const handleResetPassword = async () => {
        if (!email) {
            Alert.alert(t('common.error'), 'Please enter your email address.');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert(t('common.error'), 'Please enter a valid email address.');
            return;
        }

        setLoading(true);
        try {
            await resetPassword(email);
            Alert.alert(
                'Check Your Email',
                'Password reset instructions have been sent to your email address. Please check your inbox.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error: any) {
            Alert.alert(t('common.error'), error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.title, { color: theme.colors.primary }]}>
                {t('auth.forgotPassword.title', { defaultValue: 'Reset Password' })}
            </Text>

            <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
                {t('auth.forgotPassword.description', {
                    defaultValue: 'Enter your email address and we\'ll send you instructions to reset your password.'
                })}
            </Text>

            <View style={styles.inputContainer}>
                <TextInput
                    style={[styles.input, {
                        backgroundColor: theme.colors.card,
                        color: theme.colors.text,
                        borderColor: theme.colors.border
                    }]}
                    placeholder={t('auth.login.emailPlaceholder')}
                    placeholderTextColor={theme.colors.textSecondary}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
            </View>

            <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.colors.primary }]}
                onPress={handleResetPassword}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#FFF" />
                ) : (
                    <Text style={styles.buttonText}>
                        {t('auth.forgotPassword.button', { defaultValue: 'Send Reset Link' })}
                    </Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Text style={[styles.backText, { color: theme.colors.textSecondary }]}>
                    {t('auth.forgotPassword.backToLogin', { defaultValue: 'Back to Login' })}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 22,
    },
    inputContainer: {
        marginBottom: 20,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
    },
    button: {
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    backButton: {
        alignItems: 'center',
    },
    backText: {
        fontSize: 16,
    },
});

export default ForgotPasswordScreen;
