# Sustainability ML Platform

## Overview

This application is a comprehensive machine learning platform focused on sustainability and environmental impact assessment. It provides AI-powered insights for packaging optimization, carbon footprint calculation, product recommendations, and ESG (Environmental, Social, Governance) scoring. The platform features both individual prediction capabilities and batch processing for large datasets.

## System Architecture

The application follows a full-stack architecture with clear separation between frontend, backend, and data layers:

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom sustainability-themed color palette
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful endpoints with structured error handling
- **File Processing**: Multer for handling CSV file uploads
- **Development**: Hot reload with tsx for rapid development

### Database Architecture
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (Neon serverless in production)
- **Migrations**: Drizzle Kit for schema management
- **Schema**: Shared TypeScript definitions between client and server

## Key Components

### Machine Learning Models
The platform includes four specialized ML models:

1. **Packaging Model**: Recommends optimal packaging solutions based on material type, product weight, fragility, recyclability, and transport mode
2. **Carbon Footprint Model**: Calculates environmental impact from purchasing patterns, travel, and energy consumption
3. **Product Recommendation Model**: Suggests sustainable products based on category, materials, pricing, and environmental metrics
4. **ESG Score Model**: Analyzes environmental, social, and governance factors for products and companies

### Data Processing Pipeline
- **CSV Parser**: Custom implementation for handling various CSV formats
- **Batch Processing**: Asynchronous processing of large datasets with progress tracking
- **Real-time Updates**: Live status monitoring for batch jobs and model training

### User Interface Components
- **Dashboard**: Central hub with quick actions and performance visualizations
- **Model Interfaces**: Dedicated forms for each ML model with validation
- **Batch Processor**: File upload interface with drag-and-drop support
- **Charts**: Performance visualization using Recharts library

## Data Flow

1. **Single Predictions**: User inputs → Form validation → API call → ML model processing → Results display
2. **Batch Processing**: CSV upload → File parsing → Queue processing → Progress tracking → Results download
3. **Model Training**: Training trigger → Background processing → Status updates → Completion notification
4. **Status Monitoring**: Real-time polling → State updates → UI refresh

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection for serverless environments
- **@tanstack/react-query**: Server state management and caching
- **drizzle-orm**: Type-safe database ORM
- **express**: Web application framework
- **multer**: File upload handling

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **recharts**: Chart visualization library
- **react-hook-form**: Form state management

### Development Dependencies
- **vite**: Build tool and development server
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Fast JavaScript bundler for production builds

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with hot reload
- **Database**: Local PostgreSQL or Neon development instance
- **File Storage**: In-memory storage for development

### Production Deployment
- **Platform**: Replit autoscale deployment
- **Build Process**: Vite build for frontend, esbuild for backend
- **Database**: Neon serverless PostgreSQL
- **Environment**: Production optimizations enabled
- **Port Configuration**: Express server on port 5000, external port 80

### Configuration Management
- **Environment Variables**: DATABASE_URL for database connection
- **Build Scripts**: Separate dev, build, and production start commands
- **Asset Handling**: Static file serving for production builds

## Deployment Configuration

### Vercel Ready
The application is now configured for Vercel deployment with:
- Serverless function API endpoint at `/api/index.js`
- PostgreSQL database integration with Neon
- CORS configuration for production
- Optimized for free tier limitations

### Required Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (Neon serverless recommended)

### Deployment Files
- `vercel.json`: Vercel configuration
- `api/index.js`: Serverless function for API endpoints
- `api/package.json`: API dependencies
- `README.md`: Complete documentation

## Changelog

```
Changelog:
- June 26, 2025. Initial setup and full application development
- June 26, 2025. Database integration with PostgreSQL and Drizzle ORM
- June 26, 2025. Enhanced training UI with loading states and progress indicators
- June 26, 2025. Vercel deployment configuration completed
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```