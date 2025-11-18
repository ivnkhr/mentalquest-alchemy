# Productivity App - Claude Code Implementation Guide

## 🎯 Project Overview

**Project Name:** Productivity App (Stones to Gems)  
**Type:** Progressive Web App (PWA) with offline-first hybrid mobile support  
**Purpose:** Personal productivity suite where users transform "Rocks" (goals/projects) into "Gems" (completed achievements) through various productivity tools

**Tech Stack:**
- **Frontend:** Angular 20 + Ionic 8 + Capacitor + NgRx + Dexie.js
- **Backend:** NestJS + TypeORM + MySQL
- **Infrastructure:** Docker + GitHub Actions + DigitalOcean
- **Testing:** Jest (backend) + Jasmine/Karma (frontend)

## 🏗️ Architecture Principles

### Core Concepts
- **Offline-First:** All data stored locally in IndexedDB, synced to server when online
- **Client-Side UUIDs:** All entities use client-generated UUIDs for offline creation
- **Version Vectors:** Conflict resolution using version vectors (future-proof)
- **Soft Deletes:** All entities use `is_deleted` flag instead of hard deletion
- **Modular Design:** Each productivity tool is a separate Angular module

### Data Model
```
User
  └── Rocks (Goals/Projects)
       └── Edges (Subtasks)
```

**Rock Lifecycle:** `active` → `gem` (completed) → `collected` or `archived`  
**Edge Status:** `incomplete` → `complete` (becomes a "facet" when parent becomes gem)

## 📊 Database Schema

### Users Table
```sql
users (
  id: VARCHAR(36) PRIMARY KEY (UUID),
  email: VARCHAR(255) UNIQUE NOT NULL,
  password_hash: VARCHAR(255) NOT NULL,
  username: VARCHAR(50) UNIQUE NOT NULL,
  created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_sync_at: TIMESTAMP NULL
)
```

### Rocks Table
```sql
rocks (
  id: VARCHAR(36) PRIMARY KEY (UUID),
  user_id: VARCHAR(36) NOT NULL,
  title: VARCHAR(255) NOT NULL,
  description: TEXT NULL,
  status: ENUM('active', 'gem', 'archived') DEFAULT 'active',
  progress: DECIMAL(5,2) DEFAULT 0.00,
  version_vector: JSON NULL,
  created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  completed_at: TIMESTAMP NULL,
  archived_at: TIMESTAMP NULL,
  is_deleted: BOOLEAN DEFAULT FALSE,
  deleted_at: TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)
```

### Edges Table
```sql
edges (
  id: VARCHAR(36) PRIMARY KEY (UUID),
  rock_id: VARCHAR(36) NOT NULL,
  title: VARCHAR(255) NOT NULL,
  description: TEXT NULL,
  is_completed: BOOLEAN DEFAULT FALSE,
  order_index: INT DEFAULT 0,
  version_vector: JSON NULL,
  created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  completed_at: TIMESTAMP NULL,
  is_deleted: BOOLEAN DEFAULT FALSE,
  deleted_at: TIMESTAMP NULL,
  FOREIGN KEY (rock_id) REFERENCES rocks(id) ON DELETE CASCADE
)
```

### Sync Queue Table
```sql
sync_queue (
  id: INT AUTO_INCREMENT PRIMARY KEY,
  user_id: VARCHAR(36) NOT NULL,
  entity_type: ENUM('rock', 'edge') NOT NULL,
  entity_id: VARCHAR(36) NOT NULL,
  operation: ENUM('create', 'update', 'delete') NOT NULL,
  payload: JSON NOT NULL,
  client_timestamp: TIMESTAMP NOT NULL,
  synced: BOOLEAN DEFAULT FALSE,
  synced_at: TIMESTAMP NULL,
  created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/profile` - Get current user profile (protected)

### Rocks
- `GET /api/rocks` - List all rocks for current user
- `GET /api/rocks/:id` - Get single rock with edges
- `POST /api/rocks` - Create new rock
- `PATCH /api/rocks/:id` - Update rock
- `DELETE /api/rocks/:id` - Soft delete rock

### Edges
- `GET /api/rocks/:rockId/edges` - List edges for a rock
- `POST /api/rocks/:rockId/edges` - Create new edge
- `PATCH /api/edges/:id` - Update edge
- `DELETE /api/edges/:id` - Soft delete edge

### Sync
- `POST /api/sync` - Sync offline operations with server

