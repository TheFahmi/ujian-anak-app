import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                primary: '#1990e6',
                secondary: '#4ECDC4',
                accent: '#FFE66D',
                success: '#95E1D3',
                warning: '#FFD93D',
                error: '#FF8B94',
                background: '#F7FFF7',
                'card-bg': '#FFFFFF',
                text: '#292F36',
                'background-light': '#f6f7f8',
                'background-dark': '#111a21',
            },
            borderRadius: {
                'DEFAULT': '0.25rem',
                'lg': '0.5rem',
                'xl': '0.75rem',
                'full': '9999px',
                'custom': '24px',
            },
            fontFamily: {
                'display': ['Inter', 'Lexend', 'sans-serif'],
                'comic': ['Comic Neue', 'Nunito', 'Verdana', 'sans-serif'],
            },
            boxShadow: {
                'pop': '0 8px 0 rgba(0, 0, 0, 0.15)',
                'button-primary': '0 6px 0 #D64545',
                'button-secondary': '0 6px 0 #3DB1AB',
            },
        },
    },
    plugins: [],
};
export default config;
