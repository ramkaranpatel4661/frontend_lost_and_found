# 🚀 Lost and Found - Deployment Guide

This guide will help you deploy your Lost and Found application to production.

## 📋 Prerequisites

- Node.js 18+ installed
- Git installed
- MongoDB Atlas account (or other MongoDB provider)
- SendGrid account (for email functionality)
- Domain name (optional but recommended)

## 🔧 Environment Setup

### 1. Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lostandfound?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_at_least_32_characters_long

# Email Configuration (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key_here
EMAIL_USER=your_verified_sender_email@domain.com

# Server Configuration
PORT=5000
NODE_ENV=production

# CORS Configuration
FRONTEND_URL=https://your-frontend-domain.com

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
```

### 2. Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

```env
# API Configuration
VITE_API_URL=https://your-backend-domain.com/api

# Socket Configuration
VITE_SOCKET_URL=https://your-backend-domain.com

# App Configuration
VITE_APP_NAME=Lost and Found
VITE_APP_VERSION=1.0.0
```

## 🌐 Database Setup (MongoDB Atlas)

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account

2. **Create Cluster**
   - Choose "Shared" (free tier)
   - Select your preferred cloud provider and region
   - Click "Create"

3. **Set Up Database Access**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Create a username and password
   - Select "Read and write to any database"
   - Click "Add User"

4. **Set Up Network Access**
   - Go to "Network Access"
   - Click "Add IP Address"
   - For production, add `0.0.0.0/0` (allows all IPs)
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Clusters"
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `lostandfound`

## 📧 Email Setup (SendGrid)

1. **Create SendGrid Account**
   - Go to [SendGrid](https://sendgrid.com/)
   - Sign up for a free account

2. **Verify Sender Email**
   - Go to "Settings" > "Sender Authentication"
   - Verify your sender email address

3. **Create API Key**
   - Go to "Settings" > "API Keys"
   - Click "Create API Key"
   - Choose "Restricted Access" > "Mail Send"
   - Copy the API key

## 🚀 Deployment Options

### Option 1: Heroku Deployment

#### Backend Deployment

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create Heroku App**
   ```bash
   cd backend
   heroku create your-app-name-backend
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set MONGODB_URI="your_mongodb_connection_string"
   heroku config:set JWT_SECRET="your_jwt_secret"
   heroku config:set SENDGRID_API_KEY="your_sendgrid_api_key"
   heroku config:set EMAIL_USER="your_email@domain.com"
   heroku config:set NODE_ENV="production"
   heroku config:set FRONTEND_URL="https://your-frontend-domain.com"
   ```

5. **Deploy**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

#### Frontend Deployment (Vercel)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy to Vercel**
   ```bash
   cd frontend
   vercel
   ```

3. **Set Environment Variables in Vercel Dashboard**
   - Go to your project settings
   - Add environment variables:
     - `VITE_API_URL`: Your Heroku backend URL
     - `VITE_SOCKET_URL`: Your Heroku backend URL

### Option 2: Docker Deployment

1. **Build and Run with Docker Compose**
   ```bash
   # Update environment variables in docker-compose.yml
   docker-compose up -d
   ```

2. **For Production with Nginx**
   ```bash
   docker-compose --profile production up -d
   ```

### Option 3: Railway Deployment

1. **Connect GitHub Repository**
   - Go to [Railway](https://railway.app/)
   - Connect your GitHub account
   - Import your repository

2. **Set Environment Variables**
   - Add all required environment variables in Railway dashboard

3. **Deploy**
   - Railway will automatically deploy on push to main branch

## 🔒 Security Checklist

- [ ] Use HTTPS in production
- [ ] Set secure JWT secret (32+ characters)
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Use environment variables for sensitive data
- [ ] Enable helmet security headers
- [ ] Validate file uploads
- [ ] Set up proper error handling

## 🧪 Testing Deployment

1. **Test Backend Health**
   ```bash
   curl https://your-backend-domain.com/api/health
   ```

2. **Test Frontend**
   - Visit your frontend URL
   - Test user registration/login
   - Test item posting
   - Test chat functionality
   - Test file uploads

3. **Test Email Functionality**
   - Register a new user
   - Verify email is sent

## 📊 Monitoring

1. **Set up logging**
   - Use Heroku logs: `heroku logs --tail`
   - Or Railway logs in dashboard

2. **Monitor performance**
   - Use Heroku metrics
   - Set up uptime monitoring

## 🔧 Post-Deployment Setup

1. **Create Admin User**
   ```bash
   # For Heroku
   heroku run npm run create-admin
   
   # For Docker
   docker exec -it lost-found-backend npm run create-admin
   ```

2. **Verify Database Connection**
   - Check logs for successful MongoDB connection
   - Verify collections are created

3. **Test All Features**
   - User registration/login
   - Item posting
   - Chat functionality
   - File uploads
   - Admin dashboard

## 🆘 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check `FRONTEND_URL` environment variable
   - Verify CORS configuration in server.js

2. **Database Connection Issues**
   - Check MongoDB Atlas network access
   - Verify connection string format
   - Check database user permissions

3. **File Upload Issues**
   - Check upload directory permissions
   - Verify file size limits
   - Check file type validation

4. **Email Not Sending**
   - Verify SendGrid API key
   - Check sender email verification
   - Review SendGrid logs

### Getting Help

- Check application logs
- Review error messages
- Test endpoints individually
- Verify environment variables

## 📈 Scaling Considerations

- Use MongoDB Atlas M10+ for production
- Consider CDN for file storage (AWS S3, Cloudinary)
- Set up load balancing for high traffic
- Implement caching (Redis)
- Monitor performance metrics

---

**Need help?** Check the logs and error messages for specific issues. Most deployment problems are related to environment variables or network configuration.