## 📁 Project Structure
```
productivity-app/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.config.ts
│   │   │   └── jwt.config.ts
│   │   ├── common/
│   │   │   ├── decorators/
│   │   │   ├── filters/
│   │   │   ├── guards/
│   │   │   └── interceptors/
│   │   ├── auth/
│   │   │   ├── dto/
│   │   │   ├── strategies/
│   │   │   ├── guards/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.module.ts
│   │   ├── users/
│   │   │   ├── entities/
│   │   │   ├── users.service.ts
│   │   │   └── users.module.ts
│   │   ├── rocks/
│   │   │   ├── entities/
│   │   │   ├── dto/
│   │   │   ├── rocks.controller.ts
│   │   │   ├── rocks.service.ts
│   │   │   └── rocks.module.ts
│   │   ├── edges/
│   │   │   ├── entities/
│   │   │   ├── dto/
│   │   │   ├── edges.controller.ts
│   │   │   ├── edges.service.ts
│   │   │   └── edges.module.ts
│   │   ├── sync/
│   │   │   ├── entities/
│   │   │   ├── dto/
│   │   │   ├── sync.controller.ts
│   │   │   ├── sync.service.ts
│   │   │   └── sync.module.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── test/
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── guards/
│   │   │   │   │   ├── interceptors/
│   │   │   │   │   └── services/
│   │   │   │   ├── storage/
│   │   │   │   │   └── indexeddb.service.ts
│   │   │   │   ├── sync/
│   │   │   │   │   └── sync.service.ts
│   │   │   │   └── api/
│   │   │   │       └── api.service.ts
│   │   │   ├── shared/
│   │   │   │   ├── components/
│   │   │   │   ├── models/
│   │   │   │   └── pipes/
│   │   │   ├── features/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── pages/
│   │   │   │   │   │   ├── login/
│   │   │   │   │   │   └── register/
│   │   │   │   │   └── auth.routes.ts
│   │   │   │   ├── rocks/
│   │   │   │   │   ├── pages/
│   │   │   │   │   │   ├── rock-list/
│   │   │   │   │   │   ├── rock-detail/
│   │   │   │   │   │   └── rock-form/
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── rock-card/
│   │   │   │   │   │   └── edge-item/
│   │   │   │   │   ├── store/
│   │   │   │   │   │   ├── actions/
│   │   │   │   │   │   ├── reducers/
│   │   │   │   │   │   ├── effects/
│   │   │   │   │   │   └── selectors/
│   │   │   │   │   └── rocks.routes.ts
│   │   │   │   └── dashboard/
│   │   │   │       └── dashboard.routes.ts
│   │   │   ├── app.routes.ts
│   │   │   └── app.component.ts
│   │   ├── environments/
│   │   └── assets/
│   └── package.json
│
├── shared/
│   └── types/
│       ├── user.interface.ts
│       ├── rock.interface.ts
│       └── edge.interface.ts
│
├── docker-compose.yml
├── .gitignore
├── CLAUDE.md
└── README.md
```

## 🚀 Implementation Phases

### PHASE 1: Backend Authentication & User Management
**Priority:** CRITICAL - Foundation for everything  
**Estimated Time:** 2-3 hours

#### Step 1.1: Environment & Configuration Setup
1. Create `backend/src/config/database.config.ts`
   - Configure TypeORM with MySQL connection
   - Enable synchronize only for development
   - Set up entity auto-discovery
   - Configure migrations path

2. Create `backend/src/config/jwt.config.ts`
   - Configure JWT secret from environment
   - Set token expiration (7 days)

3. Update `backend/src/app.module.ts`
   - Import ConfigModule with .env file
   - Import TypeOrmModule with database config
   - Enable global validation pipes
   - Set up CORS for frontend origin

#### Step 1.2: User Entity & Service
1. Create `backend/src/users/entities/user.entity.ts`
   - Define User entity with all fields from schema
   - Add @BeforeInsert hook to generate UUID
   - Use @Exclude() decorator on password_hash
   - Add proper indexes

2. Create `backend/src/users/users.service.ts`
   - `create()` - Hash password with bcrypt (salt rounds: 10)
   - `findByEmail()` - Find user by email
   - `findById()` - Find user by ID
   - `validatePassword()` - Compare password with hash
   - `updateLastSync()` - Update last_sync_at timestamp
   - Handle ConflictException for duplicate users
   - Handle NotFoundException for missing users

3. Create `backend/src/users/users.module.ts`
   - Import TypeOrmModule.forFeature([User])
   - Export UsersService for use in AuthModule

#### Step 1.3: Authentication DTOs
1. Create `backend/src/auth/dto/register.dto.ts`
   - email: @IsEmail()
   - password: @MinLength(8), @Matches() for complexity
   - username: @MinLength(3), @MaxLength(50), @Matches() for alphanumeric

2. Create `backend/src/auth/dto/login.dto.ts`
   - email: @IsEmail()
   - password: @IsString()

