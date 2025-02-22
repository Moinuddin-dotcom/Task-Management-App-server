# Task Management Application - Backend

This is the backend server for the Task Management Application, built using **Express.js** and **MongoDB**. It provides RESTful APIs for user authentication, task management, and secure data handling.


## Features
- User authentication with JWT (JSON Web Token)
- Task creation, retrieval, update, and deletion
- Secure cookie-based authentication
- Protected routes using middleware

## Technologies Used
- **Node.js**
- **Express.js**
- **MongoDB & MongoDB Atlas**
- **JWT (JSON Web Token)**
- **Cookie Parser**
- **Cors**
- **Dotenv**

## Setup and Installation

### 1. Clone the Repository
```sh
git clone https://github.com/Moinuddin-dotcom/Task-Management-App-server.git
cd task-management-backend
```

### 2. Install Dependencies
```sh
npm install
```

### 3. Set Up Environment Variables
Create a `.env` file in the root directory and add the following:
```env
PORT=8004
DB_NAME=your_mongodb_username
DB_PASS=your_mongodb_password
SECRET_KEY=your_jwt_secret_key
NODE_ENV=development
```

### 4. Start the Server
```sh
npm start
```
The server will start on `http://localhost:8004`.

## API Endpoints

### Authentication
- **POST `/jwt`** - Generates a JWT token and sets it in a cookie.
- **GET `/logout`** - Clears the authentication token.

### Users
- **POST `/users`** - Registers a new user.

### Tasks
- **POST `/tasks`** *(Protected Route)* - Creates a new task.
- **GET `/tasks/:email`** *(Protected Route)* - Retrieves tasks for a specific user by email.
- **DELETE `/tasks/:id`** *(Protected Route)* - Deletes a task by ID.
- **PUT `/tasks/:id`** *(Protected Route)* - Updates a task by ID.

## Middleware
- **`verifyToken`**: Protects routes by validating JWT tokens.


