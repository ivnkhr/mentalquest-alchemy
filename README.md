# MentalQuest Alchemy

Transform your goals (Rocks) into achievements (Gems) with powerful productivity tools.

## 🎯 Overview

MentalQuest Alchemy is a Progressive Web App (PWA) designed to help you manage productivity through a unique metaphor: turning "Rocks" (your goals and projects) into "Gems" (completed achievements). The app works offline-first, syncing your data when you're back online.

### Key Features

- 📱 **Progressive Web App** - Install on mobile/desktop, works offline
- 🔄 **Offline-First Architecture** - Create and edit rocks offline, auto-sync when online
- 📊 **Dashboard** - Real-time statistics and recent activity
- 💎 **Rock → Gem Transformation** - Track progress as you complete "edges" (subtasks)
- 🎨 **Beautiful UI** - Built with Ionic 8 and Angular 20
- 🔐 **Secure Authentication** - JWT-based with bcrypt password hashing
- 📦 **Smart Caching** - Service worker with intelligent caching strategies

## 🏗️ Tech Stack

### Frontend
- **Angular 20** - Zoneless, standalone components
- **Ionic 8** - Mobile-optimized UI components
- **NgRx** - State management with effects
- **Dexie.js** - IndexedDB wrapper for offline storage
- **Capacitor** - Native mobile features (status bar, splash screen)
- **TypeScript** - Type-safe development

### Backend
- **NestJS** - Enterprise Node.js framework
- **TypeORM** - Database ORM with MySQL
- **JWT/Passport** - Authentication
- **bcrypt** - Password hashing
- **MySQL 8.0** - Relational database

### DevOps
- **GitHub Actions** - CI/CD pipelines
- **Jest** - Backend testing (35/35 tests passing)
- **Jasmine/Karma** - Frontend testing
- **Docker** - Containerization
- **PM2** - Process management

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm 10+
- MySQL 8.0 (for backend)

### Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Run migrations (if implemented)
npm run migration:run

# Start development server
npm run start:dev
```

Backend runs on http://localhost:3000

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend runs on http://localhost:8100

### Docker Setup (Optional)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📖 Project Structure

```
mentalquest-alchemy/
├── backend/                 # NestJS backend
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── users/          # User management
│   │   ├── rocks/          # Rocks (goals) module
│   │   ├── edges/          # Edges (subtasks) module
│   │   └── config/         # Configuration files
│   └── test/               # E2E tests
│
├── frontend/               # Angular + Ionic frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/      # Core services (auth, storage, sync)
│   │   │   ├── features/  # Feature modules (auth, rocks, dashboard)
│   │   │   └── shared/    # Shared components
│   │   └── environments/  # Environment configs
│   └── public/            # Static assets, PWA manifest
│
├── shared/                # Shared TypeScript types
│   └── types/             # Common interfaces
│
├── .github/
│   └── workflows/         # CI/CD pipelines
│
├── CLAUDE.md              # Implementation guide
├── TESTING.md             # Testing documentation
└── README.md              # This file
```

## 🔧 Development

### Running Tests

**Backend:**
```bash
cd backend
npm test                    # Run all tests
npm test -- --coverage      # With coverage
npm test -- --watch         # Watch mode
```

**Frontend:**
```bash
cd frontend
npm test                              # Interactive mode
npm test -- --watch=false             # Single run
npm test -- --code-coverage           # With coverage
npm test -- --browsers=ChromeHeadless # Headless mode
```

See [TESTING.md](./TESTING.md) for detailed testing documentation.

### Building for Production

**Backend:**
```bash
cd backend
npm run build
npm run start:prod
```

**Frontend:**
```bash
cd frontend
npm run build
# Output in dist/frontend/browser/
```

### Code Quality

```bash
# Linting
npm run lint

# Format code
npm run format

# Type checking
npx tsc --noEmit
```

## 🎨 Features

### Dashboard
- **Statistics Cards**: Active rocks, gems, average progress, completion rate
- **Recent Activity**: 5 most recently updated rocks
- **Quick Actions**: Create rock, view all rocks

### Rocks Management
- **Create Rocks**: Set title and description
- **Track Progress**: Automatic calculation based on completed edges
- **Status Workflow**: Active → Gem → Archived
- **Filtering**: View by status (Active/Gems/Archived)

### Edges (Subtasks)
- **Add Edges**: Break down rocks into smaller tasks
- **Complete Edges**: Check off as you make progress
- **Auto-Progress**: Rock progress updates automatically

### Offline Functionality
- **Client-Side UUIDs**: Create rocks/edges offline
- **Sync Queue**: Operations queued for sync
- **Version Vectors**: Conflict resolution
- **IndexedDB Storage**: All data stored locally
- **Auto-Sync**: Syncs when online, every 5 minutes, or on demand

### PWA Features
- **Installable**: Add to home screen
- **Offline Mode**: Full functionality without internet
- **Push Notifications**: Ready for future implementation
- **Service Worker**: Smart caching for fast loading

## 🚢 Deployment

### GitHub Actions CI/CD

Three automated workflows:

1. **Backend CI** - Tests, builds, and archives backend
2. **Frontend CI** - Tests, builds, and reports bundle size
3. **Deploy** - Automated deployment to production

See [TESTING.md](./TESTING.md) for deployment instructions.

### Manual Deployment

**Backend (DigitalOcean):**
```bash
# SSH into droplet
ssh user@your-droplet-ip

# Clone/pull repository
git pull origin main

# Install dependencies
cd backend && npm ci --production

# Build
npm run build

# Restart PM2
pm2 restart mentalquest-backend
```

**Frontend (Static Hosting):**
```bash
# Build
cd frontend && npm run build

# Deploy to hosting
rsync -avz dist/frontend/browser/ user@host:/var/www/mentalquest-alchemy/
```

## 📊 Implementation Status

### Completed Phases

- ✅ Phase 1: Backend Authentication & User Management
- ✅ Phase 2: Frontend Authentication & State Setup
- ✅ Phase 3: Backend Rocks & Edges Module
- ✅ Phase 4: Frontend Rocks Module with NgRx
- ✅ Phase 5: Offline Storage with Dexie.js
- ✅ Phase 6: Dashboard & PWA Features
- ✅ Phase 7: Testing & CI/CD

### Test Coverage

- **Backend**: 35/35 tests passing
- **Frontend**: Tests configured, ready to run

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit your changes (`git commit -m 'feat: add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Commit Convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `test:` - Test changes
- `refactor:` - Code refactoring
- `style:` - Code style changes
- `chore:` - Build/config changes

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built following the implementation guide in [CLAUDE.md](./CLAUDE.md)
- Uses modern Angular patterns with zoneless change detection
- Inspired by productivity methodologies and gamification principles

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Made with ❤️ for productivity enthusiasts**
