export type ThemeMode = 'light' | 'dark';

const THEME_STORAGE_KEY = 'velocity.theme.mode';
const THEME_ATTRIBUTE = 'data-theme';

type ThemeListener = (theme: ThemeMode) => void;

export class ThemeService {
    private static listeners = new Set<ThemeListener>();
    private static initialized = false;

    static init(): void {
        this.applyTheme(this.getStoredTheme());
        if (this.initialized) {
            return;
        }
        window.addEventListener('storage', this.handleStorage);
        this.initialized = true;
    }

    static subscribe(listener: ThemeListener): () => void {
        this.listeners.add(listener);
        listener(this.getTheme());
        return () => {
            this.listeners.delete(listener);
        };
    }

    static getTheme(): ThemeMode {
        return document.documentElement.getAttribute(THEME_ATTRIBUTE) === 'dark' ? 'dark' : 'light';
    }

    static isDarkMode(): boolean {
        return this.getTheme() === 'dark';
    }

    static setTheme(theme: ThemeMode): void {
        this.persistTheme(theme);
        this.applyTheme(theme);
        this.emit(theme);
    }

    static toggleTheme(): ThemeMode {
        const nextTheme: ThemeMode = this.isDarkMode() ? 'light' : 'dark';
        this.setTheme(nextTheme);
        return nextTheme;
    }

    private static getStoredTheme(): ThemeMode {
        try {
            return localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';
        } catch {
            return 'light';
        }
    }

    private static persistTheme(theme: ThemeMode): void {
        try {
            localStorage.setItem(THEME_STORAGE_KEY, theme);
        } catch {
            // Ignore storage errors (e.g. private mode restrictions)
        }
    }

    private static applyTheme(theme: ThemeMode): void {
        document.documentElement.setAttribute(THEME_ATTRIBUTE, theme);
        document.documentElement.style.colorScheme = theme;
    }

    private static emit(theme: ThemeMode): void {
        this.listeners.forEach((listener) => listener(theme));
    }

    private static handleStorage = (event: StorageEvent): void => {
        if (event.key !== THEME_STORAGE_KEY) {
            return;
        }
        const theme: ThemeMode = event.newValue === 'dark' ? 'dark' : 'light';
        this.applyTheme(theme);
        this.emit(theme);
    };
}
