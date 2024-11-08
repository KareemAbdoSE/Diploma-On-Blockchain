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

## Project Status

This project is in active development:

- The project structure has been established with separate `client` and `server` directories.
- Initial configurations and security setups have been completed.
- An Express.js server has been set up with essential security middleware:
  - **Helmet** for securing HTTP headers.
  - **CORS** configured for frontend origin.
  - **Express-rate-limit** for rate limiting.
  - **Morgan** for HTTP request logging.
- Environment variables are managed using **dotenv**.
- Implemented a basic health check endpoint at `/api/health`.
- Core functionalities are in development.

Please stay tuned for updates. The repository will be updated regularly as development progresses.

## Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** (Latest LTS version recommended)
- **npm** (Comes with Node.js)
- **PostgreSQL** (or use Docker for containerized PostgreSQL)
- **Git** for version control
- **IntelliJ IDEA Ultimate** or **VSCode** for code editing

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/yourusername/diploma-verification-platform.git
   cd diploma-verification-platform
2. **Install Dependencies**
- Backend
   ```bash
   cd server
   npm install
- Frontend
   ```bash
   cd ../client
   npm install
   
3. **Environment Variables**
- Create a .env file in the server directory with the following content:
  ```bash
  PORT=5001
  DATABASE_URL=your_database_url_here
> **Note:** Ensure the .env file is included in your .gitignore to prevent sensitive information from being pushed to the repository.

4. **Set Up PostgreSQL**
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


## Technologies Used

- **Frontend**: React.js with TypeScript
- **Backend**: Node.js with Express.js
- **Blockchain**: Ethereum network using Solidity smart contracts
- **Database**: PostgreSQL
- **Security Middleware**: Helmet, CORS, Express-rate-limit
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