#### Step 1.4: JWT Strategy & Guards
1. Create `backend/src/auth/strategies/jwt.strategy.ts`
   - Extend PassportStrategy(Strategy)
   - Extract JWT from Bearer token
   - Validate payload and return user
   - Define JwtPayload interface (sub, email, username)

2. Create `backend/src/auth/guards/jwt-auth.guard.ts`
   - Extend AuthGuard('jwt')
   - Will be used to protect endpoints

#### Step 1.5: Auth Service & Controller
1. Create `backend/src/auth/auth.service.ts`
   - `register()` - Create user and return JWT + user data
   - `login()` - Validate credentials and return JWT + user data
   - `getProfile()` - Return user profile without password
   - Use UsersService for all user operations
   - Use JwtService to sign tokens

2. Create `backend/src/auth/auth.controller.ts`
   - POST /auth/register - Public endpoint
   - POST /auth/login - Public endpoint
   - GET /auth/profile - Protected with @UseGuards(JwtAuthGuard)
   - Use @Body() for DTOs
   - Use @Request() to access user from JWT

3. Create `backend/src/auth/auth.module.ts`
   - Import UsersModule
   - Import PassportModule
   - Import JwtModule with config
   - Register JwtStrategy as provider
   - Export AuthService

#### Step 1.6: Testing
1. Create `backend/src/auth/auth.service.spec.ts`
   - Test register with valid data
   - Test register with duplicate email
   - Test login with valid credentials
   - Test login with invalid credentials
   - Mock UsersService and JwtService

2. Create `backend/src/users/users.service.spec.ts`
   - Test create user
   - Test find by email
   - Test password validation
   - Mock Repository

3. Run tests: `npm test`

---

### PHASE 2: Frontend Authentication & State Setup
**Priority:** CRITICAL - User flow foundation  
**Estimated Time:** 3-4 hours

#### Step 2.1: Shared Interfaces
1. Create `shared/types/user.interface.ts`
```typescript
   export interface User {
     id: string;
     email: string;
     username: string;
     created_at: Date;
   }

   export interface AuthResponse {
     access_token: string;
     user: User;
   }
```

2. Create `shared/types/rock.interface.ts`
```typescript
   export enum RockStatus {
     ACTIVE = 'active',
     GEM = 'gem',
     ARCHIVED = 'archived'
   }

   export interface Rock {
     id: string;
     user_id: string;
     title: string;
     description?: string;
     status: RockStatus;
     progress: number;
     version_vector?: Record<string, number>;
     created_at: Date;
     updated_at: Date;
     completed_at?: Date;
     archived_at?: Date;
     is_deleted: boolean;
   }
```

3. Create `shared/types/edge.interface.ts`
```typescript
   export interface Edge {
     id: string;
     rock_id: string;
     title: string;
     description?: string;
     is_completed: boolean;
     order_index: number;
     version_vector?: Record<string, number>;
     created_at: Date;
     updated_at: Date;
     completed_at?: Date;
     is_deleted: boolean;
   }
```

#### Step 2.2: Core Services Setup
1. Create `frontend/src/app/core/api/api.service.ts`
   - Base HTTP service with environment.apiUrl
   - Generic methods: get(), post(), patch(), delete()
   - Return observables

2. Create `frontend/src/app/core/auth/services/auth.service.ts`
   - `register()` - Call API, store token in localStorage
   - `login()` - Call API, store token in localStorage
   - `logout()` - Clear token and redirect
   - `getToken()` - Retrieve token from localStorage
   - `isAuthenticated()` - Check if token exists
   - `getProfile()` - Fetch user profile from API

3. Create `frontend/src/app/core/auth/interceptors/auth.interceptor.ts`
   - Add Authorization header to all requests
   - Intercept 401 responses and redirect to login

4. Create `frontend/src/app/core/auth/guards/auth.guard.ts`
   - Check if user is authenticated
   - Redirect to /auth/login if not

#### Step 2.3: NgRx Auth Store
1. Create `frontend/src/app/core/auth/store/auth.state.ts`
```typescript
   export interface AuthState {
     user: User | null;
     token: string | null;
     loading: boolean;
     error: string | null;
   }
```

2. Create `frontend/src/app/core/auth/store/auth.actions.ts`
   - `login` / `loginSuccess` / `loginFailure`
   - `register` / `registerSuccess` / `registerFailure`
   - `logout`
   - `loadProfile` / `loadProfileSuccess` / `loadProfileFailure`

3. Create `frontend/src/app/core/auth/store/auth.reducer.ts`
   - Handle all auth actions
   - Update state immutably

