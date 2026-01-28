# Sai Siddha Furniture Work - Web Application

A modern web application for managing industrial wooden pallet manufacturing business operations, including inventory, sales, invoicing, and quotations.

## 🚀 Features

- **Public Website**: Landing page with business information and services
- **Admin Dashboard**: Comprehensive management system for business operations
- **Product Management**: Track inventory, pricing, and stock levels
- **Sales Management**: Create and manage sales with GST calculations
- **Invoice Generation**: Generate professional PDF invoices
- **Quotation System**: Manage customer quotations and track orders
- **Payment Tracking**: Monitor pending payments and revenue
- **CFT Calculator**: Calculate cubic feet for wooden products

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Framework**: Tailwind CSS + shadcn/ui
- **Routing**: React Router v6
- **State Management**: React Query (TanStack Query)
- **Backend**: Supabase (PostgreSQL + Auth)
- **PDF Generation**: jsPDF + jsPDF-AutoTable
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Supabase account
- Vercel account (for deployment)

## 🔧 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd <project-directory>
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with:
```env
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
VITE_SUPABASE_URL=your_supabase_url
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:8080`

## 📦 Build

To create a production build:
```bash
npm run build
```

To preview the production build locally:
```bash
npm run preview
```

## 🚀 Deployment

### Deploy to Vercel

1. **Automatic Deployment** (Recommended):
   - Connect your Git repository to Vercel
   - Push changes to trigger automatic deployments

2. **Manual Deployment**:
```bash
npm run deploy
```

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

### Environment Variables on Vercel

Set the following environment variables in your Vercel project settings:
- `VITE_SUPABASE_PROJECT_ID`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_URL`

## 📁 Project Structure

```
├── public/              # Static assets
├── src/
│   ├── assets/         # Images, fonts, etc.
│   ├── components/     # React components
│   │   ├── admin/     # Admin-specific components
│   │   └── ui/        # shadcn/ui components
│   ├── contexts/      # React contexts
│   ├── hooks/         # Custom React hooks
│   ├── integrations/  # External service integrations
│   ├── lib/           # Utility functions
│   ├── pages/         # Page components
│   │   └── admin/    # Admin pages
│   └── types/         # TypeScript type definitions
├── supabase/          # Supabase configuration
│   ├── functions/    # Edge functions
│   └── migrations/   # Database migrations
└── vercel.json       # Vercel configuration
```

## 🔐 Admin Access

The admin panel is protected and requires authentication. Access it at `/admin/login`.

## 🧪 Testing

Run tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run deploy` - Deploy to Vercel (production)
- `npm run deploy:preview` - Deploy to Vercel (preview)

## 🎨 UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/) components built on top of Radix UI primitives and styled with Tailwind CSS.

## 📊 Database

The application uses Supabase (PostgreSQL) for data storage. Database schema and migrations are located in the `supabase/migrations` directory.

## 🔒 Security

- Admin routes are protected with authentication
- Environment variables are used for sensitive data
- HTTPS enforced in production
- CORS configured for Supabase

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📄 License

Private - All rights reserved

## 👥 Contact

**Sai Siddha Furniture Work**
- Owner: Mr. Pritam Nandgaonkar
- Phone: 9075700075, 9075000515
- Email: saisiddhafurnitureworks@gmail.com
- Location: MIDC, Ratnagiri, Maharashtra, India

## 🤝 Contributing

This is a private project. For any inquiries, please contact the business owner.

## 📈 Performance

The application is optimized for performance with:
- Code splitting
- Lazy loading
- Asset optimization
- Caching strategies
- Minification

## 🐛 Troubleshooting

For common issues and solutions, see [DEPLOYMENT.md](./DEPLOYMENT.md#troubleshooting)

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT.md)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
