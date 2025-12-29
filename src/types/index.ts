export interface User {
  name: string;
  email: string;
}

export interface UserData {
  name?: string;
  email: string;
}

export interface ThemeProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