4. Create `frontend/src/app/core/auth/store/auth.effects.ts`
   - `login$` - Call AuthService, dispatch success/failure
   - `register$` - Call AuthService, dispatch success/failure
   - `logout$` - Clear storage, navigate to login
   - `loadProfile$` - Fetch profile on app init

5. Create `frontend/src/app/core/auth/store/auth.selectors.ts`
   - `selectAuthState`
   - `selectUser`
   - `selectIsAuthenticated`
   - `selectLoading`
   - `selectError`

6. Register AuthState in `frontend/src/app/app.config.ts`
   - provideStore with auth reducer
   - provideEffects with auth effects
   - provideStoreDevtools for debugging

#### Step 2.4: Auth Pages
1. Create `frontend/src/app/features/auth/pages/login/login.component.ts`
   - Ionic form with email and password fields
   - Dispatch login action on submit
   - Show loading spinner during authentication
   - Navigate to /rocks on success
   - Display error messages

2. Create `frontend/src/app/features/auth/pages/register/register.component.ts`
   - Ionic form with email, username, password fields
   - Client-side validation matching backend DTOs
   - Dispatch register action on submit
   - Navigate to /rocks on success

3. Create `frontend/src/app/features/auth/auth.routes.ts`
```typescript
   export const authRoutes: Routes = [
     { path: 'login', component: LoginComponent },
     { path: 'register', component: RegisterComponent },
     { path: '', redirectTo: 'login', pathMatch: 'full' }
   ];
```

4. Update `frontend/src/app/app.routes.ts`
```typescript
   export const routes: Routes = [
     { path: '', redirectTo: '/rocks', pathMatch: 'full' },
     { path: 'auth', loadChildren: () => import('./features/auth/auth.routes') },
     { 
       path: 'rocks', 
       loadChildren: () => import('./features/rocks/rocks.routes'),
       canActivate: [AuthGuard]
     },
   ];
```

#### Step 2.5: Testing
1. Test login flow manually
2. Test registration flow manually
3. Test auth guard (try accessing /rocks without login)
4. Test token persistence (refresh page)
5. Verify JWT in localStorage
6. Check Network tab for API calls

---

### PHASE 3: Backend Rocks & Edges Module
**Priority:** HIGH - Core functionality  
**Estimated Time:** 3-4 hours

#### Step 3.1: Rock Entity & DTOs
1. Create `backend/src/rocks/entities/rock.entity.ts`
   - All fields from schema
   - ManyToOne relationship with User
   - OneToMany relationship with Edges
   - @BeforeInsert for UUID generation
   - Indexes on user_id, status, updated_at

2. Create `backend/src/rocks/dto/create-rock.dto.ts`
   - title: @IsString(), @MinLength(1), @MaxLength(255)
   - description: @IsOptional(), @IsString()

3. Create `backend/src/rocks/dto/update-rock.dto.ts`
   - Extend PartialType(CreateRockDto)
   - Add optional status: @IsEnum(RockStatus)
   - Add optional progress: @IsNumber(), @Min(0), @Max(100)

#### Step 3.2: Rock Service
1. Create `backend/src/rocks/rocks.service.ts`
   - `create(userId, createRockDto)` - Create new rock
   - `findAll(userId, status?)` - Get all rocks for user, optionally filtered
   - `findOne(id, userId)` - Get single rock with ownership check
   - `update(id, userId, updateRockDto)` - Update rock with ownership check
   - `remove(id, userId)` - Soft delete (set is_deleted = true)
   - `calculateProgress(rockId)` - Calculate progress based on completed edges
   - Throw ForbiddenException if user doesn't own rock
   - Throw NotFoundException if rock not found

#### Step 3.3: Rock Controller
1. Create `backend/src/rocks/rocks.controller.ts`
   - All endpoints protected with @UseGuards(JwtAuthGuard)
   - GET /rocks?status=active
   - GET /rocks/:id
   - POST /rocks
   - PATCH /rocks/:id
   - DELETE /rocks/:id
   - Extract userId from @Request().user.id

#### Step 3.4: Edge Entity & DTOs
1. Create `backend/src/edges/entities/edge.entity.ts`
   - All fields from schema
   - ManyToOne relationship with Rock
   - @BeforeInsert for UUID generation
   - Indexes on rock_id, updated_at

2. Create `backend/src/edges/dto/create-edge.dto.ts`
   - title: @IsString(), @MinLength(1), @MaxLength(255)
   - description: @IsOptional(), @IsString()
   - order_index: @IsOptional(), @IsNumber()

3. Create `backend/src/edges/dto/update-edge.dto.ts`
   - Extend PartialType(CreateEdgeDto)
   - Add is_completed: @IsOptional(), @IsBoolean()

