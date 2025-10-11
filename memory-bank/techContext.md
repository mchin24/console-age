# Technical Context: Console Age Display

## Technologies Used

### Core Stack
- **HTML5**: Semantic markup, proper doctype, meta tags for responsive design
- **CSS3**: Modern features including gradients, flexbox, grid, transitions
- **Vanilla JavaScript**: ES6+ features, Fetch API, modern DOM methods
- **JSON**: Structured data storage for console information

### Development Environment
- **IDE**: IntelliJ IDEA Ultimate
- **OS**: Windows 11
- **Shell**: Windows Command Prompt (cmd.exe)
- **Git**: Version control with .gitignore for JetBrains files

### Deployment Stack
- **Container**: Docker with nginx:alpine base image
- **Web Server**: nginx for serving static files
- **Port**: 8081 (mapped to container port 80)
- **Orchestration**: Docker Compose for service management

## Technical Constraints

### Browser Support
- Modern browsers supporting ES6+ features
- Fetch API support required
- CSS Grid and Flexbox support needed
- No Internet Explorer compatibility required

### Performance Requirements
- Fast loading with embedded CSS/JS (no external requests except JSON)
- Responsive design for mobile and desktop
- Minimal container size using alpine base image

### Security Considerations
- Static file serving only (no server-side processing)
- CORS handled by proper server setup
- No user input or data persistence

## Dependencies

### Runtime Dependencies
- None (vanilla JavaScript, no external libraries)
- nginx:alpine Docker image
- Modern web browser

### Development Dependencies
- Docker Engine
- Docker Compose
- Git (for version control)

## Tool Usage Patterns

### Development Workflow
1. Edit files in IntelliJ IDEA
2. Use Docker Compose for local testing
3. View changes at http://localhost:8081
4. Commit changes to Git

### Docker Commands
```bash
# Start development server
docker-compose up -d --build

# Stop server
docker-compose down

# View logs
docker-compose logs
```

### File Structure
```
F:/projects/console-age/
├── public/
│   ├── index.html      (main application)
│   └── consoles.json   (data file)
├── memory-bank/        (documentation)
├── dockerfile          (nginx container config)
├── docker-compose.yml  (service orchestration)
├── .gitignore         (VCS exclusions)
└── README.md          (project overview)
```

## Configuration Details

### Docker Configuration
- **Base Image**: nginx:alpine (lightweight, secure)
- **Port Mapping**: 8081:80 (host:container)
- **Volume Mount**: ./public:/usr/share/nginx/html
- **Network**: Default Docker Compose network

### nginx Setup
- Default nginx.conf (no custom configuration needed)
- Serves static files from /usr/share/nginx/html
- Handles MIME types automatically
- Gzip compression enabled by default

### Development Setup
- No build process required (static files)
- Hot reload via volume mounting in development
- Production builds via Docker image creation
