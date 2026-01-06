# POS Frontend - Next.js Setup

This is a Next.js frontend application for a Point of Sale (POS) system, built with TypeScript and Bootstrap.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Bootstrap 5 + Custom CSS
- **HTTP Client**: Axios
- **Backend**: Spring Boot (Java 21) + MySQL

## Project Structure

```
pos_frontend/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── layout.tsx       # Root layout with Bootstrap
│   │   ├── page.tsx         # Homepage
│   │   └── globals.css      # Global styles
│   ├── components/          # Reusable React components
│   │   ├── Navbar.tsx       # Navigation bar
│   │   ├── LoadingSpinner.tsx
│   │   └── ErrorAlert.tsx
│   ├── services/            # API service layer
│   │   └── apiService.ts    # Axios instance with interceptors
│   ├── types/               # TypeScript type definitions
│   │   └── api.types.ts     # API response types
│   └── utils/               # Utility functions
│       ├── formatters.ts    # Currency and date formatters
│       └── validators.ts    # Form validation functions
├── public/                  # Static assets
├── .env.local              # Environment variables
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Spring Boot backend running on `http://localhost:8080`

### Installation

```bash
# Install dependencies
npm install
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Features

### API Service

The `apiService.ts` provides a configured Axios instance with:
- Automatic authentication token injection
- Request/response interceptors
- Error handling with automatic redirect on 401
- TypeScript support for all HTTP methods

### Reusable Components

- **Navbar**: Bootstrap navigation with routing
- **LoadingSpinner**: Customizable loading indicator
- **ErrorAlert**: Bootstrap alert for error messages

### Utilities

- **Formatters**: Currency (INR) and date formatting
- **Validators**: Email, phone, and form field validation

## API Integration

Example usage of the API service:

```typescript
import apiService from '@/services/apiService';

// GET request
const products = await apiService.get('/products');

// POST request
const newProduct = await apiService.post('/products', {
  name: 'Product Name',
  price: 100
});

// PUT request
const updated = await apiService.put('/products/1', data);

// DELETE request
await apiService.delete('/products/1');
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Next Steps

1. Create page routes for:
   - `/products` - Product management
   - `/sales` - Sales transactions
   - `/reports` - Analytics and reports
   - `/login` - Authentication

2. Implement authentication flow
3. Create forms for CRUD operations
4. Add data tables with pagination
5. Implement invoice generation

## Notes

- Bootstrap is imported globally in `layout.tsx` and `globals.css`
- The API base URL can be changed in `.env.local`
- Authentication tokens are stored in `localStorage`
- All components use Bootstrap classes for styling
