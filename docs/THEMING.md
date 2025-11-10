# Theming Guide

Vue Timelines uses CSS custom properties (CSS variables) for theming, allowing you to customize the appearance of the library without modifying component code.

## Quick Start

### Using the Default (Light) Theme

The default theme is automatically loaded when you import the library:

```javascript
import 'vue-timelines';
// or
import 'vue-timelines/dist/vue-timelines.css';
```

### Using the Dark Theme

1. Import the dark theme CSS:

```javascript
import 'vue-timelines/dist/themes/dark.css';
```

2. Apply the dark theme class to a parent element:

```html
<div class="vt-theme-dark">
  <vue-timeline></vue-timeline>
</div>
```

Or programmatically:

```javascript
import { applyTheme } from 'vue-timelines';

// Apply to document body
applyTheme(document.body, 'dark');

// Apply to a specific element
const container = document.getElementById('timeline-container');
applyTheme(container, 'dark');
```

## Theme Utilities

The library provides utilities for managing themes:

```javascript
import {
  applyTheme,
  getTheme,
  toggleTheme,
  watchSystemTheme
} from 'vue-timelines';

// Apply a theme
applyTheme(document.body, 'dark');  // or 'light'

// Get current theme
const currentTheme = getTheme(document.body); // returns 'light' or 'dark'

// Toggle between themes
const newTheme = toggleTheme(document.body);

// Watch system preference and auto-apply
const cleanup = watchSystemTheme(document.body, (theme) => {
  console.log('Theme changed to:', theme);
});

// Later, stop watching
cleanup();
```

## CSS Custom Properties

All themeable properties are defined as CSS custom properties. Here's a complete list:

### Colors

