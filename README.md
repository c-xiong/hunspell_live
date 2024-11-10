# Correction tool

## Prerequisites

- [Docker Desktop](https://www.docker.com/get-started) installed on your machine.
- Git installed on your machine

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Clone the Repository
```bash
git clone https://github.com/imred42/correction_tool.git
cd correction-tool
```

### Environment Setup
1. Create a `.env` file in the root directory
2. Add the following environment variable:
```bash
DJANGO_SECRET_KEY=your_secret_key_here
VITE_BASE_URL_DEV=http://localhost:8000
VITE_BASE_URL_PROD=https://your-production-api.com
```

### Build and Run the Docker Containers
```bash
docker compose up --build
```

### Accessing the Application
Once the containers are running, you can access:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000

### Development
The application uses hot-reloading for both frontend and backend:
- Frontend changes will automatically reflect in the browser
- Backend changes will trigger an automatic server restart