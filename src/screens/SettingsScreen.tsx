import React from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTranslation } from 'react-i18next';
import { useLocale } from '../context/LocaleContext';

type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

const SettingsScreen = () => {
    const { theme, isDark, toggleTheme } = useTheme();
    const { user, signOut } = useAuth();
    const navigation = useNavigation<SettingsScreenNavigationProp>();
    const { t } = useTranslation();
    const { language, setLanguage } = useLocale();

    const handleLogout = async () => {
        try {
            await signOut();
            Alert.alert(t('common.success'), t('settings.logoutSuccess'));
        } catch (error) {
            Alert.alert(t('common.error'), t('settings.logoutFailed'));
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.option, { borderBottomColor: theme.colors.border }]}>
                <Text style={[styles.text, { color: theme.colors.text }]}>{t('settings.darkMode')}</Text>
                <Switch
                    value={isDark}
                    onValueChange={toggleTheme}
                    trackColor={{ false: '#767577', true: theme.colors.primary }}
                    thumbColor={isDark ? theme.colors.accent : '#f4f3f4'}
                />
            </View>

            <View style={[styles.option, { borderBottomColor: theme.colors.border }]}>
                <Text style={[styles.text, { color: theme.colors.text }]}>{t('settings.language')}</Text>
                <View style={styles.languageButtons}>
                    <TouchableOpacity
                        style={[
                            styles.languageButton,
                            {
                                borderColor: theme.colors.border,
                                backgroundColor: language === 'en' ? theme.colors.primary : theme.colors.card
                            }
                        ]}
                        onPress={() => setLanguage('en')}
                        activeOpacity={0.8}
                    >
                        <Text style={[
                            styles.languageButtonText,
                            { color: language === 'en' ? '#FFF' : theme.colors.text }
                        ]}>
                            {t('settings.english')}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.languageButton,
                            {
                                borderColor: theme.colors.border,
                                backgroundColor: language === 'am' ? theme.colors.primary : theme.colors.card
                            }
                        ]}
                        onPress={() => setLanguage('am')}
                        activeOpacity={0.8}
                    >
                        <Text style={[
                            styles.languageButtonText,
                            { color: language === 'am' ? '#FFF' : theme.colors.text }
                        ]}>
                            {t('settings.amharic')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity
                style={[styles.option, { borderBottomColor: theme.colors.border }]}
                onPress={() => navigation.navigate('Preferences')}
                activeOpacity={0.8}
            >
                <Text style={[styles.text, { color: theme.colors.text }]}>{t('settings.foodPreferences')}</Text>
                <Text style={[styles.linkText, { color: theme.colors.primary }]}>{t('common.edit')}</Text>
            </TouchableOpacity>

            {user ? (
                <View style={styles.authContainer}>
                    <Text style={[styles.emailText, { color: theme.colors.text }]}>
                        {t('settings.loggedInAs', { email: user.email ?? '' })}
                    </Text>
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: theme.colors.error }]}
                        onPress={handleLogout}
                    >
                        <Text style={styles.buttonText}>{t('settings.logout')}</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.authContainer}>
                    <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                        {t('settings.loginToRate')}
                    </Text>
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: theme.colors.primary }]}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.buttonText}>{t('settings.login')}</Text>
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
    languageButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    languageButton: {
        borderWidth: 1,
        borderRadius: 12,
        paddingVertical: 6,
        paddingHorizontal: 10,
    },
    languageButtonText: {
        fontSize: 13,
        fontWeight: '600',
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
    linkText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default SettingsScreen;
