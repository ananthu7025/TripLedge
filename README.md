# Trip Ledge - Admin Panel

Trip Ledge is a comprehensive trip hazard inspection and snow removal management system for the City of North Battleford. This admin panel allows administrators to manage work zones, track inspections, approve check-in requests, and generate reports.

## Features

### Completed Features ✅

1. **Zone Management** - Interactive Google Maps integration for creating and managing work zones
   - Draw zones by clicking points on the map
   - Automatically creates jobs in Trip Inspection and/or Snow Removal modules
   - Filter and search zones
   - Delete zones

2. **Dashboard** - Real-time overview of operations
   - Live trip inspection stats (pending, inspected, completed)
   - Live snow removal stats (pending, in progress, completed)
   - Pending check-in request alerts
   - Quick action buttons

3. **Trip Inspection** - Manage all trip inspections
   - View all inspections with filtering (all, pending, inspected, completed)
   - Search by street, avenue, or trip ID
   - Real-time status updates
   - Automatically created when zones are added

4. **Database & API**
   - Complete PostgreSQL database schema with Drizzle ORM
   - RESTful API routes for all operations
   - Audit logging for all admin actions
   - Automatic ID generation (T-001, S-001, etc.)

### Pending Features (UI Created, Need Backend Integration)

- Snow Removal management
- Check-In Requests approval
- Attendance tracking
- Targets management
- Reports generation
- Users management
- Settings configuration
- Audit Log viewer
- Help & Support

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Drizzle ORM
- **Maps**: Google Maps (@vis.gl/react-google-maps)
- **Icons**: Lucide React

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- Google Maps API key

### 2. Clone and Install

```bash
cd triplegde
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/tripledge

# Google Maps API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Next Auth (optional for now)
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
```

**Important**: Replace the values with your actual credentials:
- Get your Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/)
- Ensure your PostgreSQL database is running and accessible

### 4. Push Database Schema

Push the Drizzle schema to your database:

```bash
npm run db:push
```

This creates all the necessary tables in your PostgreSQL database.

### 5. Seed the Database

Seed the database with initial data:

```bash
npm run db:seed
```

This creates:
- **Roles**: Admin and Technician
- **Default Admin User**:
  - Email: `admin@tripledge.com`
  - Password: `admin123`
- **Company Settings**: Default settings for North Battleford

### 6. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 7. Login to Admin Panel

Navigate to `http://localhost:3000/admin/login` and login with:
- **Email**: admin@tripledge.com
- **Password**: admin123

## Usage Guide

### Creating a Zone

1. Go to **Zone Management** (Map Management)
2. Click **Add Zone** button
3. Fill in the zone details:
   - Zone Name (e.g., "100th Street")
   - Zone Type (Proposed or Additional)
   - Module (Trip Inspection, Snow Removal, or Both)
   - Priority (High, Medium, Low)
4. Click **Start Drawing**
5. Click on the map to add points for your zone polyline
6. Click **Finish** when done (minimum 2 points required)
7. The zone is saved and jobs are automatically created!

### Viewing Trip Inspections

1. Go to **Trip Inspection** page
2. Use the tabs to filter by status (All, Pending, Inspected, Completed)
3. Use the search bar to find specific inspections
4. Click the eye icon to view details (feature coming soon)

### Monitoring the Dashboard

The dashboard automatically updates with:
- Real-time stats from trip inspections and snow removals
- Pending check-in request alerts
- Quick links to all major sections

## Database Schema

The application uses the following main tables:

- **roles** - User roles (admin, technician)
- **users** - System users
- **zones** - Work zones with geographic data
- **trip_inspections** - Trip hazard inspections
- **snow_removals** - Snow removal jobs
- **checkin_requests** - Technician check-in requests
- **attendance** - Attendance records
- **targets** - Performance targets
- **reports** - Generated reports
- **audit_logs** - System audit trail
- **company_settings** - Company configuration

## Available Scripts

```bash
# Development
npm run dev          # Start development server

# Database
npm run db:push      # Push schema to database
npm run db:generate  # Generate migrations
npm run db:migrate   # Run migrations
npm run db:studio    # Open Drizzle Studio
npm run db:seed      # Seed database with initial data

# Production
npm run build        # Build for production
npm run start        # Start production server
```

## Project Structure

```
triplegde/
├── app/
│   ├── admin/
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/          # Dashboard page
│   │   │   ├── map-management/     # Zone management with Google Maps
│   │   │   ├── trip-inspection/    # Trip inspection management
│   │   │   ├── snow-removal/       # Snow removal management
│   │   │   ├── check-in-requests/  # Check-in approval
│   │   │   ├── attendance/         # Attendance tracking
│   │   │   ├── targets/            # Target management
│   │   │   ├── reports/            # Report generation
│   │   │   ├── users/              # User management
│   │   │   ├── settings/           # Settings
│   │   │   ├── audit-log/          # Audit logs
│   │   │   └── layout.tsx          # Dashboard layout
│   │   └── login/                  # Login page
│   ├── api/                        # API routes
│   │   ├── auth/
│   │   ├── zones/
│   │   ├── trip-inspections/
│   │   ├── snow-removals/
│   │   ├── checkin-requests/
│   │   ├── attendance/
│   │   ├── targets/
│   │   ├── reports/
│   │   ├── users/
│   │   ├── settings/
│   │   └── audit-logs/
│   └── globals.css
├── components/
│   ├── AdminLayout.tsx
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   └── ui/                         # Reusable UI components
├── db/
│   ├── schema.ts                   # Drizzle schema
│   ├── index.ts                    # Database connection
│   └── seed.ts                     # Seed data
├── lib/
│   ├── auth.ts                     # Authentication utilities
│   └── utils/
│       ├── generators.ts           # ID generators
│       ├── audit.ts                # Audit logging
│       └── session.ts              # Session management
├── .env.local.example              # Environment variables example
├── drizzle.config.ts               # Drizzle configuration
└── package.json
```

## API Endpoints

All API endpoints are located in `app/api/`:

- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - User logout
- `GET /api/zones` - List all zones
- `POST /api/zones` - Create a new zone
- `DELETE /api/zones?id=xxx` - Delete a zone
- `GET /api/trip-inspections` - List trip inspections
- `OPTIONS /api/trip-inspections` - Get trip stats
- `GET /api/snow-removals` - List snow removals
- `OPTIONS /api/snow-removals` - Get snow stats
- `GET /api/checkin-requests` - List check-in requests
- `POST /api/checkin-requests` - Approve/reject check-in
- `GET /api/attendance` - List attendance records
- `GET /api/users` - List users
- `POST /api/users` - Create a new user
- `PATCH /api/users?id=xxx` - Update a user
- `GET /api/targets` - List targets
- `POST /api/targets` - Create a new target
- `GET /api/reports` - List reports
- `POST /api/reports` - Generate a new report
- `GET /api/settings` - Get settings
- `PATCH /api/settings` - Update settings
- `POST /api/settings/wifi` - Add WiFi config
- `GET /api/audit-logs` - List audit logs

## Security Features

- Password hashing with bcrypt
- Session-based authentication with HTTP-only cookies
- Audit logging for all admin actions
- User role-based access control

## Next Steps

To complete the remaining features, you need to:

1. Build the remaining page UIs (similar to Dashboard and Trip Inspection patterns)
2. Connect them to the existing API routes
3. Add mobile app integration for technicians
4. Implement real-time updates (optional with WebSockets)
5. Add photo upload functionality for inspections
6. Implement Excel report generation

## Support

For support or questions, contact support@tripledge.com

## License

Proprietary - City of North Battleford

---

**Built with ❤️ for the City of North Battleford**