#### Primary Colors
- `--vt-primary`: Primary color (#3c8dbc)
- `--vt-primary-hover`: Primary hover color
- `--vt-primary-light`: Light primary color

#### Secondary Colors
- `--vt-secondary`: Secondary color (#e91e63)
- `--vt-secondary-hover`: Secondary hover color

#### Status Colors
- `--vt-success`: Success color (#00a85d)
- `--vt-warning`: Warning color (#ffb311)
- `--vt-error`: Error color (#ff3636)
- `--vt-info`: Info color (#3c8dbc)
- `--vt-neutral`: Neutral color (#343a40)

#### Background Colors
- `--vt-bg-primary`: Primary background (#ffffff)
- `--vt-bg-secondary`: Secondary background (#f8f9fc)
- `--vt-bg-tertiary`: Tertiary background (#f7f8fb)
- `--vt-bg-panel`: Panel background (#fafafa)
- `--vt-bg-overlay`: Overlay background
- `--vt-bg-modal`: Modal background (#ffffff)

#### Text Colors
- `--vt-text-primary`: Primary text color (#000000)
- `--vt-text-secondary`: Secondary text color (#606060)
- `--vt-text-tertiary`: Tertiary text color (#707070)
- `--vt-text-inverse`: Inverse text color (#ffffff)
- `--vt-text-muted`: Muted text color

#### Border Colors
- `--vt-border-primary`: Primary border color
- `--vt-border-secondary`: Secondary border color
- `--vt-border-dark`: Dark border color
- `--vt-border-light`: Light border color

#### Task/Item Colors
- `--vt-task-bg`: Task background color
- `--vt-task-border`: Task border color
- `--vt-task-border-hover`: Task border hover color
- `--vt-task-shadow`: Task shadow
- `--vt-task-shadow-hover`: Task shadow on hover

#### Timeline Colors
- `--vt-timeline-bg`: Timeline background (#f8f9fc)
- `--vt-timeline-header-bg`: Timeline header background (#f8f9fc)
- `--vt-timeline-row-bg`: Timeline row background
- `--vt-timeline-row-hover`: Timeline row hover color

#### Calendar Colors
- `--vt-calendar-text`: Calendar text color (#707070)
- `--vt-calendar-border`: Calendar border color

#### List Colors
- `--vt-list-text`: List text color (#606060)
- `--vt-list-header-text`: List header text color (#707070)
- `--vt-list-header-bg`: List header background (#f8f9fc)
- `--vt-list-border`: List border color

#### Form Colors
- `--vt-form-border`: Form border color (#000000)
- `--vt-form-bg`: Form background (#fafafa)
- `--vt-form-text`: Form text color (#e91e63)
- `--vt-form-border-focus`: Form border focus color (#e91e63)

### Spacing
- `--vt-spacing-xs`: Extra small spacing (0.25rem)
- `--vt-spacing-sm`: Small spacing (0.5rem)
- `--vt-spacing-md`: Medium spacing (0.8rem)
- `--vt-spacing-lg`: Large spacing (1rem)
- `--vt-spacing-xl`: Extra large spacing (1.5rem)

### Border Radius
- `--vt-radius-sm`: Small radius (0.2rem)
- `--vt-radius-md`: Medium radius (0.5rem)
- `--vt-radius-lg`: Large radius (1rem)

### Shadows
- `--vt-shadow-sm`: Small shadow
- `--vt-shadow-md`: Medium shadow
- `--vt-shadow-lg`: Large shadow

### Transitions
- `--vt-transition-fast`: Fast transition (0.15s)
- `--vt-transition-base`: Base transition (0.3s)
- `--vt-transition-slow`: Slow transition (0.5s)

## Creating Custom Themes

### Method 1: Override CSS Variables

Create your own CSS file that overrides the variables:

```css
/* my-custom-theme.css */
:root {
  --vt-primary: #9b59b6;
  --vt-bg-secondary: #ecf0f1;
  --vt-text-primary: #2c3e50;
  /* ... override other variables ... */
}
```

Then import it:

```javascript
import 'vue-timelines';
import './my-custom-theme.css';
```

### Method 2: Create a Theme Class

Create a theme class similar to the dark theme:

```css
/* my-custom-theme.css */
.vt-theme-custom {
  --vt-primary: #9b59b6;
  --vt-bg-secondary: #ecf0f1;
  --vt-text-primary: #2c3e50;
  /* ... */
}
```

Apply it:

```html
<div class="vt-theme-custom">
  <vue-timeline></vue-timeline>
</div>
```

### Method 3: Inline Styles

Override variables on a specific element:

```html
<div style="--vt-primary: #9b59b6; --vt-bg-secondary: #ecf0f1;">
  <vue-timeline></vue-timeline>
</div>
```

## Component-Specific Theming

You can override variables for specific components by scoping them:

```css
.my-timeline-container {
  --vt-primary: #e74c3c;
  --vt-bg-secondary: #fff;
}
```

```html
<div class="my-timeline-container">
  <vue-timeline></vue-timeline>
</div>
```

## Web Component Theming

For web components, apply the theme class to a parent element:

```html
<div class="vt-theme-dark">
  <vue-timeline
    groups='[...]'
    tasks='[...]'
  ></vue-timeline>
</div>
```

Or use inline styles:

```html
<vue-timeline
  style="--vt-primary: #9b59b6;"
  groups='[...]'
  tasks='[...]'
></vue-timeline>
```

## System Preference Detection

Automatically apply theme based on user's system preference:

```javascript
import { watchSystemTheme } from 'vue-timelines';

// Automatically switch between light/dark based on system preference
watchSystemTheme(document.body, (theme) => {
  console.log('Theme changed to:', theme);
});
```

## Examples

### Example 1: Purple Theme

```css
:root {
  --vt-primary: #9b59b6;
  --vt-secondary: #8e44ad;
  --vt-bg-secondary: #f4f4f4;
  --vt-text-primary: #2c3e50;
}
```

### Example 2: High Contrast Theme

```css
:root {
  --vt-bg-primary: #ffffff;
  --vt-bg-secondary: #000000;
  --vt-text-primary: #000000;
  --vt-text-inverse: #ffffff;
  --vt-border-primary: #000000;
}
```

### Example 3: Minimal Theme

```css
:root {
  --vt-primary: #333333;
  --vt-bg-secondary: #ffffff;
  --vt-border-primary: #e0e0e0;
  --vt-shadow-sm: none;
  --vt-shadow-md: none;
  --vt-shadow-lg: none;
}
```

## Best Practices

1. **Always provide fallback values**: When using CSS variables, provide fallback values:
   ```css
   color: var(--vt-text-primary, #000000);
   ```

2. **Test in both themes**: Make sure your custom theme works well in both light and dark modes if you support both.

3. **Use semantic names**: When creating custom themes, use semantic color names that make sense in context.

4. **Consider accessibility**: Ensure sufficient contrast ratios between text and background colors.

5. **Document your theme**: If creating a reusable theme, document which variables you've customized and why.

## Migration from Hardcoded Colors

If you're migrating from a version that used hardcoded colors, the library now uses CSS variables with fallback values. Your existing styles should continue to work, but you can gradually migrate to use the variables for better theming support.

