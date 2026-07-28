# Implementation Plan: Add Button to Run Python Script

## Context

The Console Age web application is currently a pure static site that displays video game console data. It's served by nginx in Docker on port 2480, with a clean HTML/CSS/JavaScript frontend that dynamically renders a table of 56+ consoles with calculated ages.

**Why this change is needed:**  
The user wants to add interactivity by running a local Python script when a button is clicked on the web page. The script requires input parameters from form fields and should display success/failure status messages. This requires adding backend infrastructure since nginx can only serve static files and cannot execute Python scripts.

**Current state:**  
- Pure static site: [index.html](public/index.html), [styles.css](public/styles.css), [script.js](public/script.js)
- No backend server exists
- PostgreSQL container defined but unused
- Docker deployment with [docker-compose.yml](docker-compose.yml)

**Intended outcome:**  
Enable users to input parameters into form fields, click a button, have the Python script execute on the backend with those parameters, and receive visual feedback about success or failure.

---

## Architecture Overview

**New Architecture:**
```
Frontend (nginx:2480) → Flask Backend (:5000) → Python Script
                          ↑
                     (Docker network)
```

**Components:**
1. **Flask Backend Service** - REST API server in new Docker container
2. **Frontend Form** - Input fields + button in HTML
3. **JavaScript Handler** - Fetch API call to backend with form data
4. **Status Display** - Toast-style notification for results
5. **Docker Integration** - New backend service in docker-compose.yml

---

## Critical Files to Create/Modify

### New Files to Create

**1. `/backend/app.py`** - Flask API server
- Single endpoint: `POST /api/run-script`
- Accepts JSON parameters from form
- Executes Python script via subprocess
- Returns success/failure with timeout protection
- CORS enabled for frontend origin

**2. `/backend/requirements.txt`** - Python dependencies
```
flask==3.0.0
flask-cors==4.0.0
```

**3. `/backend/dockerfile`** - Python container configuration
- Base: `python:3.11-slim`
- Install dependencies
- Copy app and scripts
- Expose port 5000
- Run Flask server

**4. `/backend/scripts/your_script.py`** - User's Python script (placeholder)
- Reads parameters from stdin as JSON
- Performs the desired logic
- Returns results via stdout as JSON
- Exit code 0 for success, non-zero for errors

**5. `/backend/.dockerignore`** - Exclude unnecessary files from image

### Files to Modify

**1. `/docker-compose.yml`** - Add backend service
- New `backend` service definition
- Port mapping: 5000:5000
- Volume mount for development: `./backend:/app`
- Network connection to webapp
- Depends on webapp

**2. `/public/index.html`** - Add form and button UI
- Form section with input fields after header
- Submit button styled to match existing design
- Status message container (initially hidden)
- Positioned above the console table

**3. `/public/script.js`** - Add button click handler
- Event listener for form submit
- Fetch POST to `http://localhost:5000/api/run-script`
- Send form data as JSON
- Handle response and show status messages
- Disable button during execution (prevent double-clicks)
- Auto-hide success messages after 5 seconds

**4. `/public/styles.css`** - Add styles for form and status
- Form container styling
- Input field styles matching existing design
- Button styles (gradient, hover effects)
- Status message styles (success = green, error = red)
- Slide-in animation for status messages

---

## Implementation Details

### Backend API Design

**Endpoint:** `POST /api/run-script`

**Request Format:**
```json
{
  "parameters": {
    "param1": "value1",
    "param2": "value2"
  }
}
```

**Response Format - Success:**
```json
{
  "success": true,
  "message": "Script executed successfully"
}
```

**Response Format - Error:**
```json
{
  "success": false,
  "message": "Error description"
}
```

**HTTP Status Codes:**
- 200: Success
- 400: Invalid request (validation errors)
- 500: Server error (script execution failed)
- 504: Timeout (script exceeded 30 seconds)

### Script Execution Flow

1. Frontend form submits with parameters
2. JavaScript sends POST request to Flask backend
3. Flask validates request parameters
4. Flask executes Python script via `subprocess.run()`:
   - Passes parameters via stdin (JSON)
   - Captures stdout/stderr
   - Enforces 30-second timeout
   - Checks exit code
5. Flask returns success/failure response
6. Frontend displays status message
7. Status message auto-hides after 5 seconds (success only)

### Security Safeguards