#### Step 3.5: Edge Service
1. Create `backend/src/edges/edges.service.ts`
   - `create(rockId, userId, createEdgeDto)` - Create edge with ownership check
   - `findByRock(rockId, userId)` - Get all edges for a rock
   - `findOne(id, userId)` - Get single edge with ownership check
   - `update(id, userId, updateEdgeDto)` - Update edge
   - `remove(id, userId)` - Soft delete
   - After edge update, trigger rock progress recalculation
   - Verify rock ownership before creating/updating edges

#### Step 3.6: Edge Controller
1. Create `backend/src/edges/edges.controller.ts`
   - All endpoints protected with @UseGuards(JwtAuthGuard)
   - GET /rocks/:rockId/edges
   - POST /rocks/:rockId/edges
   - PATCH /edges/:id
   - DELETE /edges/:id

#### Step 3.7: Module Registration
1. Create `backend/src/rocks/rocks.module.ts`
   - Import TypeOrmModule.forFeature([Rock])
   - Import EdgesModule (for calculating progress)

2. Create `backend/src/edges/edges.module.ts`
   - Import TypeOrmModule.forFeature([Edge])
   - Export EdgesService

3. Update `backend/src/app.module.ts`
   - Import RocksModule
   - Import EdgesModule

#### Step 3.8: Testing
1. Create `backend/src/rocks/rocks.service.spec.ts`
   - Test CRUD operations
   - Test ownership validation
   - Mock Repository

2. Create `backend/src/edges/edges.service.spec.ts`
   - Test CRUD operations
   - Test ownership validation through rock

3. Test endpoints with Thunder Client or Postman
   - Create rock
   - Add edges
   - Update edge completion
   - Verify progress calculation
   - Test unauthorized access

---

### PHASE 4: Frontend Rocks Module with NgRx
**Priority:** HIGH - Core UI  
**Estimated Time:** 4-5 hours

#### Step 4.1: Rocks NgRx Store Setup
1. Create `frontend/src/app/features/rocks/store/rocks.state.ts`
```typescript
   export interface RocksState {
     rocks: Rock[];
     selectedRock: Rock | null;
     edges: Edge[];
     loading: boolean;
     error: string | null;
   }
```

2. Create `frontend/src/app/features/rocks/store/rocks.actions.ts`
   - `loadRocks` / `loadRocksSuccess` / `loadRocksFailure`
   - `loadRockDetail` / `loadRockDetailSuccess` / `loadRockDetailFailure`
   - `createRock` / `createRockSuccess` / `createRockFailure`
   - `updateRock` / `updateRockSuccess` / `updateRockFailure`
   - `deleteRock` / `deleteRockSuccess` / `deleteRockFailure`
   - `createEdge` / `createEdgeSuccess` / `createEdgeFailure`
   - `updateEdge` / `updateEdgeSuccess` / `updateEdgeFailure`
   - `deleteEdge` / `deleteEdgeSuccess` / `deleteEdgeFailure`

3. Create `frontend/src/app/features/rocks/store/rocks.reducer.ts`
   - Use createReducer with on() for each action
   - Update state immutably using spread operator

4. Create `frontend/src/app/features/rocks/store/rocks.effects.ts`
   - Inject RocksService (to be created)
   - Handle all async operations
   - Dispatch success/failure actions
   - Navigate after create/update/delete

5. Create `frontend/src/app/features/rocks/store/rocks.selectors.ts`
   - `selectRocksState`
   - `selectAllRocks`
   - `selectActiveRocks`
   - `selectGems`
   - `selectArchivedRocks`
   - `selectSelectedRock`
   - `selectEdges`
   - `selectLoading`

#### Step 4.2: Rocks Service
1. Create `frontend/src/app/features/rocks/services/rocks.service.ts`
   - `getRocks(status?)` - GET /rocks
   - `getRock(id)` - GET /rocks/:id
   - `createRock(data)` - POST /rocks
   - `updateRock(id, data)` - PATCH /rocks/:id
   - `deleteRock(id)` - DELETE /rocks/:id
   - `getEdges(rockId)` - GET /rocks/:rockId/edges
   - `createEdge(rockId, data)` - POST /rocks/:rockId/edges
   - `updateEdge(id, data)` - PATCH /edges/:id
   - `deleteEdge(id)` - DELETE /edges/:id

#### Step 4.3: Rock List Page
1. Create `frontend/src/app/features/rocks/pages/rock-list/rock-list.component.ts`
   - Use Ionic segment for tabs: Active | Gems | Archived
   - Dispatch loadRocks on init
   - Select rocks from store using selectors
   - Show loading spinner
   - Display rocks in ion-card components
   - Add FAB button to create new rock
   - Click rock card to navigate to detail

