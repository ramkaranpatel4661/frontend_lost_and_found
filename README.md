# 🎯 Lost and Found - Web Application

A comprehensive web application for posting and claiming lost or found items. Built with React, Node.js, and MongoDB.

## ✨ Features

- **User Authentication**: Secure registration and login with JWT
- **Item Management**: Post lost/found items with images and details
- **Real-time Chat**: Private messaging between users
- **Claim System**: Submit and review item claims with verification
- **File Upload**: Support for multiple image uploads
- **Admin Dashboard**: Manage users, items, and claims
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Notifications**: Socket.io powered notifications

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client
- **React Hook Form** - Form handling

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **Multer** - File uploads
- **Nodemailer** - Email service
- **Helmet** - Security headers
- **Rate Limiting** - API protection

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- SendGrid account (for emails)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Lost-and-found
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Create .env file (see env.example)
   cp env.example .env
   # Edit .env with your configuration
   
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   
   # Create .env file (see env.example)
   cp env.example .env
   # Edit .env with your configuration
   
   npm run dev
   ```

4. **Create Admin User**
   ```bash
   cd backend
   npm run create-admin
   ```

## 📁 Project Structure

```
Lost-and-found/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── middleware/      # Auth, upload, validation
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API endpoints
│   │   └── utils/           # Email, socket utilities
│   ├── uploads/             # File storage
│   ├── scripts/             # Admin utilities
│   └── server.js            # Main server file
├── frontend/
│   ├── src/
│   │   ├── api/             # API client functions
│   │   ├── components/      # Reusable components
│   │   ├── context/         # React context providers
│   │   ├── pages/           # Page components
│   │   ├── types/           # Type definitions
│   │   └── utils/           # Utility functions
│   └── public/              # Static assets
└── docs/                    # Documentation
```

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lostandfound?retryWrites=true&w=majority
JWT_SECRET=your_super_secure_jwt_secret_key_at_least_32_characters_long
SENDGRID_API_KEY=your_sendgrid_api_key_here
EMAIL_USER=your_verified_sender_email@domain.com
PORT=5000
NODE_ENV=development
FRONTEND_URL=https://your-frontend-domain.com
```

**Frontend (.env)**
```env
VITE_API_URL=https://backend-lost-found.onrender.com/api
VITE_BASE_URL=https://backend-lost-found.onrender.com
VITE_SOCKET_URL=https://backend-lost-found.onrender.com
```

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Items
- `GET /api/items` - Get all items with filters
- `POST /api/items` - Create new item
- `GET /api/items/:id` - Get single item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

### Chat
- `GET /api/chat/:itemId` - Get/create chat
- `POST /api/chat/:itemId` - Send message
- `GET /api/chat/user/conversations` - Get user chats

### Claims
- `POST /api/claims` - Submit claim
- `GET /api/claims/my-claims` - Get user claims
- `PUT /api/claims/:id/review` - Review claim

## 🎨 Features in Detail

### User Management
- Secure authentication with JWT
- Email verification (optional)
- Profile management
- Role-based access (user/admin)

### Item Posting
- Support for lost and found items
- Multiple image uploads
- Category classification
- Location tracking
- Contact information management

### Chat System
- Private messaging between users
- Real-time message delivery
- Message editing and deletion
- Read receipts
- Typing indicators

### Claim System
- Secure claim submission
- Document verification
- Owner review process
- Handover coordination
- Status tracking

### Admin Features
- User management
- Item moderation
- Claim oversight
- System statistics
- Content management

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Rate limiting
- Input validation
- File upload security
- XSS protection
- CSRF protection

## 🚀 Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

### Quick Deploy Options

1. **Heroku + Vercel**
   - Backend on Heroku
   - Frontend on Vercel

2. **Railway**
   - Full-stack deployment
   - Automatic deployments

3. **Docker**
   - Containerized deployment
   - Easy scaling

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📊 Performance

- Optimized image loading
- Lazy loading components
- Efficient database queries
- Caching strategies
- CDN ready

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- Check the [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for deployment help
- Review the troubleshooting section
- Open an issue for bugs or feature requests

## 🙏 Acknowledgments

- React team for the amazing framework
- MongoDB for the database
- Socket.io for real-time features
- Tailwind CSS for styling
- All contributors and users

---

**Made with ❤️ for helping people find their lost items**