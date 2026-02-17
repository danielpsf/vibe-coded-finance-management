# Security Scanning Configuration

## Backend Security

The backend uses the following security scanning tools:

### 1. Bandit - Python Security Linter
Scans Python code for security vulnerabilities
```bash
cd backend
bandit -r . -f json -o bandit-report.json
```

### 2. Safety - Dependency Vulnerability Scanner
Checks Python dependencies for known vulnerabilities
```bash
cd backend
safety check --json --output safety-report.json
```

### 3. Pylint Security
General Python security linting
```bash
cd backend
pylint --disable=all --enable=E,W,R --output-format=json **/*.py > pylint-report.json
```

## Frontend Security

### 1. npm audit
Checks Node.js dependencies for vulnerabilities
```bash
cd frontend
npm audit --json > npm-audit-report.json
```

### 2. ESLint Security Plugin
Checks JavaScript/TypeScript code for security issues
```bash
cd frontend
npm run lint:security
```

## Docker Security

### 1. Trivy - Container Image Scanner
Scans Docker images for vulnerabilities
```bash
# Scan backend image
trivy image finance-backend:test

# Scan frontend image
trivy image finance-frontend:test
```

### 2. Docker Bench for Security
Checks Docker daemon and container configuration
```bash
docker run -it --net host --pid host --userns host --cap-add audit_control \
  -e DOCKER_CONTENT_TRUST=$DOCKER_CONTENT_TRUST \
  -v /var/lib:/var/lib \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /usr/lib/systemd:/usr/lib/systemd \
  -v /etc:/etc --label docker_bench_security \
  docker/docker-bench-security
```

## Security Best Practices

### Backend
1. Use parameterized queries (SQLAlchemy ORM handles this)
2. Validate all input data with Pydantic schemas
3. Use HTTPS in production
4. Implement rate limiting
5. Use secure headers
6. Keep dependencies updated

### Frontend
1. Sanitize user input
2. Use Content Security Policy (CSP)
3. Avoid XSS vulnerabilities
4. Keep dependencies updated
5. Use secure communication with backend

### Docker
1. Use official base images
2. Keep images updated
3. Run containers as non-root user
4. Use multi-stage builds
5. Scan images before deployment
6. Use secrets management

## Vulnerability Severity Levels

- **CRITICAL**: Immediate action required
- **HIGH**: Fix within 24 hours
- **MEDIUM**: Fix within 1 week
- **LOW**: Fix in next release

## Reporting Security Issues

If you discover a security vulnerability, please report it by creating an issue in the GitHub repository.