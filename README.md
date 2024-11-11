# Diploma Verification On The Blockchain

*Note: This project is currently under development. The initial codebase has been set up, and more updates will follow soon.*

## Overview

The Diploma Verification System is a secure platform that leverages blockchain technology to authenticate university and high school diplomas. By issuing diplomas as non-transferable NFTs (Soulbound Tokens) on the Ethereum blockchain, we ensure the authenticity and integrity of academic credentials.

## Features

- **University Onboarding**: Secure registration and verification process to onboard universities onto the platform.
- **Student Verification**: Authentication system linked with university credentials to verify student identities.
- **Blockchain Integration**: Issuance of diplomas as Soulbound Tokens, preventing transferability and ensuring authenticity.
- **Secure Payment Processing**: Implementation of PCI DSS-compliant payment systems for processing student transactions.
- **User Interface**: A secure and user-friendly web application for both universities and students to interact with the system.
- **Health Check Endpoint**: Implemented a basic health check endpoint to verify server status.
- **Database Integration**: Set up PostgreSQL database using Docker Compose.
- **ORM Configuration**: Configured Sequelize ORM with TypeScript support.
- **Models and Migrations**: Created models and initial database migration scripts for User, Role, and University entities.

## Project Status

- **Project Structure Established**: Separate `client` and `server` directories have been set up.
- **Backend Server Setup**:
  - An Express.js server has been configured with essential security middleware:
    - **Helmet** for securing HTTP headers.
    - **CORS** configured for frontend origin.
    - **Express-rate-limit** for rate limiting.
  - **Winston** logger is set up for logging errors and information.
  - Environment variables are managed using **dotenv**.
  - Implemented a basic health check endpoint at `/api/health`.
- **Database Configuration**:
  - PostgreSQL database is set up using **Docker Compose** for easy deployment and consistency.
  - **Sequelize ORM** is configured with TypeScript support.
  - **Models** for `User`, `Role`, and `University` have been implemented with security measures like password hashing.
  - **Migrations** and **seeders** are in place for database schema and initial data.
- **Security Measures**:
  - Passwords are hashed using **bcrypt** with a strong salt factor.
  - SQL injection prevention through parameterized queries in Sequelize.
  - Sensitive data is managed securely and not exposed in the codebase.

Please stay tuned for updates. The repository will be updated regularly as development progresses.

## Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** (Latest LTS version recommended)
- **npm** (Comes with Node.js)
- **Docker** and **Docker Compose** (For containerized PostgreSQL)
- **Git** for version control
- **IntelliJ IDEA Ultimate** or **VSCode** for code editing
- **TypeScript** globally installed (optional but recommended)

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/yourusername/diploma-verification-platform.git
   cd diploma-verification-platform
   
2. **Set Up Environment Variables**
- Create a .env file in the server directory with the following content:
  ```bash
  # server/.env
  DB_HOST=localhost
  DB_PORT=5432
  DB_USER=your_db_user         # Replace with your database username
  DB_PASSWORD=your_db_password # Replace with your database password
  DB_NAME=diploma_db           # Replace with your database name
  PORT=3000                    # Port your server will run on
> **Note:** Ensure the .env file is included in your .gitignore to prevent sensitive information from being pushed to the repository.

3. **Set Up PostgreSQL with Docker Compose**
- We use Docker Compose to manage our PostgreSQL database.
- Navigate to the project root directory (where docker-compose.yml is located).
- Modify docker-compose.yml if necessary to match your configuration.
  ```bash
  # docker-compose.yml
  version: '3.8'

  services:
    db:
      image: postgres:latest
      container_name: diploma-db
      environment:
        POSTGRES_USER: your_db_user         # Replace with your database username
        POSTGRES_PASSWORD: your_db_password # Replace with your database password
        POSTGRES_DB: diploma_db             # Replace with your database name
      ports:
        - '5432:5432'                       # Maps container port 5432 to host port 5432
      volumes:
        - pgdata:/var/lib/postgresql/data   # Persists database data
      networks:
        - diploma_network
  volumes:
  pgdata:

  networks:
    diploma_network:
      driver: bridge
- Start the PostgreSQL Service:
  ```bash
  docker-compose up -d
- Verify the Database Service:
  ```bash
  docker-compose ps




4. **Install Dependencies**
- Backend
   ```bash
   cd server
   npm install
- Frontend
   ```bash
   cd ../client
   npm install
   
5. **Environment Variables**
- Create a .env file in the server directory with the following content:
  ```bash
  PORT=5001
  DATABASE_URL=your_database_url_here
> **Note:** Ensure the .env file is included in your .gitignore to prevent sensitive information from being pushed to the repository.

6. **Set Up PostgreSQL**
- Docker
  ```bash
  docker run --name postgres-db -e POSTGRES_PASSWORD=yourpassword -p 5432:5432 -d postgres
- Replace yourpassword with a secure password.
- Update DATABASE_URL in your .env file accordingly.

### Installation
1. **Start the Backend Server**
   ```bash
   cd server
   npm run dev
1. **Start the Frontend Server**
   ```bash
   cd client
   npm run dev
   
7. **Test the Health Check Endpoint**
- Use your browser or a tool like curl or Postman to test:
  ```bash
  curl http://localhost:3000/api/health
- You should receive:
  ```bash
  Server is healthy and database is connected


## Technologies Used

- **Frontend**: React.js with TypeScript
- **Backend**: Node.js with Express.js
- **Blockchain**: Ethereum network using Solidity smart contracts
- **Database**: PostgreSQL
- **ORM**: Sequelize ORM with TypeScript support
- **Security Middleware**: Helmet, CORS, Express-rate-limit
- **Logging**: Winston for logging errors and information
- **Authentication**: Password hashing with bcrypt
- **Payment Gateway**: Stripe or PayPal (to be decided)
- **Storage**: IPFS for off-chain data storage

## Contributing

Contributions are welcome once the project reaches a stable state. Guidelines for contributing will be added soon.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For any inquiries or questions, please contact [kareemabdose@gmail.com](mailto:kareemabdose@gmail.com).

---

*This README is intended to provide a brief overview of the project and its current status. More detailed documentation will be added as the project develops.*
