// theme.js
export function setTheme(theme) {
    if(theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
}

export function initTheme() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if(darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            const newTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
            setTheme(newTheme);
        });

        const savedTheme = localStorage.getItem('theme');
        if(savedTheme) setTheme(savedTheme);
        else if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
            setTheme('dark');
    }
}
