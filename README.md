<p align="center">
  <a href="https://nestjs.com/" target="_blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="NestJS Logo" /></a>
</p>

<h1 align="center">Social Network App</h1>

<p align="center">
  A modern, scalable social media platform built with <strong>NestJS</strong>, <strong>TypeScript</strong> and <strong>hexagonal architecture</strong>.
  <br />
  Portfolio project demonstrating enterprise-grade architecture patterns and best practices.
</p>

---

## 📋 Table of Contents

- [About the Project](#about-the-project)
- [Architecture & Patterns](#architecture--patterns)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [API Documentation](#api-documentation)
- [License](#license)

---

## About the Project

**Social Network App** is a comprehensive portfolio project that demonstrates the implementation of a full-featured social media platform using modern backend technologies and architectural patterns.

This project showcases:

- **Production-ready code** with enterprise architectural patterns
- **RESTful API** design with best practices
- **Authentication & Authorization** with OAuth2.0 and JWT
- **Real-time features** using Socket.io
- **Comprehensive testing** with Jest and Supertest
- **Database design** with TypeORM and MySQL
- **Containerization** with Docker

---

## Architecture & Patterns

This project is built following **Domain-Driven Design (DDD)** principles combined with **Hexagonal Architecture** (ports and adapters pattern), ensuring clean code separation and maintainability.

### Architectural Layers

```text
┌─────────────────────────────────────┐
│    Infrastructure Layer             │
│  (Controllers, DTOs, Guards)        │
├─────────────────────────────────────┤
│    Application Layer                │
│  (Use Cases, Services)              │
├─────────────────────────────────────┤
│    Domain Layer                     │
│  (Entities, Value Objects, Errors)  │
└─────────────────────────────────────┘
```

### Core Patterns Implemented

- **Value Objects**: Strong typing and business logic encapsulation
- **Domain Entities**: Rich objects with behavior
- **Use Cases**: Isolated business logic
- **Repositories**: Data access abstraction
- **Services**: Cross-cutting concerns
- **DTOs**: Request/Response validation and transformation
- **Error Handling**: Custom domain errors and mappers

---

## Tech Stack

### Core Framework

- **NestJS** - Progressive Node.js framework
- **TypeScript** - Static typing for robust code

### API & Architecture

- **RESTful API** - Standard HTTP endpoints
- **Socket.io** - Real-time bidirectional communication
- **OAuth2.0** - Third-party authentication (Google)

### Database & ORM

- **TypeORM** - Object-Relational Mapping
- **MySQL** - Relational database
- **Database Migrations** - Version control for schema changes

### Testing & Quality

- **ESLint** - Code linting
- **Jest** - Test framework
- **Supertest** - HTTP assertion library
- **Test Coverage** - Comprehensive unit and E2E tests

### DevOps & Deployment

- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

---

## Features

### Authentication & Authorization

- ✅ Local authentication (username/password)
- ✅ OAuth2.0 integration (Google)
- ✅ JWT-based token authentication
- ✅ Refresh token rotation
- ✅ Session management with version control
- ✅ Reuse detection for enhanced security
- ✅ Multi-session support per user

### User Management

- ✅ User registration and profile management
- ✅ Role-based access control (RBAC)
- ✅ User agents and IP address tracking
- ✅ Session revocation capabilities

### Real-time Capabilities

- ✅ Email verification with Nodemailer
- ✅ Different types of chats with Socket.io
- ✅ Real-time notifications infrastructure

### Social Features

- ✅ Follows and blocks
- ✅ Posts, comments and likes
- ✅ Chats of type individual, group and broadcast channels

---

## Project Structure

```text
src/
├── app.module.ts                    # Main application module
├── main.ts                          # Application entry point
├── modules/
│   ├── auth/                        # Authentication module
│   │   ├── application/             # Application layer
│   │   │   ├── services/            # Business services
│   │   │   └── use-cases/           # Isolated use cases
│   │   ├── domain/                  # Domain layer
│   │   │   ├── entities/            # Domain entities
│   │   │   ├── enums/               # Enumerations
│   │   │   ├── errors/              # Custom errors
│   │   │   ├── repositories/        # Repository contracts
│   │   │   ├── services/            # Domain services
│   │   │   ├── types/               # TypeScript types
│   │   │   └── value-objects/       # Value objects
│   │   └── infrastructure/          # Infrastructure layer
│   │       ├── controllers/         # HTTP controllers
│   │       ├── dtos/                # Data transfer objects
│   │       ├── guards/              # Authorization guards
│   │       ├── mappers/             # Domain to DTO mapping
│   │       ├── persistence/         # Database implementations
│   │       ├── services/            # Technical services
│   │       └── strategies/          # Passport strategies
│   └── social/                      # Social features module
│       └── profile/                 # User profiles
├── shared/
│   ├── config/                      # Shared configuration
│   ├── database/                    # Database configuration
│   │   ├── config/                  # ORM config
│   │   ├── factories/               # Test data factories
│   │   ├── migrations/              # Database migrations
│   │   └── seeders/                 # Database seeders
│   └── services/                    # Shared services
└── test/                            # Test files
    ├── factories/                   # Test fixtures
    ├── e2e/                         # End-to-end tests
    └── modules/                     # Module tests
```

---

## Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** >= 20.19.0
- **npm** >= 11.12.1
- **Docker** & **Docker Compose**
- **MySQL** >= 8.0 (or use Docker)

### Installation

1. **Clone the repository**

   ```bash
   git clone git@github.com:OscarS05/social-media-API.git
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

### Environment Variables

Create a `.env` file in the project root based on the `.env.example` file.

### Database Setup

1. **Create database**

   If you build and Run with Docker Compose, this will start MySQL Database on port 3306

   ```bash
   docker-compose up -d
   ```

2. **Create database and run migrations**

   ```bash
   npm run migrations:run
   ```

3. **Seed initial data (optional)**

   ```bash
   npm run seeders:run
   ```

---

## Running the Application

### Development Mode

```bash
npm run start:dev
```

The application will run on `http://localhost:3000` with hot reload enabled.

### Production Mode

```bash
npm run build
npm run start:prod
```

---

## Testing

### Unit Tests

```bash
npm run test
```

### E2E Tests

```bash
npm run test:e2e
```

### Test Coverage

```bash
npm run test:cov
```

### Watch Mode for Tests

```bash
npm run test:watch
```

---

## API Documentation

All API documentation is in swagger: `localhost:3000/docs`

---

## Built With

- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [TypeScript](https://www.typescriptlang.org/) - Typed superset of JavaScript
- [TypeORM](https://typeorm.io/) - Object-Relational Mapping library
- [MySQL](https://www.mysql.com/) - Relational database
- [Socket.io](https://socket.io/) - Real-time communication
- [Jest](https://jestjs.io/) - Testing framework
- [Docker](https://www.docker.com/) - Container platform

---

## License

This project is open source and available under the MIT License - see the LICENSE file for details.

---

<p align="center">
  <strong>Portfolio project showcasing modern backend development practices</strong>
</p>
