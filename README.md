# Job Scheduling & Execution Engine

A production-oriented distributed backend system built with **JavaScript and Node.js** for scheduling, managing, distributing, and executing background jobs reliably.

The platform provides a centralized job management system where applications can submit tasks, schedule executions, define priorities, monitor execution status, and automatically recover from failures through retry mechanisms.

The system is designed around asynchronous processing, distributed workers, message queues, and fault-tolerant execution.

---

## Overview

Modern applications frequently perform resource-intensive operations such as sending emails, generating reports, processing files, and executing scheduled workflows.

Running these operations directly inside HTTP request-response cycles can increase latency, consume application resources, and negatively affect system performance.

The **Job Scheduling & Execution Engine** addresses these challenges by separating job submission from job execution.

Applications submit jobs through REST APIs. The engine persists job metadata, schedules execution, distributes jobs to available workers, and tracks their lifecycle.

The architecture is designed to support concurrent execution, automatic retries, priority-based processing, delayed scheduling, and horizontal worker scaling.

## Key Features

### Job Management
- Create, retrieve, update, and cancel jobs.
- Persistent job storage.
- Job lifecycle and status tracking.
- Job metadata and execution history.
- Unique job identifiers.

### Job Scheduling
- Immediate job execution.
- Delayed job execution.
- Scheduled and recurring jobs.
- Priority-based job scheduling.
- Configurable execution times.

### Distributed Execution
- Multiple independent worker processes.
- Redis-based job queues.
- Concurrent job execution.
- Dynamic worker scaling.
- Worker registration and health monitoring.

### Reliability & Fault Tolerance
- Automatic retry mechanism.
- Exponential backoff strategy.
- Maximum retry limits.
- Dead Letter Queue (DLQ).
- Job timeout handling.
- Idempotent job execution.
- Graceful worker shutdown and recovery.

### Performance & Scalability
- Asynchronous job processing.
- Redis caching and queue management.
- Database indexing and query optimization.
- Configurable worker concurrency.
- Rate limiting.
- Horizontal scaling.

### Monitoring & Observability
- Job execution metrics.
- Worker health monitoring.
- Execution duration tracking.
- Structured application logging.
- Failure tracking.
- Prometheus metrics and Grafana dashboards.

---

## Technology Stack

| Category | Technology |
|---|---|
| Programming Language | JavaScript (ES Modules) |
| Runtime Environment | Node.js |
| Backend Framework | Express.js |
| Database | PostgreSQL |
| Database Toolkit | Prisma ORM |
| Cache & Queue Storage | Redis |
| Job Queue | BullMQ |
| Scheduling | BullMQ Job Schedulers |
| API Documentation | Swagger / OpenAPI |
| Authentication | JWT |
| Validation | Zod |
| Testing | Jest / Supertest |
| Load Testing | k6 |
| Containerization | Docker |
| Container Orchestration | Docker Compose / Kubernetes |
| Monitoring | Prometheus |
| Visualization | Grafana |
| CI/CD | GitHub Actions |
| Version Control | Git / GitHub |

**Architecture note:** BullMQ will provide the initial Redis-backed queue infrastructure. Application-level scheduling, job lifecycle management, retry policies, idempotency, monitoring, and worker orchestration will be implemented as part of the project rather than treating the queue library as the entire system.

---

## System Architecture

The engine follows a distributed producer-consumer architecture.

```text
                  CLIENT APPLICATION
                          |
                          v
                     REST API
                    (Express.js)
                          |
                          v
                  JOB MANAGEMENT
                          |
                +---------+---------+
                |                   |
                v                   v
           PostgreSQL             Redis
          (Job Metadata)       (Job Queues)
                                    |
                                    v
                             SCHEDULER SERVICE
                                    |
                                    v
                              JOB DISPATCHER
                                    |
                    +---------------+---------------+
                    |               |               |
                    v               v               v
                 Worker 1        Worker 2        Worker 3
                    |               |               |
                    +---------------+---------------+
                                    |
                                    v
                              JOB EXECUTION
                                    |
                         +----------+----------+
                         |                     |
                         v                     v
                      SUCCESS                FAILURE
                         |                     |
                         v                     v
                   Update Status         Retry Manager
                                               |
                                      +--------+--------+
                                      |                 |
                                      v                 v
                                  Retry Queue        DLQ
```

