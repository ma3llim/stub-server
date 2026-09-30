# Mock API Platform

A production-oriented mock/stub API platform.

## Architecture

- Admin Frontend
- Management API
- MongoDB
- Local Stub Server

## Applications

### Management API

Responsible for:

- API CRUD
- Scenario CRUD
- API enable/disable
- Active scenario management

### Stub Server

Responsible for:

- Receiving mock API requests
- Matching method + path
- Checking API configuration
- Resolving active scenario
- Returning configured response
