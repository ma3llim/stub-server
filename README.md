# Mock API Platform

A full-stack mock API platform that allows developers to create, configure, and run mock APIs for frontend development, testing, and API prototyping.

## What We Implemented

- Mock API creation and management
- Multiple response scenarios per API
- Configurable HTTP status codes
- Custom response headers and response bodies
- Configurable response delays
- Active scenario management
- Dedicated mock server
- Dynamic path matching
- Scenario drag-and-drop ordering
- JWT-based authentication
- Secure HttpOnly cookies
- AI-powered Scenario Assistant
- Natural-language scenario management
- Scenario refresh after AI operations
- Responsive API Explorer interface

## Overview

The Mock API Platform provides an independent mock backend environment for frontend and integration development.

Developers can create endpoints such as:

```
GET /api/v1/users
```

and configure multiple responses:

```
200 - Success
400 - Bad Request
401 - Unauthorized
404 - Not Found
500 - Server Error
```

The configured endpoint is then available through the mock server:

```text
http://localhost:8081/api/v1/users
```

This allows frontend applications to develop and test against predictable API responses without depending on a real backend.

The platform also includes an AI Scenario Assistant that allows users to manage scenarios using natural language.

## Features

### Mock API Management

- Create, update, and delete Mock APIs
- Support for GET, POST, PUT, PATCH, and DELETE
- API path and description configuration
- Complete mock endpoint URL
- Copy mock endpoint URL

### Response Scenarios

- Multiple scenarios per Mock API
- Custom HTTP status codes
- Custom response headers
- Custom response bodies
- Configurable response delay
- Activate a specific scenario
- Create, edit, and delete scenarios

### Scenario Organization

- Drag-and-drop scenario ordering
- Local scenario ordering
- Status-code based sorting
- Numeric status-code ordering
- Active scenario indicator

### Mock Server

- Dedicated mock server
- Dynamic path matching
- Configurable response status
- Configurable response headers
- Configurable response body
- Configurable response delay

### AI Scenario Assistant

- Natural-language scenario management
- Create scenarios
- Update scenarios
- Delete scenarios
- Activate scenarios
- List scenarios
- Retrieve individual scenarios
- Tool-based AI operations
- Automatic UI refresh after successful AI operations

### Authentication

- User registration
- User login
- JWT authentication
- Refresh tokens
- HttpOnly cookies
- Password hashing
- User ownership validation

## Technology Stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- Axios
- Tailwind CSS
- Lucide React
- @hello-pangea/dnd

### Backend

- Node.js
- Express
- TypeScript
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Zod

### AI

- Cloudflare Workers AI
- Qwen
- Native Fetch API
- Tool-based AI architecture

## Architecture

```text
                    ┌─────────────────────┐
                    │     React App       │
                    │      Frontend       │
                    └──────────┬──────────┘
                               │
                               │ HTTP
                               ▼
                    ┌─────────────────────┐
                    │   Express Backend   │
                    │   Management API    │
                    │      Port 8080      │
                    └───────┬─────┬───────┘
                            │     │
                  ┌─────────┘     └─────────┐
                  ▼                         ▼
           ┌──────────────┐        ┌────────────────┐
           │ Auth Module  │        │  AI Assistant  │
           └──────┬───────┘        └───────┬────────┘
                  │                        │
                  │                        ▼
                  │                Cloudflare AI
                  │
                  └──────────┬─────────────┘
                             ▼
                       ┌───────────┐
                       │  MongoDB  │
                       └─────┬─────┘
                             ▲
                             │
                       ┌─────┴─────┐
                       │ Mock      │
                       │ Server    │
                       │ Port 8081 │
                       └───────────┘
```

The application separates the management API from the mock runtime while keeping the architecture simple and maintainable.

## Installation

### Prerequisites

- Node.js
- npm
- MongoDB
- Cloudflare Workers AI credentials

### Clone Repository

```bash
git clone https://github.com/ma3llim/stub-server
cd mock-api
```

### Backend

```bash
cd backend
npm install
```

Copy the example environment file:

```bash
cp .env.example .env
```

Start the backend:

```bash
npm run dev
```

### Frontend

```bash
cd frontend
npm install
```

Copy the example environment file:

```bash
cp .env.example .env
```

Start the frontend:

```bash
npm run dev
```

The application will use:

```text
Management API: http://localhost:8080
Mock Server:     http://localhost:8081
Frontend:        http://localhost:5173
```

## License

This project is provided for educational and portfolio purposes.

See the [LICENSE](LICENSE) file in the repository for the applicable license terms.

## Acknowledgements

- React
- Node.js
- Express
- MongoDB
- Mongoose
- Cloudflare Workers AI
- Qwen
- Tailwind CSS
- Lucide React
- @hello-pangea/dnd
