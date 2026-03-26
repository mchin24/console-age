# Known Issues: Console Age Display

## Current Bugs 🐛

### 1. Critical: Incorrect Sort Order
**Location**: `public/script.js` line 13  
**Severity**: High  
**Status**: Unfixed  
**Discovered**: 2026-03-26

**Current Code**:
```javascript
data.consoles.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
```

**Issue**: Sorts consoles from newest to oldest (descending order)

**Expected Behavior**: Documentation in `progress.md` and `productContext.md` states consoles should be sorted chronologically from oldest to newest (ascending order)

**Fix**:
```javascript
data.consoles.sort((a, b) => new Date(a.release_date) - new Date(b.release_date));
```

**Impact**: 
- User sees reversed chronological order
- Contradicts documented user experience
- Makes it harder to see gaming history evolution
- Vintage consoles appear at bottom instead of top

**Resolution Plan**: Fix during CRUD implementation phase

---

### 2. Configuration: Port Mismatch
**Location**: `docker-compose.yml` line 9  
**Severity**: Medium  
**Status**: Unfixed  
**Discovered**: 2026-03-26

**Current Code**:
```yaml
ports:
  - "2480:80"
```

**Issue**: Docker exposes application on port 2480, but all documentation references port 8081

**Documentation References**:
- `techContext.md`: "Port: 8081 (mapped to container port 80)"
- `progress.md`: "Working (localhost:8081)"
- `activeContext.md`: "Docker deployment working on localhost:8081"

**Fix Options**:
1. **Option A** (Recommended): Change docker-compose.yml to `"8081:80"`
2. **Option B**: Update all documentation to reference port 2480

**Recommendation**: Use port 8081 to maintain consistency with established documentation

**Impact**: 
- Confusion about which URL to access
- Documentation doesn't match actual deployment
- Potential issues if other services expect port 8081

**Resolution Plan**: Update to port 8081 during CRUD implementation

---

### 3. Infrastructure: Unused Database Service
**Location**: `docker-compose.yml` lines 12-23  
**Severity**: Low (cleanup/optimization)  
**Status**: Intentional (future use)  
**Discovered**: 2026-03-26

**Current State**:
```yaml
db:
  image: postgres:latest
  ports:
    - "5432:5432"
  user: postgres
  environment:
    POSTGRES_PASSWORD: ChangeMe
    POSTGRES_DB: consoleages
  volumes:
    - db_data:/var/lib/postgresql
```

**Issue**: PostgreSQL database service defined but never connected or used by current application

**Current Impact**: 
- Wastes system resources (memory, disk, CPU)
- Increases Docker startup time
- Adds unnecessary complexity to static site
- Database starts and runs idle

**Future Impact**: 
- Will be **needed and utilized** for CRUD functionality implementation
- Connection details already configured correctly
- Database name `consoleages` is appropriate
- Volume persistence configured properly

**Resolution**: 
- **Keep service** for imminent CRUD implementation
- Document its future purpose in docker-compose.yml
- Will be connected when backend API is added

**Notes**: This is actually good preparation - the database infrastructure is ready for the planned CRUD functionality.

---

## Technical Debt 📊

### 1. No Build Process
**Status**: Acceptable for learning project  
**Impact**: Low

**Details**:
- Vanilla JavaScript approach appropriate for skill development
- No transpilation, bundling, or minification
- Directly serves source files

**Future Consideration**:
- TypeScript migration will introduce build tooling (tsc, webpack, etc.)
- May add bundler for production optimization
- Not a priority for current learning objectives

---

### 2. Limited Error Handling Granularity
**Status**: Sufficient for current scope  
**Impact**: Low

**Details**:
- Basic fetch error handling present
- Generic error messages displayed to users
- No retry logic for failed requests
- No specific error type handling

**Current Implementation**:
```javascript
catch (error) {
    console.error('Error loading JSON:', error);
    // Generic error display
}
```

**Production Considerations**:
- Could distinguish network errors from parse errors
- Add retry logic with exponential backoff
- Implement more specific error messages
- Add error reporting/logging service

---

### 3. No Data Validation
**Status**: Not applicable for read-only display  
**Impact**: None (currently)

**Current State**:
- Application trusts JSON data format
- No validation of console objects
- No handling of missing fields

