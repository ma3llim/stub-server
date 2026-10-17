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
- Import and export of APIs and scenarios, with selection
- Scenario cloning and bulk delete
- Mappings endpoint and a Demo request page
- Light and dark themes
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
- Optional example request body (JSON) per API
- Complete mock endpoint URL
- Copy mock endpoint URL

### Response Scenarios

- Multiple scenarios per Mock API
- Custom HTTP status codes
- Custom response headers
- Custom response bodies
- Configurable response delay
- Activate a specific scenario
- Create, edit, clone, and delete scenarios

### Success and Error Responses

Each Mock API can also store one success JSON object and one error JSON object independently of its scenarios. These values are stored directly in the `successResponse` and `errorResponse` fields.

The management API supports create, read, and update operations at:

```text
POST   /mock-apis/:id/responses/success
GET    /mock-apis/:id/responses/success
PUT    /mock-apis/:id/responses/success

POST   /mock-apis/:id/responses/error
GET    /mock-apis/:id/responses/error
PUT    /mock-apis/:id/responses/error
```

Create request example (the request body is the JSON response itself):

```json
{
  "data": [],
  "message": "Success"
}
```

Creating a response that already exists returns `409 Conflict`; updating a response that does not exist returns `404 Not Found`.

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
- Responses are never cached, so changing the active scenario takes effect immediately
- When two APIs match a request, the most specific path wins (`/products/featured` before `/products/{id}`), then the most recently changed API

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

### Import, Export, and Bulk Actions

From the API Explorer:

- **Export all** opens a picker: choose which APIs, which of their scenarios, and which scenario is active in the file
- **Import** previews the file, shows which APIs already exist, and lets you pick APIs, scenarios, and the active scenario; existing APIs can be skipped or replaced
- **Delete all** removes every API and scenario (export a backup first)

Export files are versioned JSON with no database IDs, so they can be shared and imported anywhere.

### Mappings and Demo

- `GET /api/v1/mappings` returns every API and scenario as one JSON document (open it directly in the browser)
- The **Demo** page sends a request to any mock URL and shows the status, timing, headers, and body

### Workspace and Access

There is no login: all APIs and scenarios live in one shared workspace, and the management API (port 8080) and mock server (port 8081) accept requests from anyone who can reach them. Run the platform on your own machine or a trusted network only.

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
- CodeMirror (JSON editor)

### Backend

- Node.js
- Express
- TypeScript
- MongoDB
- Mongoose
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
                            │     └─────────┐
                            │               ▼
                            │      ┌────────────────┐
                            │      │  AI Assistant  │
                            │      └───────┬────────┘
                            │              ▼
                            │        Cloudflare AI
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
- MongoDB (running locally or reachable via `MONGODB_URI`)
- Cloudflare Workers AI credentials (for the AI Scenario Assistant)

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

To start the frontend, management API, and mock server together, run `npm install` and then `npm run dev` from the project root.

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
