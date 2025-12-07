export interface Theme {
    dark: boolean;
    colors: {
        primary: string;
        background: string;
        card: string;
        text: string;
        border: string;
        notification: string;
        textSecondary: string;
        accent: string;
        error: string;
    };
}

export const LightTheme: Theme = {
    dark: false,
    colors: {
        primary: '#D35400', // Burnt Orange (Ethiopian spices)
        background: '#F5F5F5',
        card: '#FFFFFF',
        text: '#212121',
        border: '#E0E0E0',
        notification: '#FF3D00',
        textSecondary: '#757575',
        accent: '#FFC107', // Yellow/Gold
        error: '#D32F2F',
    },
};

export const DarkTheme: Theme = {
    dark: true,
    colors: {
        primary: '#E67E22',
        background: '#121212',
        card: '#1E1E1E',
        text: '#FFFFFF',
        border: '#2C2C2C',
        notification: '#FF3D00',
        textSecondary: '#B0B0B0',
        accent: '#FFD54F',
        error: '#EF5350',
    },
};
