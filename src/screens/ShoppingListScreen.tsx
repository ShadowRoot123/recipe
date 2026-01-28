import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useShoppingList, ShoppingItem } from '../context/ShoppingListContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const ShoppingListScreen = () => {
    const { items, toggleItem, removeItem, clearList } = useShoppingList();
    const { theme } = useTheme();
    const { t } = useTranslation();

    const confirmClear = () => {
        Alert.alert(
            t('shopping.clearListTitle'),
            t('shopping.clearListMessage'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                { text: t('common.clear'), style: 'destructive', onPress: clearList },
            ]
        );
    };

    const renderItem = ({ item }: { item: ShoppingItem }) => (
        <View style={[styles.itemContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <TouchableOpacity onPress={() => toggleItem(item.id)} style={styles.checkContainer}>
                <Ionicons
                    name={item.checked ? 'checkbox' : 'square-outline'}
                    size={24}
                    color={item.checked ? theme.colors.primary : theme.colors.textSecondary}
                />
            </TouchableOpacity>
            <View style={styles.textContainer}>
                <Text style={[
                    styles.itemText,
                    { color: theme.colors.text },
                    item.checked && { textDecorationLine: 'line-through', color: theme.colors.textSecondary }
                ]}>
                    {item.measure} {item.name}
                </Text>
                {item.recipeName && (
                    <Text style={[styles.recipeText, { color: theme.colors.textSecondary }]}>
                        {t('common.from')} {item.recipeName}
                    </Text>
                )}
            </View>
            <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.deleteButton}>
                <Ionicons name="trash-outline" size={24} color={theme.colors.error} />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.colors.text }]}>{t('shopping.title')}</Text>
                {items.length > 0 && (
                    <TouchableOpacity onPress={confirmClear}>
                        <Text style={[styles.clearText, { color: theme.colors.error }]}>{t('common.clearAll')}</Text>
                    </TouchableOpacity>
                )}
            </View>

            {items.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="cart-outline" size={64} color={theme.colors.textSecondary} />
                    <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                        {t('shopping.empty')}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={items}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    clearText: {
        fontSize: 16,
    },
    list: {
        paddingBottom: 16,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        marginBottom: 8,
    },
    checkContainer: {
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    itemText: {
        fontSize: 16,
        fontWeight: '500',
    },
    recipeText: {
        fontSize: 12,
        marginTop: 4,
    },
    deleteButton: {
        padding: 4,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
    },
});

export default ShoppingListScreen;
