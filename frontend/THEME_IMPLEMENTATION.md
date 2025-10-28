# Theme Implementation Guide

## Overview
CipherStudio now features a complete light/dark mode toggle system with automatic theme detection and persistence.

## Features

### ✅ Theme Switching
- Toggle between light and dark modes using the switch in the header
- Smooth transitions (0.3s ease) for all color changes

### ✅ Theme Persistence
- User's theme preference is saved to `localStorage`
- Theme persists across browser sessions
- Key: `cipherStudioTheme` (values: 'dark' or 'light')

### ✅ System Theme Detection
- Automatically detects user's OS/browser theme preference
- Uses `window.matchMedia('(prefers-color-scheme: dark)')`
- Only used when no saved preference exists

### ✅ Priority Order
1. **localStorage** - User's previously saved choice (highest priority)
2. **System preference** - OS/browser setting (default)

## How It Works

### Initial Load
```javascript
// On mount, check localStorage first
const savedTheme = localStorage.getItem('cipherStudioTheme');

if (savedTheme) {
  // Use saved preference
  setDarkMode(savedTheme === 'dark');
} else {
  // Detect and use system preference
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  setDarkMode(systemPrefersDark);
}
```

### Theme Toggle
```javascript
const toggleTheme = () => {
  setDarkMode(!darkMode);
};
```

### Auto-Save
```javascript
// Automatically save when theme changes
useEffect(() => {
  localStorage.setItem('cipherStudioTheme', darkMode ? 'dark' : 'light');
}, [darkMode]);
```

## Color Scheme

### Dark Mode
- Background: `#2d2d2d`
- Accent: Blue (`#3b82f6`)
- Text: White/light gray

### Light Mode
- Background: `#ffffff` / `#f5f5f5`
- Accent: Blue (`#3b82f6`)
- Text: Dark gray/black

## Customization

### Add New Theme-Aware Styles
```css
/* Dark mode (default) */
.my-element {
  background-color: #2d2d2d;
  color: #ffffff;
}

/* Light mode (override) */
.app-container.light .my-element {
  background-color: #ffffff;
  color: #1a1a1a;
}
```

### Modify Transition Duration
```css
/* Global transition */
* {
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* Change from 0.3s to 0.5s for slower transitions */
```

## Browser Compatibility
- Works in all modern browsers
- System theme detection: Chrome 76+, Firefox 67+, Safari 12.1+
- localStorage: All modern browsers

## Testing

### Test Theme Persistence
1. Toggle theme
2. Refresh page
3. Theme should remain the same

### Test System Theme
1. Clear localStorage in browser DevTools
2. Change OS theme (dark/light)
3. Refresh page
4. Should match OS theme

### Clear Saved Theme
```javascript
// In browser console
localStorage.removeItem('cipherStudioTheme');
location.reload();
```

## Files Modified
- `frontend/src/App.jsx` - Theme logic and state management
- `frontend/src/App.css` - Light mode styles and transitions

## Future Enhancements
- Add more color theme options (e.g., high contrast, blue theme)
- Allow per-component theme overrides
- Add theme transition animations (fade, slide, etc.)









