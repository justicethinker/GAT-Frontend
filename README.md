# GAT-Frontend

A modern, full-stack trading and arbitrage platform built with React, TypeScript, and Express.js.

## Overview

GAT-Frontend is a comprehensive frontend application for Gods Love Trading, featuring:
- **User Authentication** - Secure login and registration with JWT tokens
- **Dashboard** - Real-time trading data and portfolio overview
- **Wallet Management** - Multi-currency wallet with deposit/withdrawal support
- **Trading Modes** - Forex, Futures, and Arbitrage trading
- **Admin Panel** - User management and system administration
- **Responsive UI** - Mobile-friendly design with Tailwind CSS

## Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **TailwindCSS** - Utility-first CSS framework
- **React Query** - Server state management
- **Wouter** - Lightweight routing
- **React Hook Form** - Form state management

### Backend
- **Express.js** - Node.js web server
- **PostgreSQL** - Database (via Neon)
- **Drizzle ORM** - Type-safe database queries
- **Passport.js** - Authentication strategy

### UI Components
- **Shadcn/UI** - High-quality React components
- **Radix UI** - Primitive component library
- **Lucide Icons** - Beautiful icon library

## Project Structure

```
├── client/                    # React frontend
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── components/       # Reusable components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utilities & helpers
│   │   └── App.tsx           # Root component
│   └── index.html
├── server/                    # Express backend
│   ├── index.ts              # Server entry point
│   ├── routes.ts             # API routes
│   ├── db.ts                 # Database setup
│   └── vite.ts               # Vite integration
├── shared/                    # Shared code
│   └── schema.ts             # Data validation schemas
├── vite.config.ts            # Vite configuration
├── tailwind.config.ts        # Tailwind configuration
└── package.json
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL database (Neon)

### Installation

1. **Clone and Install**
```bash
git clone <repository>
cd GAT-Frontend
npm install
```

2. **Environment Setup**
Create a `.env` file in the root directory:
```env
VITE_BACKEND_URL=https://gatbackend.name.ng
DATABASE_URL=postgresql://user:password@host/database
PORT=5000
NODE_ENV=development
```

For production, create `.env.production`:
```env
VITE_BACKEND_URL=https://gatbackend.name.ng
```

### Development

Start the development server:
```bash
npm run dev
```

The app will run on `http://localhost:5000` with hot module reloading.

Type checking:
```bash
npm run check
```

### Production Build

```bash
npm run build
npm run start
```

Preview the production build locally:
```bash
npm run preview
```

## Deployment

### Docker Deployment

Build the Docker image:
```bash
docker build -t gat-frontend:latest \
  --build-arg VITE_BACKEND_URL=https://gatbackend.name.ng \
  .
```

Run the container:
```bash
docker run -p 5000:5000 gat-frontend:latest
```

### Important: Environment Variables at Build Time

⚠️ **CRITICAL**: Vite embeds environment variables at build time. The `VITE_BACKEND_URL` must be passed during the Docker build step:

```dockerfile
ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}
RUN npm run build
```

Failure to do this will cause the frontend to call itself instead of the backend API.

## Key Features

### Authentication
- JWT-based authentication with secure token storage
- Login, registration, and password reset flows
- Role-based access control (Admin/User)

### API Integration
All API calls use the `buildUrl()` helper function which properly resolves to the backend URL:
```typescript
import { buildUrl } from '@/lib/api';

const response = await fetch(buildUrl('/auth/token'), {
  method: 'POST',
  body: JSON.stringify(credentials)
});
```

### State Management
- **React Query** for server state (API data)
- **Session Storage** for authentication tokens
- **Zustand** for client-side state (if needed)

### UI Components
All components are from Shadcn/UI, providing:
- Consistent design across the app
- Accessibility-first approach
- Easy customization via Tailwind

## Common Tasks

### Add a New Page
1. Create file in `client/src/pages/YourPage.tsx`
2. Add route in `server/routes.ts` or via Wouter in `App.tsx`
3. Use `buildUrl()` for API calls

### Add a New API Endpoint
1. Add route in `server/routes.ts`
2. Implement handler function
3. Call from frontend using `buildUrl('/your-endpoint')`

### Update Database Schema
1. Modify `shared/schema.ts`
2. Run: `npm run db:push`

### Customize Styling
- Tailwind config: `tailwind.config.ts`
- Global styles: `client/src/index.css`
- Component styles: Shadcn components use Tailwind classes


## Troubleshooting

### Frontend calls itself instead of backend
**Cause**: `VITE_BACKEND_URL` not set during build
**Solution**: Pass as build argument: `--build-arg VITE_BACKEND_URL=<url>`

### Login keeps redirecting to login page
**Cause**: API calls failing (usually backend URL issue)
**Solution**: Check browser console for API errors. Verify `VITE_BACKEND_URL` is correct.

### Type errors with environment variables
**Cause**: Missing imports
**Solution**: Import from `@/lib/api` using `buildUrl()` helper

### CORS errors
**Cause**: Backend not configured to accept requests from frontend origin
**Solution**: Check backend CORS configuration

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and test locally: `npm run dev`
3. Build and verify: `npm run build`
4. Push and create a pull request

## Performance Tips

- Use React Query's caching to reduce API calls
- Lazy load pages using code splitting
- Monitor bundle size: `npm run build` shows asset sizes
- Use the DevTools Profiler for React performance analysis

## Security Notes

- Tokens are stored in `sessionStorage` (cleared on browser close)
- Use HTTPS in production
- Never commit `.env` files
- Always use `buildUrl()` for API endpoints (prevents hardcoding URLs)
- Sanitize user input before rendering

## Support & Contact

For issues or questions:
1. Check existing documentation
2. Review error messages in browser console
3. Check backend logs for API errors

## License

MIT