**1. Script Whitelisting**
- Only allow execution of scripts in `/backend/scripts/` directory
- Validate script name against whitelist
- No directory traversal (reject `..`, `/`, `\`)

**2. Input Validation**
- Validate parameter types and structure
- Sanitize all inputs before passing to script
- Reject oversized payloads (max 1MB)

**3. Resource Limits**
- Script execution timeout: 30 seconds
- Docker memory limit: 512MB (configurable)
- Docker CPU limit: 1 core (configurable)

**4. Error Handling**
- Never expose internal errors or stack traces to frontend
- Log detailed errors server-side
- Return generic error messages to client

**5. CORS Configuration**
- Restrict to frontend origin only: `http://localhost:2480`
- No wildcard origins in production

**6. Network Isolation**
- Backend on internal Docker network only
- Not exposed to host except via port mapping
- PostgreSQL accessible only within Docker network

### Frontend Form Design

**Form Fields (customize based on your script needs):**
```html
<form id="scriptForm">
  <div class="form-group">
    <label for="param1">Parameter 1:</label>
    <input type="text" id="param1" name="param1" required>
  </div>
  
  <div class="form-group">
    <label for="param2">Parameter 2:</label>
    <input type="text" id="param2" name="param2" required>
  </div>
  
  <button type="submit" id="runScriptBtn">Run Script</button>
</form>

<div id="statusMessage" class="status-message" style="display: none;"></div>
```

**User Experience:**
1. User fills in form fields
2. Clicks "Run Script" button
3. Button shows loading state ("Running...")
4. Button disabled during execution
5. Status message appears with result
6. Button re-enables for next execution
7. Success messages auto-hide after 5 seconds
8. Error messages persist until dismissed

### Docker Integration

**docker-compose.yml changes:**
```yaml
services:
  webapp:
    # ... existing config ...
  
  backend:
    build:
      context: ./backend
      dockerfile: dockerfile
    image: console-age-backend:latest
    restart: always
    ports:
      - "5000:5000"
    volumes:
      - ./backend:/app  # Hot reload during development
      - ./public/consoles.json:/app/data/consoles.json:ro  # Read-only access
    environment:
      - FLASK_ENV=development  # Change to 'production' when deployed
      - FLASK_APP=app.py
    networks:
      - console-age-network
    depends_on:
      - webapp
  
  db:
    # ... existing config ...
    networks:
      - console-age-network

networks:
  console-age-network:
    driver: bridge
```

**Benefits:**
- Hot reload during development (volume mount)
- Isolated network for services
- Automatic restart on failure
- Consistent environment across deploys

---

## Verification & Testing

### Step 1: Build and Start Services
```bash
cd /home/mchin/projects/console-age
docker-compose down
docker-compose build
docker-compose up -d
```

### Step 2: Verify Backend Health
```bash
# Check if backend container is running
docker ps | grep backend

# Check backend logs
docker-compose logs backend

# Test backend directly
curl -X POST http://localhost:5000/api/run-script \
  -H "Content-Type: application/json" \
  -d '{"parameters": {"param1": "test", "param2": "value"}}'
```

**Expected response:**
```json
{"success": true, "message": "Script executed successfully"}
```

### Step 3: Test Frontend Integration
1. Open browser to `http://localhost:2480`
2. Verify form appears above console table
3. Fill in form fields with test data
4. Click "Run Script" button
5. Verify button shows loading state
6. Verify status message appears with result
7. Verify success message auto-hides after 5 seconds

### Step 4: Test Error Handling
1. Test with invalid input (empty fields, special characters)
2. Test with script timeout (modify script to sleep 40 seconds)
3. Test with script error (modify script to exit with code 1)
4. Verify error messages display correctly
5. Verify errors don't crash the backend

### Step 5: Test Security
```bash
# Test directory traversal attempt (should fail)
curl -X POST http://localhost:5000/api/run-script \
  -H "Content-Type: application/json" \
  -d '{"script": "../../../etc/passwd"}'

# Test oversized payload (should fail)
curl -X POST http://localhost:5000/api/run-script \
  -H "Content-Type: application/json" \
  -d '{"parameters": {"data": "'$(python3 -c "print('x'*2000000)")'""}}'
```

### Step 6: Verify Docker Network Isolation
```bash
# Verify backend can't be accessed directly from host (should timeout/fail)
# Only accessible via the exposed port mapping

# Verify backend can communicate with db
docker-compose exec backend ping db
```

### End-to-End Test Checklist
- [ ] Backend container starts successfully
- [ ] Frontend loads without errors
- [ ] Form appears in UI with correct styling
- [ ] Button click sends request to backend
- [ ] Script executes and returns results
- [ ] Success status appears and auto-hides
- [ ] Error status appears and persists
- [ ] Button disables during execution
- [ ] Multiple executions work correctly
- [ ] Invalid input handled gracefully
- [ ] Network security verified
- [ ] Logs show no errors

---

## Development vs Production

**Development Mode (current plan):**
- Flask debug mode enabled
- Volume mounts for hot reload
- Detailed error messages in logs
- CORS allows localhost

**Production Considerations (future):**
- Set `FLASK_ENV=production`
- Remove volume mounts (bake code into image)
- Use proper secrets management for DB password
- CORS restricted to actual domain
- Add nginx reverse proxy for backend
- Enable HTTPS/TLS
- Add rate limiting
- Add authentication if needed

---

## Script Integration Notes

**Your Python Script Requirements:**

1. **Input Format:** Read parameters from stdin as JSON
```python
import json
import sys

# Read parameters
params = json.load(sys.stdin)
param1 = params.get('param1')
param2 = params.get('param2')
```

2. **Output Format:** Write results to stdout as JSON
```python
result = {"data": "some result"}
print(json.dumps(result))
```

3. **Error Handling:** Exit with non-zero code on error
```python
if error_occurred:
    print(json.dumps({"error": "Error message"}))
    sys.exit(1)
```

4. **Execution Time:** Keep under 30 seconds (timeout limit)

**If your existing script doesn't match this format:**
- We can create a wrapper script that adapts it
- Or modify the Flask backend to accommodate different I/O patterns
- Let me know what your script expects and returns

---

## Alternative Approaches Considered

**1. Node.js Backend (as in CRUD plan)**
- Pro: Aligns with existing CRUD implementation plan
- Con: Requires Python child process spawning, added complexity
- Verdict: Deferred - Flask is simpler for Python script execution

**2. Direct CGI/FastCGI**
- Pro: No custom backend needed, nginx can handle
- Con: Outdated, limited functionality, harder to debug
- Verdict: Rejected - Not modern or maintainable

**3. Serverless (AWS Lambda, etc.)**
- Pro: Scalable, managed infrastructure
- Con: Requires cloud account, more complex setup, latency
- Verdict: Rejected - Overkill for local development

**4. FastAPI instead of Flask**
- Pro: Modern, async support, automatic API docs
- Con: More complex for simple use case
- Verdict: Deferred - Flask sufficient for now, can migrate later

---

## Migration Path with Existing CRUD Plan

Your memory bank contains a comprehensive Node.js/Express CRUD implementation plan. Here's how this Python backend fits:

**Option 1: Microservices (Recommended)**
- Keep Python Flask for script execution (this plan)
- Add Node.js Express for CRUD operations (separate service)
- Each service has a specific responsibility
- Communicate via API calls if needed

**Option 2: Unified Backend**
- Implement everything in Node.js/Express
- Execute Python scripts via child processes
- Single backend service
- More complex but fewer containers

**Option 3: Python-Only**
- Replace CRUD plan with Flask/FastAPI
- Everything in Python ecosystem
- Simpler stack, fewer languages
- May require rewriting CRUD plan

**Recommendation:** Start with Option 1 (this plan) since it's isolated and doesn't affect future CRUD work. Can integrate or consolidate later based on needs.

---

## Estimated File Changes Summary

| File | Action | Lines Changed |
|------|--------|---------------|
| `/backend/app.py` | Create | ~80 lines |
| `/backend/dockerfile` | Create | ~15 lines |
| `/backend/requirements.txt` | Create | 2 lines |
| `/backend/scripts/your_script.py` | Create | ~30 lines (placeholder) |
| `/docker-compose.yml` | Modify | +20 lines |
| `/public/index.html` | Modify | +25 lines |
| `/public/script.js` | Modify | +60 lines |
| `/public/styles.css` | Modify | +80 lines |

**Total:** ~312 lines of new code across 8 files

---

## Dependencies

**Python packages (backend):**
- Flask 3.0.0 - Web framework
- Flask-CORS 4.0.0 - Cross-origin resource sharing

**JavaScript (frontend):**
- Native Fetch API (no libraries needed)
- No new dependencies

**Infrastructure:**
- Docker - Already in use
- Docker Compose - Already in use

---

## Risk Assessment

**Low Risk:**
- ✅ Adding new service doesn't affect existing webapp
- ✅ Can test backend independently before frontend integration
- ✅ Easy to rollback (remove backend service from docker-compose)
- ✅ No database schema changes

**Medium Risk:**
- ⚠️ Script execution security (mitigated by whitelist + validation)
- ⚠️ Resource consumption (mitigated by timeout + Docker limits)

**High Risk:**
- ❌ None identified

---

## Open Questions

**1. Script Specifics:**
- What is the actual Python script you want to run?
- Where is it currently located?
- What does it do and what are its dependencies?
- What parameters does it expect?

**2. Form Fields:**
- What specific input fields do you need? (text, numbers, dropdowns, etc.)
- What are the parameter names?
- Any validation rules? (required, min/max values, formats)

**3. Future Integration:**
- Should this eventually connect to the PostgreSQL database?
- Will you implement the CRUD backend (Node.js or Python)?
- Any other scripts you want to add later?

**These questions don't block implementation** - we can start with placeholder fields and adapt once you provide your actual script.

---

## Next Steps After Approval

1. Create backend directory structure and Flask app
2. Create Dockerfile and requirements.txt for backend
3. Add backend service to docker-compose.yml
4. Create placeholder Python script (you'll replace with yours)
5. Modify frontend HTML to add form
6. Modify frontend JavaScript to handle form submission
7. Modify frontend CSS for form styling
8. Build and test Docker containers
9. Verify end-to-end functionality
10. Document how to integrate your specific script

**Estimated implementation time:** 30-45 minutes for basic setup + testing
