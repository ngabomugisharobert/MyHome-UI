# MyHome Healthcare Frontend

A modern React frontend for the MyHome Healthcare Management System, built with Material-UI and TypeScript.

## Features

- 🎨 **Material-UI Design System** - Modern, responsive UI components
- 🔐 **Authentication** - Secure login with JWT tokens
- 👥 **Role-based Access** - Different interfaces for Admin, Doctor, Caregiver, Supervisor
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🏥 **Healthcare Focused** - Specialized for healthcare facility management
- 📊 **Data Visualization** - Interactive tables and dashboards
- 🚀 **TypeScript** - Type-safe development

## Tech Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type safety and better development experience
- **Material-UI v5** - Google's Material Design components
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **React Hook Form** - Form handling and validation

## Quick Start

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your API URL:
   ```env
   REACT_APP_API_URL=http://localhost:3000/api
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3001`

## Project Structure

```
src/
├── components/
│   ├── auth/           # Authentication components
│   └── layout/         # Layout components
├── contexts/           # React contexts
├── pages/             # Page components
├── services/          # API services
├── types/             # TypeScript type definitions
├── theme.ts           # Material-UI theme
└── App.tsx            # Main app component
```

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Authentication

The app uses JWT tokens for authentication:

- **Login**: `POST /api/auth/login`
- **Register**: `POST /api/auth/register` (Admin only)
- **Profile**: `GET /api/auth/profile`
- **Logout**: `POST /api/auth/logout`

## User Roles

- **Admin**: Full system access, user & facility management
- **Supervisor**: View reports, audit logs, user management
- **Doctor**: Prescribe medications, view residents, medical records
- **Caregiver**: View assigned residents, daily logs, medication admin

## Demo Accounts

- **Admin**: `admin@myhome.com` / `Admin123!`
- **Doctor**: `doctor@myhome.com` / `Doctor123!`
- **Caregiver**: `caregiver1@myhome.com` / `Caregiver123!`
- **Supervisor**: `supervisor@myhome.com` / `Supervisor123!`

## API Integration

The frontend connects to the Express API backend:

- **Base URL**: `http://localhost:3000/api`
- **Authentication**: JWT Bearer tokens
- **Error Handling**: Automatic token refresh
- **CORS**: Configured for local development

## Development

### Adding New Pages

1. Create component in `src/pages/`
2. Add route in `src/App.tsx`
3. Add navigation item in `DashboardLayout.tsx`

### Styling

- Uses Material-UI theme system
- Custom theme in `src/theme.ts`
- Responsive design with Material-UI breakpoints
- Consistent color palette and typography

### State Management

- React Context for authentication
- Local state for component data
- API calls with Axios interceptors
- Automatic token refresh handling

## Production Build

```bash
npm run build
```

The build folder contains the production-ready files.

## Contributing

1. Follow TypeScript best practices
2. Use Material-UI components consistently
3. Implement proper error handling
4. Add loading states for async operations
5. Ensure responsive design
