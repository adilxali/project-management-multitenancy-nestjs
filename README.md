# 🚀 Project Management System with Multi-Tenancy

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

A powerful **Project Management System** built with **NestJS**, **PostgreSQL**, and **Prisma ORM**, featuring **column-based multi-tenancy** architecture. This system allows multiple organizations (tenants) to securely manage their projects, tasks, and teams within a single application while maintaining complete data isolation.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Multi-Tenancy Architecture](#-multi-tenancy-architecture)
- [Quick Start](#-quick-start)
- [Database Schema](#-database-schema)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Environment Configuration](#-environment-configuration)
- [Development](#-development)
- [Testing](#-testing)
- [Deployment](#-deployment)

---

## ✨ Features

- 🏢 **Multi-Tenancy Support** - Column-based tenant isolation
- 👥 **User Management** - Role-based access control (ADMIN/USER)
- 📊 **Project Management** - Create and manage multiple projects
- ✅ **Task Tracking** - Track tasks with status management
- 💬 **Comments System** - Collaborate with team comments
- 📜 **Task History** - Audit trail for all task changes
- 🔒 **Data Isolation** - Complete data separation per tenant
- 🎯 **Subscription Plans** - Support for FREE, BASIC, PREMIUM plans
- 🔐 **Secure Authentication** - Password-based user authentication

---

## 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| **NestJS** | Progressive Node.js framework |
| **TypeScript** | Type-safe programming |
| **PostgreSQL** | Relational database |
| **Prisma ORM** | Next-generation ORM |
| **class-validator** | DTO validation |
| **class-transformer** | Object transformation |

---

## 🏗 Multi-Tenancy Architecture

This project implements **Column-Based Multi-Tenancy** using a discriminator column (`tenantId`) to separate data for different organizations.

### How It Works

```
┌─────────────────────────────────────────────┐
│          Single PostgreSQL Database          │
└─────────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
    Tenant A    Tenant B    Tenant C
   (tenantId=1) (tenantId=2) (tenantId=3)
```

**Key Characteristics:**
- ✅ All tenants share the same database and tables
- ✅ Each row has a `tenantId` column for data isolation
- ✅ Cost-effective and easy to maintain
- ✅ All queries automatically filter by `tenantId`
- ✅ Suitable for small to medium-sized applications

### Data Isolation Flow

```typescript
// Every entity includes tenantId
User -> tenantId
Project -> tenantId
Task -> tenantId
Comment -> tenantId

// All queries are scoped to tenant
await prisma.projects.findMany({
  where: { tenantId: currentTenant.id }
})
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Installation

1️⃣ **Clone the repository**
```bash
git clone <repository-url>
cd project-management-multitenancy-nestjs
```

2️⃣ **Install dependencies**
```bash
npm install
```

3️⃣ **Set up environment variables**
```bash
# Create .env file in the root directory
cp .env.example .env
```

Add your database connection:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/project_management?schema=public"
```

4️⃣ **Set up the database**
```bash
# Run migrations
npx prisma migrate dev

# (Optional) Generate Prisma Client
npx prisma generate
```

5️⃣ **Start the application**
```bash
# Development mode with hot-reload
npm run start:dev

# Production mode
npm run start:prod
```

🎉 **Your application is now running at** `http://localhost:3000`

---

## 🗄 Database Schema

### Entity Relationship Diagram

```
┌─────────────┐         ┌──────────────┐
│   Tenant    │────────<│     User     │
└─────────────┘         └──────────────┘
       │                        │
       │                        │
       ├────────────────┐       │
       │                │       │
       ▼                ▼       ▼
┌─────────────┐  ┌─────────────┐
│  Projects   │  │   Comments  │
└─────────────┘  └─────────────┘
       │                 │
       ▼                 │
┌─────────────┐         │
│    Tasks    │◄────────┘
└─────────────┘
```

### Core Models

#### 🏢 Tenant
Represents an organization or company.
```prisma
model Tenant {
  id               BigInt
  email            String @unique
  name             String
  subscriptionPlan SubscriptionPlan (FREE/BASIC/PREMIUM)
  createdAt        DateTime
  updatedAt        DateTime
}
```

#### 👤 User
Users belonging to a tenant with role-based access.
```prisma
model User {
  id        BigInt
  email     String @unique
  name      String
  password  String
  tenantId  BigInt  // 🔑 Tenant isolation key
  role      Role    (ADMIN/USER)
}
```

#### 📊 Projects
Projects managed by a tenant.
```prisma
model Projects {
  id          BigInt
  name        String
  description String?
  tenantId    BigInt  // 🔑 Tenant isolation key
}
```

#### ✅ Tasks
Tasks within projects.
```prisma
model Tasks {
  id         BigInt
  title      String
  projectId  BigInt
  tenantId   BigInt  // 🔑 Tenant isolation key
  status     TaskStatus (PENDING/IN_PROGRESS/COMPLETED/CANCELLED)
  assignedTo String?
  createdBy  String
}
```

---

## 📁 Project Structure

```
project-management-multitenancy-nestjs/
├── src/
│   ├── auth/                    # Authentication module
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── tenant/                  # Tenant management
│   │   ├── tenant.controller.ts
│   │   ├── tenant.service.ts
│   │   ├── tenant.module.ts
│   │   └── dto/
│   │       └── create-tenant.dto.ts
│   ├── users/                   # User management
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.module.ts
│   │   └── dto/
│   │       └── create-user.dto.ts
│   ├── prisma/                  # Prisma service
│   │   ├── prisma.service.ts
│   │   └── prisma.module.ts
│   ├── app.module.ts           # Root module
│   └── main.ts                 # Application entry point
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Database migrations
├── generated/
│   └── prisma/                 # Generated Prisma Client
├── test/                       # E2E tests
└── package.json
```

---

## 🔌 API Endpoints

### Tenant Management

#### Create a New Tenant
```http
POST /tenant
Content-Type: application/json

{
  "name": "Acme Corporation",
  "email": "admin@acme.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "id": "1",
  "name": "Admin User",
  "email": "admin@acme.com",
  "role": "ADMIN",
  "tenantId": "1",
  "createdAt": "2025-12-16T10:30:00Z"
}
```

#### Check Tenant Existence
```http
GET /tenant/:email
```

### User Management

#### Create User
```http
POST /users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@acme.com",
  "password": "password123",
  "tenantId": 1,
  "role": "USER"
}
```

#### Get All Users (for a tenant)
```http
GET /users?tenantId=1
```

---

## ⚙️ Environment Configuration

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/project_management?schema=public"

# Application Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration (if implementing JWT)
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRATION=7d
```

### Database URL Format
```
postgresql://[user]:[password]@[host]:[port]/[database]?schema=public
```

---

## 💻 Development

### Running the Application

```bash
# Development mode with auto-reload
npm run start:dev

# Debug mode
npm run start:debug

# Production mode
npm run start:prod
```

### Database Commands

```bash
# Create a new migration after schema changes
npx prisma migrate dev --name your_migration_name

# Apply migrations to production
npx prisma migrate deploy

# Open Prisma Studio (Database GUI)
npx prisma studio

# Generate Prisma Client
npx prisma generate

# Reset database (⚠️ DANGER: Deletes all data)
npx prisma migrate reset
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format
```

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

---

## 🚢 Deployment

### Building for Production

```bash
# Build the application
npm run build

# Start production server
npm run start:prod
```

### Environment Variables for Production

Ensure these variables are set in your production environment:

- `DATABASE_URL` - Production PostgreSQL connection string
- `NODE_ENV=production`
- `PORT` - Application port

### Docker Support (Optional)

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
```

---

## 🔒 Security Best Practices

- ✅ Always validate `tenantId` in every request
- ✅ Implement row-level security checks
- ✅ Use parameterized queries (Prisma does this automatically)
- ✅ Hash passwords before storing (use bcrypt)
- ✅ Implement JWT authentication for API security
- ✅ Add rate limiting to prevent abuse
- ✅ Sanitize user inputs

---

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [Multi-Tenancy Patterns](https://www.prisma.io/docs/guides/database/multi-tenancy)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the UNLICENSED License.

---

## 👨‍💻 Support

For questions or issues:
- 📧 Create an issue in the repository
- 💬 Contact the development team

---

**Built with ❤️ using NestJS, PostgreSQL, and Prisma**
