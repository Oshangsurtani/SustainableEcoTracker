# Sustainability ML Platform

A comprehensive machine learning platform focused on sustainability and environmental impact assessment. Provides AI-powered insights for packaging optimization, carbon footprint calculation, product recommendations, and ESG scoring.

## Features

- **Packaging Optimization**: ML-powered recommendations for sustainable packaging solutions
- **Carbon Footprint Analysis**: Calculate and analyze environmental impact from various activities
- **Product Recommendations**: AI-driven suggestions for sustainable product choices
- **ESG Scoring**: Environmental, Social, and Governance impact assessment
- **Batch Processing**: Handle large datasets with progress tracking
- **Real-time Analytics**: Live performance monitoring and visualization

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Deployment**: Vercel (Frontend + Serverless Functions)
- **ML Models**: Custom implementations based on sustainability research

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database (or Neon serverless)
- Environment variables configured

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd sustainability-ml-platform
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Add your DATABASE_URL and other required variables
```

4. Initialize the database
```bash
npm run db:push
```

5. Start the development server
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `DATABASE_URL`: Your PostgreSQL connection string
4. Deploy automatically on push to main branch

### Environment Variables

```env
DATABASE_URL=postgresql://user:password@host:port/database
NODE_ENV=production
```

## API Endpoints

### Model Status
- `GET /api/models/status` - Get all model statuses
- `GET /api/models/status/:modelType` - Get specific model status
- `POST /api/models/train/:modelType` - Start model training

### Predictions
- `POST /api/predict/packaging` - Get packaging recommendations
- `POST /api/predict/carbon` - Calculate carbon footprint
- `POST /api/predict/product` - Get product recommendations
- `POST /api/predict/esg` - Calculate ESG scores

### Batch Processing
- `POST /api/batch/upload` - Upload CSV for batch processing
- `GET /api/batch/jobs` - Get batch job status
- `GET /api/batch/jobs/:id` - Get specific job details

## Model Types

### Packaging Model
Analyzes material type, weight, fragility, and transport mode to recommend optimal packaging solutions.

**Input Parameters:**
- Material Type (Plastic, Cardboard, Glass, Metal, Composite)
- Product Weight (kg)
- Fragility Level (Low, Medium, High)
- Recyclable (Yes/No)
- Transport Mode (Road, Rail, Sea, Air)
- LCA Emission (kg CO2)

### Carbon Footprint Model
Calculates total carbon emissions based on purchasing patterns, travel, and energy consumption.

**Input Parameters:**
- Total Purchases (annual spend)
- Average Distance (km)
- Preferred Packaging
- Returns Percentage
- Electricity Usage (kWh)
- Travel Distance (km)
- Service Usage (hours)

### Product Recommendation Model
Suggests sustainable products based on category, materials, pricing, and environmental metrics.

**Input Parameters:**
- Category
- Material
- Brand
- Price
- Rating (1-5)
- Reviews Count
- Carbon Footprint
- Water Usage
- Waste Production
- Average Price

### ESG Score Model
Analyzes environmental, social, and governance factors for comprehensive sustainability assessment.

**Input Parameters:**
- Product Name
- Sentence (description)
- Sentiment (Positive, Negative, Neutral)
- Environmental Score (0-100)

## Development

### Project Structure
```
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared TypeScript schemas
├── api/            # Vercel serverless functions
└── attached_assets/ # ML model training data
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push database schema changes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please open a GitHub issue or contact the development team.