### Core Components

**1. API Service**

Responsible for accepting incoming requests, validating payloads, managing authentication, and exposing job management endpoints.

**2. Job Management Service**

Handles job creation, persistence, cancellation, status transitions, and execution metadata.

**3. Scheduler Service**

Determines when jobs should become eligible for execution, including delayed and recurring jobs.

**4. Queue Management**

Uses Redis and BullMQ to distribute jobs between producers and workers.

**5. Worker Service**

Independent Node.js processes responsible for consuming jobs, executing registered task handlers, and reporting execution results.

**6. Retry Manager**

Handles failed executions through configurable retry policies, exponential backoff, and maximum attempt limits.

**7. Dead Letter Queue**

Stores jobs that have exhausted their permitted retry attempts for investigation and possible manual reprocessing.

**8. Monitoring Service**

Collects application metrics, job execution statistics, worker health information, and system performance indicators.

---

## Job Lifecycle

Each job moves through a controlled execution lifecycle.

```text
CREATED
   |
   v
PENDING
   |
   v
QUEUED
   |
   v
RUNNING
   |
   +-----------> COMPLETED
   |
   +-----------> FAILED
   |                |
   |                v
   |             RETRYING
   |                |
   |                v
   |              QUEUED
   |
   +-----------> DEAD LETTER
   |
   +-----------> CANCELLED
```

Job state transitions will be validated to prevent invalid execution states and inconsistent updates.

---

## Project Structure

```text
job-scheduling-execution-engine/
│
├── src/
│   ├── config/
│   │   ├── database.js
│   │   ├── redis.js
│   │   └── env.js
│   │
│   ├── modules/
│   │   ├── jobs/
│   │   │   ├── job.controller.js
│   │   │   ├── job.service.js
│   │   │   ├── job.repository.js
│   │   │   ├── job.routes.js
│   │   │   └── job.validation.js
│   │   │
│   │   ├── scheduler/
│   │   │   ├── scheduler.service.js
│   │   │   └── scheduler.worker.js
│   │   │
│   │   └── workers/
│   │       ├── worker.manager.js
│   │       ├── worker.processor.js
│   │       └── handlers/
│   │
│   ├── queues/
│   │   ├── queue.config.js
│   │   ├── queue.producer.js
│   │   └── queue.events.js
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   └── rate-limit.middleware.js
│   │
│   ├── services/
│   │   ├── retry.service.js
│   │   ├── dead-letter.service.js
│   │   └── idempotency.service.js
│   │
│   ├── utils/
│   │   ├── logger.js
│   │   └── response.js
│   │
│   ├── app.js
│   └── server.js
│
├── prisma/
│   └── schema.prisma
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── load/
│
├── monitoring/
│   ├── prometheus.yml
│   └── grafana/
│
├── docker/
│
├── docs/
│   ├── architecture.md
│   └── api-documentation.md
│
├── .env.example
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── package.json
└── README.md
```

---

## API Endpoints