2. Create `frontend/src/app/features/rocks/pages/rock-list/rock-list.component.html`
   - ion-header with title "My Rocks"
   - ion-segment for status filter
   - ion-list with rock-card components
   - ion-fab for add button
   - Loading skeleton when loading

#### Step 4.4: Rock Card Component
1. Create `frontend/src/app/features/rocks/components/rock-card/rock-card.component.ts`
   - @Input() rock: Rock
   - Display title, description, progress
   - Show status badge
   - Emit click event

2. Style with Ionic colors based on status
   - active: primary
   - gem: success
   - archived: medium

#### Step 4.5: Rock Detail Page
1. Create `frontend/src/app/features/rocks/pages/rock-detail/rock-detail.component.ts`
   - Get rockId from route params
   - Dispatch loadRockDetail on init
   - Select rock and edges from store
   - Display rock info
   - List all edges
   - Add button to create new edge
   - Mark edge as complete (dispatch updateEdge)
   - Edit/delete rock options

2. Create `frontend/src/app/features/rocks/pages/rock-detail/rock-detail.component.html`
   - ion-header with back button and title
   - Rock details section
   - Progress bar showing completion
   - Edges list with checkboxes
   - FAB to add edge
   - Action buttons (edit, archive, delete)

#### Step 4.6: Rock Form Page
1. Create `frontend/src/app/features/rocks/pages/rock-form/rock-form.component.ts`
   - Reactive form with title and description
   - Mode: create or edit (based on route params)
   - Dispatch createRock or updateRock
   - Navigate back on success

2. Create `frontend/src/app/features/rocks/pages/rock-form/rock-form.component.html`
   - ion-header with cancel and save buttons
   - ion-item for title input
   - ion-textarea for description
   - Form validation messages

#### Step 4.7: Edge Components
1. Create `frontend/src/app/features/rocks/components/edge-item/edge-item.component.ts`
   - @Input() edge: Edge
   - @Output() toggle: EventEmitter
   - @Output() delete: EventEmitter
   - Display checkbox and title
   - Strikethrough when completed

2. Create `frontend/src/app/features/rocks/components/edge-form/edge-form.component.ts`
   - Modal component for adding/editing edges
   - Reactive form with title and description
   - Emit save event

#### Step 4.8: Routes Configuration
1. Create `frontend/src/app/features/rocks/rocks.routes.ts`
```typescript
   export const rocksRoutes: Routes = [
     { path: '', component: RockListComponent },
     { path: 'new', component: RockFormComponent },
     { path: ':id', component: RockDetailComponent },
     { path: ':id/edit', component: RockFormComponent }
   ];
```

#### Step 4.9: Testing
1. Test rock list with different statuses
2. Test creating new rock
3. Test rock detail view
4. Test adding edges
5. Test completing edges
6. Test progress calculation
7. Test archiving rock
8. Test deleting rock

---

### PHASE 5: Offline Storage with Dexie.js
**Priority:** HIGH - Offline-first requirement  
**Estimated Time:** 4-5 hours

#### Step 5.1: Dexie Database Setup
1. Create `frontend/src/app/core/storage/db.ts`
```typescript
   import Dexie, { Table } from 'dexie';
   import { Rock, Edge, User } from 'shared/types';

   export interface SyncQueueItem {
     id?: number;
     entity_type: 'rock' | 'edge';
     entity_id: string;
     operation: 'create' | 'update' | 'delete';
     payload: any;
     client_timestamp: Date;
     synced: boolean;
   }

   export class ProductivityDatabase extends Dexie {
     rocks!: Table<Rock, string>;
     edges!: Table<Edge, string>;
     syncQueue!: Table<SyncQueueItem, number>;
     user!: Table<User, string>;

     constructor() {
       super('ProductivityApp');
       
       this.version(1).stores({
         rocks: 'id, user_id, status, updated_at',
         edges: 'id, rock_id, updated_at',
         syncQueue: '++id, synced, entity_type, created_at',
         user: 'id'
       });
     }
   }

   export const db = new ProductivityDatabase();
```

2. Create `frontend/src/app/core/storage/indexeddb.service.ts`
   - Injectable service wrapping Dexie operations
   - CRUD methods for rocks
   - CRUD methods for edges
   - Methods to add to sync queue
   - Method to get unsyncedoperations
   - Method to mark operations as synced

#### Step 5.2: Client ID Generation
1. Create `frontend/src/app/core/storage/client-id.service.ts`
   - Generate UUID on first app launch
   - Store in Capacitor Storage (persists across sessions)
   - Use for version vectors

#### Step 5.3: Offline-First Rock Service
1. Update `frontend/src/app/features/rocks/services/rocks.service.ts`
   - All write operations save to IndexedDB first
   - Add to sync queue
   - Attempt API call if online
   - On success, mark as synced
   - On failure, keep in sync queue