**Future Requirements** (with CRUD):
- **Critical**: Client-side form validation
- **Critical**: Server-side data validation
- Input sanitization for XSS prevention
- Type checking and constraint validation
- Date format validation

**Example Future Validation**:
```javascript
// Required fields
if (!name || !manufacturer || !release_date) {
    throw new ValidationError('Missing required fields');
}

// Date validation
if (new Date(release_date) > new Date()) {
    throw new ValidationError('Release date cannot be in future');
}
```

---

## Browser Compatibility Notes 🌐

### Required Features:
- **ES6+ JavaScript**: Arrow functions, const/let, template literals
- **Fetch API**: No XMLHttpRequest, no polyfills included
- **CSS Grid**: Table layout uses modern grid properties
- **CSS Flexbox**: Header and container layouts
- **Modern DOM Methods**: querySelector, createElement, appendChild
- **Date Object**: toLocaleDateString with options

### Not Supported:
- ❌ Internet Explorer (any version)
- ❌ Very old mobile browsers (pre-2018)
- ❌ Browsers without ES6 support

### Tested/Working:
- ✅ Chrome 90+ (expected)
- ✅ Firefox 88+ (expected)
- ✅ Safari 14+ (expected)
- ✅ Edge 90+ (expected)

**Status**: Acceptable for modern learning environment

**Future Considerations**:
- Could add Babel for broader support
- Could include Fetch polyfill for older browsers
- Not necessary for current learning objectives

---

## Performance Considerations 📈

### Current Optimizations:
- ✅ External CSS/JS files allow browser caching
- ✅ System fonts (no web font loading delay)
- ✅ No images (CSS-only styling)
- ✅ Minimal JavaScript execution
- ✅ Small Docker image (nginx:alpine)

### Potential Improvements:
- Could minify CSS/JS for production
- Could implement lazy loading for large datasets
- Could add service worker for offline support
- Could use CDN for static assets

**Status**: Performance is excellent for current scale (63 consoles)

---

## Security Considerations 🔒

### Current State:
- ✅ Static file serving only (minimal attack surface)
- ✅ No user input (no XSS risk currently)
- ✅ No server-side execution
- ✅ No data persistence

### Future Requirements (with CRUD):
- ⚠️ **Critical**: Input sanitization and validation
- ⚠️ **Critical**: SQL injection prevention (use parameterized queries)
- ⚠️ **Critical**: CORS configuration for API
- ⚠️ **Important**: Rate limiting on API endpoints
- ⚠️ **Important**: Authentication/authorization (skipped for now)
- ⚠️ **Consider**: HTTPS in production
- ⚠️ **Consider**: Content Security Policy headers

---

## Future Enhancements 🚀

### Planned (CRUD Implementation):
- [ ] Create console entries
- [ ] Update console entries
- [ ] Delete console entries
- [ ] Persist data in PostgreSQL
- [ ] RESTful API with Node.js/Express
- [ ] Modal forms for data entry
- [ ] Client and server validation
- [ ] Error feedback system

### Potential Future Features:
- [ ] Image upload for console photos
- [ ] Search/filter functionality
- [ ] Sort by multiple criteria
- [ ] Console generation categorization
- [ ] Sales data integration
- [ ] Timeline visualization
- [ ] Comparison tools
- [ ] Export to CSV/JSON

### TypeScript Migration:
- [ ] Convert JavaScript to TypeScript
- [ ] Add type definitions
- [ ] Implement interfaces
- [ ] Set up build process
- [ ] Add compile-time type checking

---

## Testing Gaps 🧪

### Current Testing:
- Manual browser testing only
- No automated tests
- No CI/CD pipeline

### Future Testing Needs:
- Unit tests for utility functions
- Integration tests for API endpoints
- E2E tests for user workflows
- Database migration tests
- Error scenario testing

**Status**: Acceptable for learning project, should improve for production

---

## Documentation Status 📚

### Well Documented:
- ✅ Project brief and goals
- ✅ Architecture patterns
- ✅ Technology stack
- ✅ Development workflow

### Needs Documentation (after CRUD):
- [ ] API endpoint reference
- [ ] Database schema documentation
- [ ] Development setup guide (updated)
- [ ] Troubleshooting guide
- [ ] Contributing guidelines

---

**Last Updated**: 2026-03-26  
**Review Completed By**: Code review and analysis  
**Next Review**: After CRUD implementation
