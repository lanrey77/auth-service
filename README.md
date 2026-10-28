An authentication microservice that can be integrated with React, Angular, mobile applications, or other backend services.

The implementation will follow production engineering practices: 
separation of concerns, 
SOLID principles, 
dependency injection,
centralized error handling, validation, 
security, logging, and automated testing.


Package	| Responsibility
Express =>	HTTP server
Mongoose=>	MongoDB ODM
Argon2	=> Password hashing
jsonwebtoken	 => JWT generation and verification
Zod	=> Request and environment validation
Helmet =>	HTTP security headers
CORS	=> Cross-origin access
cookie-parser =>	Read browser cookies
express-rate-limit =>	Request throttling
Pino	 => Structured logging
Jest =>	Testing
Supertest	 => HTTP integration testing
