# Feature Suggestion Platform

A monorepo platform where users can publish feature proposals, upvote them, and browse a paginated listing.

**[Live App](https://feature.rochatecnologia.com.br)** | **[API Docs (Swagger)](https://feature.rochatecnologia.com.br/api/docs)**

## Architecture

- **Backend**: NestJS with Clean Architecture (Domain, Application, Infrastructure, Presentation layers)
- **Android**: Native Kotlin with Jetpack Compose, Material3, Hilt DI
- **Database**: PostgreSQL with TypeORM (snake_case naming strategy)
- **Cache**: Redis (required for listing endpoint)
- **Observability**: OpenTelemetry + Winston
- **API Docs**: Swagger (auto-generated at `/api/docs`)

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 23+
- Android Studio (for Android development)
- Java 17+

### Running the Backend

```bash
# Start all services (PostgreSQL, Redis, Backend)
docker compose up

# Or run locally for development
cd backend
npm install
npm run start:dev
```

The API will be available at `http://localhost:3000`.
Swagger docs at `http://localhost:3000/api/docs`.

### API Endpoints

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| GET | `/api/features?page=1&limit=10` | - | List feature proposals (paginated, cached) |
| POST | `/api/features` | `{ text, authorEmail }` | Create a new feature proposal |
| POST | `/api/features/:id/upvote` | `{ email }` | Upvote a feature proposal |

### Running Backend Tests

```bash
cd backend
npm test          # Unit tests
npm run test:e2e  # E2E tests
```

### Building the Android App

```bash
cd android
./gradlew assembleDebug        # Build APK
./gradlew testDebugUnitTest    # Run unit tests
```

The Android app connects to `http://10.0.2.2:3000` (emulator localhost).

### Running Chaos Tests

```bash
cd chaos-test
pip install -r requirements.txt
python chaos_test.py --base-url http://localhost:3000/api --concurrency 50
```

## Project Structure

```
metacto-homework/
├── .github/workflows/     # CI/CD pipelines
├── backend/               # NestJS backend
│   ├── src/
│   │   ├── domain/        # Entities & repository interfaces
│   │   ├── application/   # Use cases & DTOs
│   │   ├── infrastructure/# TypeORM, Redis, OTel
│   │   └── presentation/  # Controllers, pipes, filters
│   └── test/              # Unit & E2E tests
├── android/               # Native Android app
│   └── app/src/main/java/com/metacto/featuresuggestion/
│       ├── data/          # API service, DTOs, repository impl
│       ├── domain/        # Models, repository interface, use cases
│       └── presentation/  # Screens, ViewModels, components
├── chaos-test/            # Python chaos testing scripts
├── docker-compose.yml
└── README.md
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| DB_HOST | localhost | PostgreSQL host |
| DB_PORT | 5432 | PostgreSQL port |
| DB_NAME | features | Database name |
| DB_USER | app | Database user |
| DB_PASSWORD | app123 | Database password |
| REDIS_HOST | localhost | Redis host |
| REDIS_PORT | 6379 | Redis port |
| PORT | 3000 | Backend server port |
| LOG_LEVEL | info | Winston log level |
