
# Library Management System API

A comprehensive backend API for library management built with **Node.js, Express.js, and MongoDB**. This system handles both admin and user functionalities.

## System Workflow

### Member Registration
1. Student submits library membership form
2. Admin verifies and creates member account
3. System automatically emails login credentials to new member

### Book Management
4. Members can:
   - Login to browse available books
   - Reserve up to 3 books
   - View their borrowing history
   - Search books by author or title

5. Reservation Rules:
   - Valid for 3 days
   - Auto-cancels if book not collected
   - System notifies members about overdue returns

### Admin Functions
6. Administrators can:
   - Manage book inventory (add/remove/update)
   - Process book borrowings and returns
   - Track member activities
   - Verify membership applications

### System Features
- Automatic email notifications
- Real-time dashboard updates
- Book search functionality
- Inventory management
- Member status tracking


## 🛠 Tech Stack

### Backend:
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt.js 

### Database:
- MongoDB
  
### Version Control:
- Git & GitHub

## 📌 Installation & Setup

### Prerequisites
- Node.js
- MongoDB
- Git

### Steps to Run Locally

1. Clone the repository:

```shell
git clone https://github.com/yourusername/library-management.git
cd library-management
```

2. Install dependencies:

```shell
npm install
```

3. Create a .env file and configure it:
```env
NODE_ENV = "production"
PORT = 3000
BCRYPT_SALT = 12
JWT_SECRET = your_jwt_secret
DATABASE_URL = your_mongodb_url
```

1. Start the server:

```shell 
npm run dev
```

The server will run on http://localhost:3000

## 🔌 API Endpoints

### Book Management
| Method | Endpoint               | Description                           |
|--------|------------------------|---------------------------------------|
| GET    | /statistics       | Get library statistics                |
| GET    | /reservations     | Get all book reservations            |
| GET    | /getBorrowedBooks | Get all borrowed books               |
| GET    | /book/details     | Get detailed book info by ID         |
| GET    | /books            | Get paginated list of books          |
| GET    | /book             | Get single book by ID                |
| GET    | /books/search     | Search books by any field            |
| POST   | /books            | Add new book with copies             |
| POST   | /updateBook       | Update book details                  |
| DELETE | /deleteBook       | Delete book and its copies           |

### User Management
| Method | Endpoint           | Description                           |
|--------|-------------------|---------------------------------------|
| GET    | /user/all     | Get paginated list of users          |
| GET    | /user/search  | Search users by name                 |
| GET    | /user/:id     | Get user by email                    |
| GET    | /user         | Get user details by ID               |
| GET    | /reservations | Get user's reservations              |
| POST   | /user         | Create new user                      |
| POST   | /user/login   | User login with token                |
| POST   | /updateUser   | Update user details                  |
| DELETE | /user         | Delete user and related data         |

### Copy Management
| Method | Endpoint        | Description                           |
|--------|----------------|---------------------------------------|
| GET    |/copies    | Get copies by book ID                |
| POST   |/copies    | Add new copy to book                 |
| PUT    |/copies    | Update copy status/condition         |
| DELETE |/copies    | Delete copy from book                |
 
## 🛡 Security Measures

- Passwords are hashed using bcrypt.js
- JWT is used for secure authentication
- Environment variables (.env) are used to store sensitive data 
- Input validation and sanitization 
