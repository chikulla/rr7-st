# rr7-st

react router 7 study repo

# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/remix-run/react-router-templates/tree/main/default)

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Environment Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Update the API base URL in `.env`:
```bash
# For local development
API_BASE_URL=http://localhost:3000

# For production (example)
# API_BASE_URL=https://your-production-api.com
```

### Mock API Server

Start the JSON server for mock data:

```bash
npx json-server mock/db.json --port 3000
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## API Configuration

The application uses a shared API configuration located in `app/api/api.ts`. The API base URL is determined in the following priority order:

1. **Environment Variable**: `API_BASE_URL` from `.env` file
2. **Browser Detection**: Uses the current hostname with port 3000 (e.g., `https://yourdomain.com:3000`)
3. **Fallback**: `http://localhost:3000`

This allows the application to work seamlessly across different environments without code changes.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.
