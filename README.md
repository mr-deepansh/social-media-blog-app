# Social Media Blog App

## Overview
This is a full-stack social media blog application where users can create and share blog posts. The application is built using MongoDB, Express, Node.js, and JavaScript. User authentication is implemented with JWT (JSON Web Tokens) for secure access, and Bcrypt is used to encrypt user passwords. The application also utilizes cookies for managing user sessions.

## Features
- **User Authentication:**
  - Secure user registration and login.
  - Passwords are encrypted using Bcrypt for enhanced security.
  - JWT tokens for user authentication and authorization.

- **Blog Creation and Sharing:**
  - Users can create, edit, and delete their blog posts.
  - Share blog posts with other users.
  - View and comment on blog posts from other users.

- **User Profiles:**
  - Personalized user profiles with user information.
  - Display user's created blog posts on their profile.

## Technologies Used
- MongoDB: Database for storing user information, blog posts, and comments.
- Express.js: Web application framework for Node.js.
- Node.js: JavaScript runtime for server-side development.
- JavaScript: Programming language for both front-end and back-end logic.
- JWT (JSON Web Tokens): For secure user authentication.
- Bcrypt: Password hashing for enhanced security.
- Cookies: Used for managing user sessions.

## Setup Instructions
1. **Clone the Repository:**
   ```bash
   git clone https://github.com/your-username/social-media-blog-app.git
   cd social-media-blog-app
## Prerequisites
Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [MongoDB](https://www.mongodb.com/)

- Set Environment Variables:
Create a .env file in the root directory.
Add the following environment variables to the .env file:

MONGODB_URI=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_jwt_secret_key

## Run the Application:
npm start
Quick Start Commands:
If you're in a hurry, you can use the following commands:

- bash
- git clone https://github.com/your-coder-deep1/social-media-blog-app.git
- cd social-media-blog-app
- npm install
- MONGODB_URI=your_mongodb_connection_string
- ACCESS_TOKEN_SECRET=your_jwt_secret_key
