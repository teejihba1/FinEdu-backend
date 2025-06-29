# FinEdu Backend

A complete Node.js/Express backend for **FinEdu** - an AI-powered financial education platform with gamification elements targeting rural communities under UN SDG4.

## 🚀 Features

- **🔐 Authentication & Authorization** - JWT-based auth with role-based access control
- **📚 Lesson Management** - CRUD operations for educational content
- **📋 Task Management** - Assignment and completion tracking
- **🎮 Gamification** - XP system, levels, achievements, and leaderboards
- **🤖 AI Chatbot** - Intelligent financial education assistant
- **📊 Analytics** - Comprehensive progress tracking and reporting
- **📁 File Management** - Secure uploads for avatars and content
- **🌍 Multi-language Support** - Internationalization ready

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + bcrypt
- **File Upload**: Multer
- **Validation**: Joi
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate Limiting

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account
- npm or yarn

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd finedu-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
# Copy the example file
cp env.example .env
```

Update the `.env` file with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb+srv://abhi:<your_actual_password>@cluster0.ikowe.mongodb.net/finedu?retryWrites=true&w=majority&appName=Cluster0

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRE=7d

# Chatbot API Configuration
CHATBOT_API_URL=http://localhost:5001/api/chat

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

### 4. Database Setup

**Important**: This setup uses a separate database named `finedu` to avoid conflicts with existing data.

Initialize the database:
```bash
npm run init-db
```

This will:
- ✅ Connect to your MongoDB Atlas cluster
- ✅ Create a new `finedu` database
- ✅ Verify the connection
- ✅ Show existing collections (if any)

### 5. Start the Server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

## 🗄️ Database Structure

The application creates the following collections in the `finedu` database:

- **users** - User accounts and profiles
- **avatars** - Gamification data (XP, levels, achievements)
- **lessons** - Educational content and exercises
- **tasks** - Assignments and homework
- **gamesessions** - Game activity tracking
- **chathistories** - AI chatbot conversations

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/upload-avatar` - Upload profile picture

### Users
- `GET /api/users` - Get all users (admin/teacher)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin)
- `GET /api/users/students` - Get all students
- `GET /api/users/teachers` - Get all teachers

### Lessons
- `GET /api/lessons` - Get all lessons (with filters)
- `GET /api/lessons/:id` - Get specific lesson
- `POST /api/lessons` - Create lesson (teachers only)
- `PUT /api/lessons/:id` - Update lesson (teachers only)
- `DELETE /api/lessons/:id` - Delete lesson (teachers only)
- `POST /api/lessons/:id/complete` - Mark lesson as completed

### Tasks
- `GET /api/tasks` - Get user's tasks
- `POST /api/tasks` - Create new task (teachers only)
- `GET /api/tasks/assigned` - Get tasks assigned by teacher
- `POST /api/tasks/:id/complete` - Mark task as completed
- `PUT /api/tasks/:id` - Update task (teachers only)
- `DELETE /api/tasks/:id` - Delete task (teachers only)

### Games
- `POST /api/games/session` - Start new game session
- `PUT /api/games/session/:id` - Update game session
- `POST /api/games/session/:id/complete` - Complete game session
- `GET /api/games/leaderboard/:gameType` - Get game leaderboard
- `GET /api/games/stats` - Get user's game statistics

### Chatbot
- `POST /api/chatbot/ask` - Send question to AI chatbot
- `GET /api/chatbot/history` - Get chat history

### Analytics
- `GET /api/analytics/student/:id` - Get student progress
- `GET /api/analytics/class-overview` - Get class progress (teachers)
- `GET /api/analytics/export-report` - Export progress report

## 🎮 Gamification System

The platform includes a comprehensive gamification system:

- **XP System**: Earn XP through lessons, tasks, and games
- **Level Progression**: Level up with increasing stats
- **Achievements**: Unlock achievements for milestones
- **Streak Tracking**: Maintain daily activity streaks
- **Health System**: Manage avatar health
- **Inventory**: Collect rewards and items
- **Leaderboards**: Compete with other users

## 🔒 Security Features

- JWT token authentication
- Role-based access control (Student, Teacher, Admin)
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting on API endpoints
- CORS configuration
- Helmet security headers
- File upload validation

## 📊 Analytics & Reporting

- Individual student progress tracking
- Class overview with performance metrics
- Export functionality for reports
- Real-time statistics and trends
- Achievement tracking
- Activity monitoring

## 🚀 Deployment

### Environment Variables for Production

Update your production environment variables:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
CHATBOT_API_URL=your_production_chatbot_url
```

### Health Check

The server includes a health check endpoint:
```
GET /health
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the API documentation
- Review the error logs
- Contact the development team

---

**FinEdu Backend** - Empowering financial education through technology and gamification. 