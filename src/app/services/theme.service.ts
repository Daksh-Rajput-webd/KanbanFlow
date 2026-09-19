import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ThemeDefinition } from '../models/kanban.models';

const STORAGE_KEY = 'kanbanflow_theme';
const MOTION_STORAGE_KEY = 'kanbanflow_motion';

const THEMES: ThemeDefinition[] = [
  {
    id: 'light',
    name: 'Daylight',
    isDark: false,
    swatch: ['#f4f6fb', '#5b6bf5', '#ffffff'],
    vars: {
      'bg': '#eef1f8',
      'bg-elevated': '#ffffff',
      'surface': '#ffffff',
      'surface-hover': '#f1f3fb',
      'text': '#1c2333',
      'text-muted': '#6b7386',
      'border': '#e1e5f0',
      'accent': '#5b6bf5',
      'accent-hover': '#4453e0',
      'accent-contrast': '#ffffff',
      'accent-soft': '#e8eaff',
      'success': '#2fb673',
      'warning': '#f2a93b',
      'danger': '#f0546a',
      'shadow': '0 8px 24px rgba(28, 35, 51, 0.08)',
      'column-bg': '#e6e9f4',
      'card-bg': '#ffffff',
      'scrollbar-thumb': '#c7cce0'
    }
  },
  {
    id: 'dark',
    name: 'Midnight',
    isDark: true,
    swatch: ['#161a25', '#7c8cff', '#232838'],
    vars: {
      'bg': '#12151f',
      'bg-elevated': '#1b2030',
      'surface': '#1e2334',
      'surface-hover': '#262c40',
      'text': '#eef0f8',
      'text-muted': '#9aa1b8',
      'border': '#2c3247',
      'accent': '#7c8cff',
      'accent-hover': '#94a2ff',
      'accent-contrast': '#0d1017',
      'accent-soft': '#2a2f52',
      'success': '#3fd992',
      'warning': '#f2b64e',
      'danger': '#ff6b81',
      'shadow': '0 10px 28px rgba(0, 0, 0, 0.45)',
      'column-bg': '#181d2c',
      'card-bg': '#232838',
      'scrollbar-thumb': '#333a52'
    }
  },
  {
    id: 'ocean',
    name: 'Ocean Breeze',
    isDark: true,
    swatch: ['#0b2b3c', '#22c1d6', '#123f52'],
    vars: {
      'bg': '#082430',
      'bg-elevated': '#0d3040',
      'surface': '#0f3848',
      'surface-hover': '#134454',
      'text': '#e5f6fa',
      'text-muted': '#8db6c4',
      'border': '#1c4c5e',
      'accent': '#22c1d6',
      'accent-hover': '#3fd4e8',
      'accent-contrast': '#00232b',
      'accent-soft': '#134c5b',
      'success': '#3fd992',
      'warning': '#f2c14e',
      'danger': '#ff7086',
      'shadow': '0 10px 28px rgba(0, 0, 0, 0.4)',
      'column-bg': '#0b2e3c',
      'card-bg': '#123f52',
      'scrollbar-thumb': '#1e5568'
    }
  },
  {
    id: 'sunset',
    name: 'Sunset Glow',
    isDark: false,
    swatch: ['#fff3ea', '#ff7a59', '#ffffff'],
    vars: {
      'bg': '#fff3ea',
      'bg-elevated': '#ffffff',
      'surface': '#ffffff',
      'surface-hover': '#ffe9db',
      'text': '#3a2418',
      'text-muted': '#8a6a56',
      'border': '#f4d9c6',
      'accent': '#ff7a59',
      'accent-hover': '#ff6238',
      'accent-contrast': '#ffffff',
      'accent-soft': '#ffe3d8',
      'success': '#2fa876',
      'warning': '#f0a020',
      'danger': '#e2495c',
      'shadow': '0 8px 24px rgba(154, 92, 45, 0.12)',
      'column-bg': '#ffe9db',
      'card-bg': '#ffffff',
      'scrollbar-thumb': '#f0c9ac'
    }
  },
  {
    id: 'forest',
    name: 'Forest Calm',
    isDark: false,
    swatch: ['#eef5ec', '#3f9142', '#ffffff'],
    vars: {
      'bg': '#eef5ec',
      'bg-elevated': '#ffffff',
      'surface': '#ffffff',
      'surface-hover': '#e5f1e2',
      'text': '#1f2e1e',
      'text-muted': '#6b7d67',
      'border': '#d7e6d2',
      'accent': '#3f9142',
      'accent-hover': '#347b38',
      'accent-contrast': '#ffffff',
      'accent-soft': '#e0f0df',
      'success': '#3f9142',
      'warning': '#e2a63b',
      'danger': '#d75a5a',
      'shadow': '0 8px 24px rgba(31, 46, 30, 0.1)',
      'column-bg': '#e5f1e2',
      'card-bg': '#ffffff',
      'scrollbar-thumb': '#c3dabd'
    }
  },
  {
    id: 'grape',
    name: 'Grape Soda',
    isDark: true,
    swatch: ['#1c1330', '#b478ff', '#2a1d47'],
    vars: {
      'bg': '#160f26',
      'bg-elevated': '#20182f',
      'surface': '#241a3a',
      'surface-hover': '#2d2148',
      'text': '#f1ebfe',
      'text-muted': '#a999c4',
      'border': '#382a54',
      'accent': '#b478ff',
      'accent-hover': '#c391ff',
      'accent-contrast': '#1a1229',
      'accent-soft': '#372a54',
      'success': '#45d69a',
      'warning': '#f2b64e',
      'danger': '#ff6f91',
      'shadow': '0 10px 28px rgba(0, 0, 0, 0.45)',
      'column-bg': '#1e1633',
      'card-bg': '#2a1d47',
      'scrollbar-thumb': '#3d2e5c'
    }
  }
];

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly themes: ThemeDefinition[] = THEMES;
  private readonly activeThemeSubject = new BehaviorSubject<ThemeDefinition>(this.restoreTheme());
  readonly activeTheme$ = this.activeThemeSubject.asObservable();
  private readonly motionSubject = new BehaviorSubject<boolean>(this.restoreMotion());
  readonly motionEnabled$ = this.motionSubject.asObservable();

  constructor() {
    this.applyTheme(this.activeThemeSubject.value);
    this.applyMotion(this.motionSubject.value);
  }

  get activeTheme(): ThemeDefinition {
    return this.activeThemeSubject.value;
  }

  get motionEnabled(): boolean {
    return this.motionSubject.value;
  }

  setTheme(themeId: string): void {
    const theme = THEMES.find(t => t.id === themeId) ?? THEMES[0];
    this.activeThemeSubject.next(theme);
    localStorage.setItem(STORAGE_KEY, theme.id);
    this.applyTheme(theme);
  }

  setMotionEnabled(enabled: boolean): void {
    this.motionSubject.next(enabled);
    localStorage.setItem(MOTION_STORAGE_KEY, String(enabled));
    this.applyMotion(enabled);
  }

  private restoreMotion(): boolean {
    const saved = localStorage.getItem(MOTION_STORAGE_KEY);
    return saved === null ? true : saved === 'true';
  }

  private applyMotion(enabled: boolean): void {
    document.documentElement.classList.toggle('reduce-motion', !enabled);
  }

  private restoreTheme(): ThemeDefinition {
    const savedId = localStorage.getItem(STORAGE_KEY);
    return THEMES.find(t => t.id === savedId) ?? THEMES[0];
  }

  private applyTheme(theme: ThemeDefinition): void {
    const root = document.documentElement;
    Object.entries(theme.vars).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
    root.setAttribute('data-theme', theme.id);
    root.classList.toggle('theme-dark', theme.isDark);
  }
}
