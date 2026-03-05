/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                app: {
                    base: 'var(--bg-base)',
                    panel: 'var(--bg-panel)',
                    'panel-hover': 'var(--bg-panel-hover)',
                    text: 'var(--text-base)',
                    muted: 'var(--text-muted)',
                    border: 'var(--border-base)',
                    primary: 'var(--primary)',
                    'primary-hover': 'var(--primary-hover)',
                    'primary-glow': 'var(--primary-glow)',
                    'gradient-start': 'var(--primary-gradient-start)',
                    'gradient-end': 'var(--primary-gradient-end)',
                }
            }
        },
    },
    plugins: [],
}