2. Add online/offline detection
   - Listen to window.online/offline events
   - Update store with connectivity status

#### Step 5.4: Sync Service
1. Create `frontend/src/app/core/sync/sync.service.ts`
   - `syncNow()` - Process sync queue
   - Get all unsynced operations
   - Batch send to POST /api/sync
   - Handle conflicts using version vectors
   - Mark successful operations as synced
   - Update local data with server response

2. Create `frontend/src/app/core/sync/sync.effects.ts`
   - Listen for online event
   - Automatically trigger sync
   - Sync on app foreground
   - Periodic sync every 5 minutes when online

#### Step 5.5: Version Vector Implementation
1. Create `frontend/src/app/core/sync/version-vector.service.ts`
   - `increment(clientId, vector)` - Increment client's version
   - `compare(v1, v2)` - Compare two vectors
   - `merge(v1, v2)` - Merge vectors (take max for each client)
   - `canApply(local, server)` - Check if server version is newer

2. Update all entity updates to include version vector
   - Attach current client_id and incremented version
   - Server compares vectors
   - Apply last-write-wins if concurrent

#### Step 5.6: Background Sync (Service Worker)
1. Update `frontend/src/ngsw-config.json`
   - Add data groups for API caching
   - Configure freshness strategy

2. Create custom service worker for background sync
   - Register sync event
   - Replay sync queue when connectivity restored

#### Step 5.7: Testing
1. Test offline creation of rocks
2. Test offline creation of edges
3. Go offline, create multiple items
4. Go online, verify sync
5. Test conflict resolution
6. Test version vector merging
7. Check IndexedDB in DevTools

---

### PHASE 6: Dashboard & PWA Features
**Priority:** MEDIUM - User experience  
**Estimated Time:** 3-4 hours

#### Step 6.1: Dashboard Page
1. Create `frontend/src/app/features/dashboard/pages/dashboard.component.ts`
   - Display active rocks count
   - Display gems count
   - Show recent activity
   - Display progress charts
   - Quick actions (add rock, add edge)

2. Use Chart.js or similar for visualizations
   - Progress over time
   - Completion rate
   - Active vs completed

#### Step 6.2: PWA Manifest Configuration
1. Update `frontend/src/manifest.webmanifest`
   - App name, description
   - Icons (multiple sizes)
   - Theme colors
   - Display mode: standalone
   - Start URL

2. Create app icons (512x512, 192x192, etc.)

#### Step 6.3: Service Worker Optimization
1. Configure caching strategies in `ngsw-config.json`
   - App shell: cache-first
   - API: network-first with cache fallback
   - Assets: cache-first

2. Add notification support
   - Request permission
   - Show notification on sync complete
   - Show notification for reminders (future)

#### Step 6.4: Capacitor Native Features
1. Configure `capacitor.config.ts`
   - App ID
   - App name
   - Web dir

2. Add status bar plugin
   - Style based on theme

3. Add splash screen
   - Custom logo and background

#### Step 6.5: Testing
1. Test PWA installation on mobile
2. Test offline functionality
3. Test push notifications
4. Build Android APK and test
5. Verify service worker caching

---

### PHASE 7: Testing & CI/CD
**Priority:** HIGH - Production readiness  
**Estimated Time:** 3-4 hours

#### Step 7.1: Backend Unit Tests
1. Write tests for all services
   - AuthService
   - UsersService
   - RocksService
   - EdgesService
   - SyncService

2. Write tests for controllers
   - Test request/response
   - Mock services

3. Achieve >80% code coverage
   - Run: `npm test -- --coverage`

#### Step 7.2: Frontend Unit Tests
1. Write tests for effects
   - Mock HTTP responses
   - Test success/failure paths

2. Write tests for reducers
   - Test state transitions

3. Write tests for components
   - Test user interactions
   - Mock store selectors

#### Step 7.3: E2E Tests
1. Create basic E2E flow tests
   - Register → Login → Create Rock → Add Edge → Complete Edge

#### Step 7.4: GitHub Actions CI/CD
1. Create `.github/workflows/backend-ci.yml`
```yaml
   name: Backend CI
   on: [push, pull_request]
   jobs:
     test:
       runs-on: ubuntu-latest
       services:
         mysql:
           image: mysql:8.0
           env:
             MYSQL_ROOT_PASSWORD: test
             MYSQL_DATABASE: test_db
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
         - run: cd backend && npm install
         - run: cd backend && npm test
         - run: cd backend && npm run build
```

2. Create `.github/workflows/frontend-ci.yml`
```yaml
   name: Frontend CI
   on: [push, pull_request]
   jobs:
     test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
         - run: cd frontend && npm install
         - run: cd frontend && npm test -- --watch=false
         - run: cd frontend && npm run build
```

