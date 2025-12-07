import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Platform } from 'react-native';
import { useError } from '../context/ErrorContext';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const ErrorPopup = () => {
    const { error, hideError } = useError();
    const { theme } = useTheme();
    const translateY = useRef(new Animated.Value(-100)).current;

    useEffect(() => {
        if (error) {
            Animated.spring(translateY, {
                toValue: 0,
                useNativeDriver: true,
                speed: 12,
                bounciness: 8,
            }).start();
        } else {
            Animated.timing(translateY, {
                toValue: -100,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [error]);

    if (!error) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    backgroundColor: theme.colors.error || '#FF5252',
                    transform: [{ translateY }],
                },
            ]}
        >
            <View style={styles.content}>
                <Ionicons name="alert-circle" size={24} color="#FFF" />
                <Text style={styles.text}>{error}</Text>
            </View>
            <TouchableOpacity onPress={hideError} style={styles.closeButton}>
                <Ionicons name="close" size={20} color="#FFF" />
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 40,
        left: 20,
        right: 20,
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
        zIndex: 9999,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    text: {
        color: '#FFF',
        marginLeft: 12,
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
    },
    closeButton: {
        padding: 4,
        marginLeft: 8,
    },
});

export default ErrorPopup;
