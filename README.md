# Habitify

Habitify is a collaborative habit-building platform designed to help users build, track, and maintain habits effectively. The application allows users to stay motivated, team up with friends, and achieve their goals together.

## Project Structure

- **Frontend**: React-based web application deployed on Vercel
- **Backend**: Node.js/Express API deployed on Render
- **Monitoring**: Prometheus and Grafana setup for tracking application metrics

## Development Tools & CI/CD Pipeline

This project uses a comprehensive set of tools for development, testing, and deployment:

### Version Control

- **Git/GitHub**: Used for version control and collaborative development
- **GitHub Flow**: Feature branch workflow for development

### Testing Framework

- **Jest**: Used for both frontend and backend unit and integration tests
- **Postman**: Used for API testing and documentation

### CI/CD Pipeline

- **GitHub Actions**: Automated workflow for testing and deployment
  - Runs tests on pull requests and pushes to main branch
  - Performs linting and code quality checks
  - Builds the application for deployment

- **Continuous Deployment**:
  - **Vercel**: Frontend deployment (automatic on pushes to main)
  - **Render**: Backend deployment (automatic on pushes to main)

### Monitoring

- **Prometheus**: Collects metrics from the backend application
- **Grafana**: Visualizes metrics in customizable dashboards

## Testing

The project includes comprehensive tests for both frontend and backend:

### Backend Tests

- Controller tests for authentication, user management, goals, etc.
- API endpoint tests for request/response validation
- Database interaction tests
- Middleware tests for authentication and error handling

### Frontend Tests

- Component tests for UI elements
- Integration tests for user flows
- State management tests

## How to Use These Tools

### Running Tests

```bash
# Backend tests
cd Backend
npm test

# Frontend tests
cd Frontend
npm test
```

### Using GitHub Actions

GitHub Actions workflows are automatically triggered on:
- Pull requests to the main branch
- Pushes to the main branch

You can view the workflow results in the "Actions" tab of the GitHub repository.

### Monitoring with Prometheus and Grafana

To start the monitoring stack:

```bash
cd monitoring
docker compose up -d
```

This will start:
- Prometheus on http://localhost:9091
- Grafana on http://localhost:3001 (login: admin/admin)

The monitoring setup tracks:
- API request counts and response times
- Active user counts
- Error rates
- System metrics

### Deployment

#### Frontend (Vercel)

The frontend is automatically deployed to Vercel when changes are pushed to the main branch. You can view the live application at:
https://habitify-one.vercel.app

#### Backend (Render)

The backend is automatically deployed to Render when changes are pushed to the main branch. The API is accessible at:
https://habitify-8qnw.onrender.com

## Development Workflow

1. Create a feature branch from main
2. Make your changes
3. Run tests locally to ensure everything works
4. Create a pull request to merge your changes into main
5. GitHub Actions will run tests on your pull request
6. Once approved and merged, the changes will be automatically deployed

## Monitoring Dashboard

The Grafana dashboard provides insights into:
- API traffic and response times
- Error rates and status codes
- Active user counts
- System resource usage

This helps in identifying performance issues, tracking user engagement, and ensuring the application is running smoothly.