3. Create `.github/workflows/deploy.yml`
   - Trigger on push to main
   - Build backend and frontend
   - Deploy to DigitalOcean
   - Use SSH to deploy backend
   - Deploy frontend to static hosting or same server

#### Step 7.5: DigitalOcean Deployment
1. Set up MySQL on DO droplet
2. Configure Nginx as reverse proxy
3. Set up SSL with Let's Encrypt
4. Configure PM2 for NestJS
5. Deploy frontend build to /var/www
6. Set up environment variables

---

## 🎯 Implementation Priority Order

For Claude Code sessions, implement in this order:

**Session 1:** Backend Auth (Phase 1)  
**Session 2:** Frontend Auth (Phase 2)  
**Session 3:** Backend Rocks/Edges (Phase 3)  
**Session 4:** Frontend Rocks Module (Phase 4)  
**Session 5:** Offline Storage (Phase 5)  
**Session 6:** Dashboard & PWA (Phase 6)  
**Session 7:** Testing & Deployment (Phase 7)

## 🧪 Testing Strategy

### Unit Tests (Jest/Jasmine)
- **Backend:** Test all services and controllers
- **Frontend:** Test effects, reducers, selectors
- **Target:** 80%+ code coverage

### Integration Tests
- Test API endpoints with real database (test DB)
- Test NgRx store integration

### E2E Tests
- Critical user flows only
- Registration → Rock creation → Edge completion

### Manual Testing Checklist
- [ ] Registration flow
- [ ] Login flow
- [ ] Create rock
- [ ] Add edges
- [ ] Complete edge
- [ ] Archive rock
- [ ] Offline creation
- [ ] Sync after going online
- [ ] PWA installation
- [ ] Mobile responsiveness

## 📖 Development Guidelines

### Code Style
- **TypeScript:** Strict mode enabled
- **Linting:** ESLint for backend and frontend
- **Formatting:** Prettier with 2-space indentation
- **Naming:** 
  - Components: PascalCase (RockListComponent)
  - Services: PascalCase with Service suffix
  - Files: kebab-case (rock-list.component.ts)

### Git Workflow
- **Branches:** feature/[feature-name], fix/[bug-name]
- **Commits:** Conventional commits (feat:, fix:, docs:, test:)
- **PRs:** Required for main branch

### Documentation
- JSDoc for all public methods
- README in each module explaining purpose
- API documentation with examples

## 🔒 Security Considerations

1. **Passwords:** bcrypt with 10 salt rounds
2. **JWT:** Store in httpOnly cookie (future) or secure localStorage
3. **CORS:** Configure allowed origins
4. **Input Validation:** DTOs with class-validator
5. **SQL Injection:** TypeORM prevents with parameterized queries
6. **XSS:** Angular sanitizes by default
7. **Rate Limiting:** Add to API endpoints (future)

## 🚀 Performance Optimization

1. **Lazy Loading:** All feature modules
2. **OnPush Change Detection:** For list components
3. **Virtual Scrolling:** For large lists
4. **Memoized Selectors:** NgRx selectors
5. **Image Optimization:** Compress and lazy load
6. **Bundle Size:** Code splitting, tree shaking
7. **Database Indexes:** On frequently queried fields

## 📚 Learning Resources

- **NgRx:** https://ngrx.io/docs
- **NestJS:** https://docs.nestjs.com
- **Dexie:** https://dexie.org
- **TypeORM:** https://typeorm.io
- **Ionic:** https://ionicframework.com/docs
- **Jest Testing:** https://jestjs.io
- **Version Vectors:** https://en.wikipedia.org/wiki/Version_vector

## 🎥 YouTube Content Ideas

- "Day 1: Building My Comeback App"
- "Setting Up Angular 20 + NestJS Monorepo"
- "Implementing Offline-First with Dexie.js"
- "NgRx Complete Guide for Beginners"
- "Building a PWA That Works Offline"
- "My First Job Application Using This App"
- "One Week of Tracking My Productivity"

## 🎯 Success Metrics

- [ ] Authentication working
- [ ] CRUD operations for rocks
- [ ] CRUD operations for edges
- [ ] Offline creation and sync
- [ ] PWA installable on mobile
- [ ] 80%+ test coverage
- [ ] Deployed to production
- [ ] First YouTube video published

---

## 🤝 How to Use This Guide with Claude Code

1. **Start each coding session by referencing this file**
2. **Work through phases sequentially**
3. **Test each phase before moving to next**
4. **Commit after completing each major step**
5. **Update this file if you deviate from the plan**

This is a living document. Update as you learn and adapt the architecture!