import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ShoppingItem {
    id: string;
    name: string;
    measure: string;
    checked: boolean;
    recipeId?: string;
    recipeName?: string;
}

interface ShoppingListContextType {
    items: ShoppingItem[];
    addItem: (item: Omit<ShoppingItem, 'id' | 'checked'>) => void;
    addItems: (items: Omit<ShoppingItem, 'id' | 'checked'>[]) => void;
    removeItem: (id: string) => void;
    toggleItem: (id: string) => void;
    clearList: () => void;
}

const ShoppingListContext = createContext<ShoppingListContextType>({
    items: [],
    addItem: () => { },
    addItems: () => { },
    removeItem: () => { },
    toggleItem: () => { },
    clearList: () => { },
});

export const ShoppingListProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<ShoppingItem[]>([]);
    const hasLoadedRef = useRef(false);
    const skipNextSaveRef = useRef(true);

    useEffect(() => {
        loadList();
    }, []);

    useEffect(() => {
        if (!hasLoadedRef.current) return;
        if (skipNextSaveRef.current) {
            skipNextSaveRef.current = false;
            return;
        }
        saveList(items);
    }, [items]);

    const loadList = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('shoppingList');
            if (jsonValue != null) {
                skipNextSaveRef.current = true;
                setItems(JSON.parse(jsonValue));
            } else {
                skipNextSaveRef.current = false;
            }
        } catch (e) {
            console.log('Failed to load shopping list');
        } finally {
            hasLoadedRef.current = true;
        }
    };

    const saveList = async (newItems: ShoppingItem[]) => {
        try {
            const jsonValue = JSON.stringify(newItems);
            await AsyncStorage.setItem('shoppingList', jsonValue);
        } catch (e) {
            console.log('Failed to save shopping list');
        }
    };

    const addItem = (item: Omit<ShoppingItem, 'id' | 'checked'>) => {
        const newItem: ShoppingItem = {
            ...item,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            checked: false,
        };
        setItems(prevItems => {
            const newItems = [...prevItems, newItem];
            return newItems;
        });
    };

    const addItems = (itemsToAdd: Omit<ShoppingItem, 'id' | 'checked'>[]) => {
        if (!itemsToAdd.length) return;
        setItems(prevItems => {
            const idBase = Date.now().toString();
            const newItems: ShoppingItem[] = itemsToAdd.map((item, index) => ({
                ...item,
                id: `${idBase}-${index}-${Math.random().toString(36).slice(2, 11)}`,
                checked: false,
            }));
            return [...prevItems, ...newItems];
        });
    };

    const removeItem = (id: string) => {
        setItems(prevItems => {
            const newItems = prevItems.filter(item => item.id !== id);
            return newItems;
        });
    };

    const toggleItem = (id: string) => {
        setItems(prevItems => {
            const newItems = prevItems.map(item =>
                item.id === id ? { ...item, checked: !item.checked } : item
            );
            return newItems;
        });
    };

    const clearList = () => {
        setItems([]);
    };

    return (
        <ShoppingListContext.Provider value={{ items, addItem, addItems, removeItem, toggleItem, clearList }}>
            {children}
        </ShoppingListContext.Provider>
    );
};

export const useShoppingList = () => useContext(ShoppingListContext);