Base URL: `/api/v1`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/jobs` | Create a new job |
| GET | `/jobs` | Retrieve all jobs |
| GET | `/jobs/:id` | Retrieve a specific job |
| DELETE | `/jobs/:id` | Cancel a job |
| POST | `/jobs/:id/retry` | Retry a failed job |
| GET | `/jobs/:id/history` | Retrieve execution history |
| GET | `/workers` | List registered workers |
| GET | `/workers/:id` | Get worker information |
| GET | `/queues` | Retrieve queue statistics |
| GET | `/health` | Application health check |
| GET | `/metrics` | Prometheus metrics |

### Example: Create Job

**Request**

```http
POST /api/v1/jobs
Content-Type: application/json
```

```json
{
  "name": "generate-report",
  "payload": {
    "userId": "user_123",
    "reportType": "monthly"
  },
  "priority": 5,
  "scheduleAt": "2026-12-01T10:00:00Z",
  "maxRetries": 3,
  "timeout": 30000
}
```

**Example Response**

```json
{
  "success": true,
  "message": "Job created successfully",
  "data": {
    "id": "job_abc123",
    "name": "generate-report",
    "status": "PENDING",
    "priority": 5,
    "attempts": 0,
    "maxRetries": 3
  }
}
```

---

## Database Design

The initial database schema will include the following entities:

| Table | Purpose |
|---|---|
| users | User authentication and ownership |
| jobs | Job definitions and current status |
| job_executions | Individual execution attempts |
| workers | Worker registration and health |
| job_schedules | Delayed and recurring schedules |
| job_events | Job lifecycle event history |
| idempotency_keys | Duplicate request protection |

PostgreSQL will be the source of truth for persistent job metadata and execution records. Redis will handle transient queue state and coordination.

---

## Reliability & Engineering Principles

The project will implement the following production-oriented engineering practices:

- **Idempotency:** Prevent duplicate side effects when a job is delivered more than once.
- **Exponential Backoff:** Increase retry delays after consecutive failures.
- **Dead Letter Queue:** Isolate jobs that repeatedly fail.
- **Graceful Shutdown:** Allow active jobs to finish or be safely recovered during worker termination.
- **Concurrency Control:** Limit simultaneous jobs per worker.
- **Distributed Coordination:** Handle multiple workers safely.
- **Database Transactions:** Maintain consistent persistent state.
- **Observability:** Monitor queue depth, throughput, execution latency, and failure rates.
- **Security:** Validate inputs, authenticate API clients, and protect sensitive configuration.

The system will explicitly account for at-least-once job delivery. Exactly-once execution of arbitrary external side effects cannot be guaranteed simply through a queue; handlers must use idempotency and appropriate transactional or deduplication mechanisms.

---

## Development Roadmap

| Phase | Implementation |
|---|---|
| Phase 1 | Backend foundation, Express APIs, PostgreSQL and Prisma |
| Phase 2 | Redis integration and job queue management |
| Phase 3 | Worker processes and asynchronous execution |
| Phase 4 | Delayed jobs, recurring jobs and priorities |
| Phase 5 | Retries, backoff and Dead Letter Queue |
| Phase 6 | Idempotency, concurrency and distributed coordination |
| Phase 7 | Worker scaling and failure recovery |
| Phase 8 | Logging, Prometheus and Grafana monitoring |
| Phase 9 | Docker deployment and CI/CD |
| Phase 10 | Load testing, benchmarking and optimization |

---

## Getting Started

### Prerequisites

- Node.js (LTS)
- npm
- PostgreSQL
- Redis
- Docker and Docker Compose

### Installation

```bash
# Clone the repository
git clone <your-repository-url>

# Navigate into the project
cd job-scheduling-execution-engine

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Start infrastructure
docker compose up -d

# Run database migrations
npx prisma migrate dev

# Start the API server
npm run dev
```

### Environment Variables

Create a `.env` file using `.env.example` as a template.

```env
NODE_ENV=development
PORT=5000

DATABASE_URL=postgresql://postgres:password@localhost:5432/job_engine

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

JWT_SECRET=replace_with_a_secure_secret

LOG_LEVEL=info
```

---

## Testing & Performance

The system will be validated through:

- Unit testing of business logic.
- API integration testing.
- Queue and worker integration testing.
- Concurrent job submission testing.
- Worker crash and recovery testing.
- Retry and failure scenario testing.
- Load testing using k6.

Performance benchmarks will measure:

- Jobs submitted per second.
- Jobs processed per second.
- Average and percentile execution latency.
- Queue processing latency.
- Worker utilization.
- Failure and retry rates.

Actual benchmark results will be documented after load testing.

---

## Future Enhancements

- Multi-tenant job scheduling.
- Workflow orchestration and job dependencies.
- WebSocket-based live job monitoring.
- Dynamic worker autoscaling.
- Distributed tracing using OpenTelemetry.
- Kubernetes-based deployment.
- Web dashboard for job and worker management.
- Plugin-based task handler architecture.

---

## Engineering Goals

This project aims to demonstrate practical backend engineering knowledge in:

- Distributed systems architecture.
- Asynchronous processing.
- Message queues and event-driven systems.
- Database design and transaction management.
- Concurrency and race-condition handling.
- Fault tolerance and recovery.
- API design and security.
- Performance optimization.
- Containerization and deployment.
- Monitoring and observability.

---

## License

This project is developed for educational and engineering portfolio purposes. License details will be added as the project evolves.

---

**Built with Node.js, JavaScript, PostgreSQL, Redis, and BullMQ.**

*Engineering reliable background execution, one job at a time.*