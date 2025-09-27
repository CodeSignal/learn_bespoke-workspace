# Bespoke Generalised Components

This directory contains reusable components for creating embedded applications that share a consistent design system and user experience.

## Components

### 1. `bespoke.css`
The core CSS framework providing:
- Consistent design tokens (colors, spacing, typography)
- Light and dark theme support
- Reusable component styles (buttons, forms, modals, cards)
- Responsive design utilities

### 2. `template.html`
A base HTML template that includes:
- Navigation header with app name and help button
- Main layout structure (sidebar + content area)
- Help modal integration
- Proper CSS and JavaScript loading

### 3. `io.js`
Generic data persistence functions:
- Load/save from local files
- localStorage operations with configurable keys
- Server save operations with configurable endpoints
- Data validation and error handling

### 4. `auto-save.js`
Automatic data persistence system:
- Immediate localStorage saves
- Periodic server synchronization
- Configurable intervals and retry logic
- Status reporting and error handling

### 5. `help-modal.js`
A dependency-free JavaScript module for the help modal system:
- Consistent modal behavior across all apps
- Keyboard navigation (ESC to close)
- Focus management
- Custom event system

### 6. `help-content-template.html`
A template for creating consistent help content:
- Table of contents navigation
- Standardized section structure
- FAQ with collapsible details
- Image integration guidelines

## Usage Instructions

### Setting Up a New Application

1. **Copy the template files** to your new application directory
2. **Customize the HTML template** by replacing placeholders:
   - `<!-- APP_TITLE -->` - Your application title
   - `<!-- APP_NAME -->` - Your application name (appears in header)
   - `<!-- APP_SPECIFIC_HEADER_CONTENT -->` - Any additional header elements
   - `<!-- APP_SPECIFIC_SIDEBAR -->` - Your sidebar content
   - `<!-- APP_SPECIFIC_MAIN_CONTENT -->` - Your main content area
   - `<!-- APP_SPECIFIC_CSS -->` - Links to your app-specific CSS files
   - `<!-- APP_SPECIFIC_SCRIPTS -->` - Links to your app-specific JavaScript files

3. **Create your help content** using the help content template
4. **Initialize the auto-save system** in your JavaScript:

```javascript
// Your application data
let appData = {
  // Your data structure here
};

// Initialize auto-save
const autoSave = AutoSave.init({
  data: appData,
  filename: 'solution.json',
  localStorageKey: 'myapp:data',
  saveInterval: 1000,
  onStatusChange: setStatus,
  onDataChange: (data) => {
    // Optional: Custom logic when data changes
  },
  onError: (message, error) => {
    console.error('Auto-save error:', message, error);
  }
});

// Load existing data
const savedData = autoSave.loadFromLocalStorage();
if (savedData) {
  appData = savedData;
}
```

5. **Initialize the help modal** in your JavaScript:

```javascript
// Load your help content (from file, API, or inline)
const helpContent = `<!-- Your help content here -->`;

// Initialize the help modal
HelpModal.init({
  triggerSelector: '#btn-help',
  content: helpContent,
  theme: 'auto' // or 'light' or 'dark'
});
```

### Example Implementation

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>My App</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="stylesheet" href="./bespoke.css" />
  <link rel="stylesheet" href="./my-app.css" />
</head>
<body class="bespoke">
  <header class="header">
    <h1>My App</h1>
    <button id="btn-save">Save</button>
    <div class="spacer"></div>
    <div id="status" class="status">Ready</div>
    <button id="btn-help" class="as-button ghost">Help</button>
  </header>

  <main class="main-layout">
    <aside class="sidebar">
      <!-- Your app controls go here -->
    </aside>
    <div class="content-area">
      <!-- Your main app content goes here -->
    </div>
  </main>

  <script src="./help-modal.js"></script>
  <script src="./my-app.js"></script>
  <script>
    HelpModal.init({
      triggerSelector: '#btn-help',
      content: myHelpContent,
      theme: 'auto'
    });
  </script>
</body>
</html>
```

### Customizing Help Content

Use the `help-content-template.html` as a starting point:

1. **Replace placeholders** like `<!-- APP_NAME -->` with your actual content
2. **Add sections** as needed for your application
3. **Include images** by placing them in a `help/img/` directory
4. **Use the provided structure** for consistency across applications

### CSS Customization

The `bespoke.css` file uses CSS custom properties for easy theming:

```css
.bespoke {
  --bespoke-accent: #1062fb;        /* Primary accent color */
  --bespoke-bg: #ffffff;            /* Background color */
  --bespoke-fg: rgb(24, 33, 57);   /* Text color */
  /* ... many more variables */
}
```

You can override these variables in your app-specific CSS:

```css
.my-app {
  --bespoke-accent: #ff6b6b;  /* Custom accent color */
  --bespoke-bg: #f8f9fa;     /* Custom background */
}
```

### Auto-Save API

The `AutoSave` class provides several methods:

```javascript
// Initialize
const autoSave = AutoSave.init({
  data: appData,
  filename: 'solution.json',
  localStorageKey: 'myapp:data',
  saveInterval: 1000,
  onStatusChange: setStatus,
  onDataChange: (data) => { /* custom logic */ },
  onError: (message, error) => { /* error handling */ }
});

// Mark data as changed
autoSave.markDirty();

// Manual save
autoSave.saveNow();

// Load from localStorage
const data = autoSave.loadFromLocalStorage();

// Destroy the auto-save system
autoSave.destroy();
```

### IO API

The `IO` object provides generic data persistence functions:

```javascript
// Load from file
const data = await IO.loadFromFile('data.json');

// Save to localStorage
IO.saveToLocalStorage(data, 'myapp:data');

// Load from localStorage
const data = IO.loadFromLocalStorage('myapp:data');

// Save to server
await IO.saveToServer(data, 'solution.json', '/api/save');

// Validate data
IO.validateData(data);
```

### Help Modal API

The `HelpModal` class provides several methods:

```javascript
// Initialize
const modal = HelpModal.init({
  triggerSelector: '#btn-help',
  content: helpContent,
  theme: 'auto'
});

// Update content dynamically
modal.updateContent(newHelpContent);

// Destroy the modal
modal.destroy();
```

### Events

The help modal dispatches custom events:

```javascript
document.getElementById('btn-help').addEventListener('helpModal:open', (e) => {
  console.log('Help modal opened');
});

document.getElementById('btn-help').addEventListener('helpModal:close', (e) => {
  console.log('Help modal closed');
});
```

## Design Principles

1. **Consistency**: All applications share the same visual language
2. **Accessibility**: Proper focus management, keyboard navigation, and ARIA labels
3. **Responsiveness**: Works on desktop and mobile devices
4. **Theme Support**: Automatic light/dark mode detection
5. **Modularity**: Components can be used independently
6. **Zero Dependencies**: No external JavaScript libraries required

## File Structure

```
generalised/
├── bespoke.css              # Core CSS framework
├── template.html            # Base HTML template
├── help-modal.js           # Help modal JavaScript
├── help-content-template.html # Help content template
└── README.md               # This file
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ features (classes, arrow functions, template literals)
- CSS Grid and Flexbox
- CSS Custom Properties

## Contributing

When adding new components or modifying existing ones:

1. Maintain backward compatibility
2. Follow the established naming conventions
3. Test across different themes and screen sizes
4. Update this README with any new features
5. Ensure accessibility standards are met
