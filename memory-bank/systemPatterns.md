# System Patterns: Console Age Display

## System Architecture
```
┌─────────────────┐
│   Docker nginx  │ ← Serves static files on port 8081
└─────────────────┘
         │
┌─────────────────┐
│  Static Files   │
│  - index.html   │ ← Main application entry point
│  - consoles.json│ ← Data source
└─────────────────┘
```

## Key Technical Decisions

### Frontend Architecture
- **Single Page Application**: No routing, single HTML file with embedded CSS/JS
- **Vanilla JavaScript**: No frameworks to keep focus on HTML5/CSS fundamentals
- **Embedded Styles**: CSS included in HTML head for simplicity and performance
- **Modern CSS**: Uses CSS Grid, Flexbox, custom properties, and modern selectors

### Data Flow Pattern
```
Page Load → Fetch JSON → Parse Data → Sort by Date → Calculate Ages → Render Table
```

### Component Organization
- **HTML Structure**: Semantic HTML5 with proper ARIA considerations
- **CSS Organization**: Logical grouping (reset → layout → components → responsive)
- **JavaScript Pattern**: Event-driven with proper error handling

## Design Patterns in Use

### CSS Patterns
- **CSS Reset**: Universal box-sizing and margin/padding reset
- **CSS Custom Properties**: For consistent spacing and colors
- **Mobile-First**: Base styles for mobile, enhanced for desktop
- **Component-Based Classes**: Reusable class names (.console-name, .age, etc.)

### JavaScript Patterns
- **Fetch API**: Modern promise-based HTTP requests
- **DOM Manipulation**: Clean createElement/appendChild pattern
- **Error Handling**: Try/catch with user-friendly error display
- **Functional Approach**: Pure functions for calculations where possible

### Docker Patterns
- **Multi-stage Build**: Simple nginx:alpine base for minimal footprint
- **Volume Mounting**: Development files mounted for easy updates
- **Port Mapping**: Standard HTTP port mapping (8081:80)

## Component Relationships

### HTML Structure
```
body
├── .container
    ├── header (title + subtitle)
    ├── #loading (loading indicator)
    └── #content (dynamic table container)
```

### CSS Architecture
- **Layout**: Container-based with max-width centering
- **Typography**: System font stack with proper hierarchy
- **Color System**: Semantic color usage (vintage/retro/modern)
- **Spacing**: Consistent rem-based spacing system

### Data Processing
1. **Fetch Layer**: Handles JSON loading with error states
2. **Sort Layer**: Chronological sorting by release date
3. **Calculate Layer**: Age computation with year/month precision  
4. **Render Layer**: DOM creation and styling application

## Critical Implementation Paths

### Error Handling Flow
- Network errors → Display connection error message
- JSON parse errors → Display data format error
- Missing data → Graceful degradation with placeholder content

### Performance Considerations
- **CSS**: Single embedded stylesheet reduces HTTP requests
- **JavaScript**: Minimal DOM queries, efficient sorting algorithms
- **Images**: No external images, CSS-only styling
- **Fonts**: System fonts for faster loading
