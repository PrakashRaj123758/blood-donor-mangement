# 🚀 Deployment Guide: Blood Bank Management System on Render

## 📋 Prerequisites

1. **GitHub Account** - Your code should be in a GitHub repository
2. **Render Account** - Sign up at [render.com](https://render.com)
3. **MongoDB Atlas Account** - For cloud database
4. **Email Service** - Gmail or other SMTP service

## 🔧 Step 1: Prepare Your Repository

### 1.1 Push to GitHub
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

### 1.2 Verify Files
Ensure these files are in your repository:
- ✅ `package.json`
- ✅ `server.js`
- ✅ `render.yaml`
- ✅ `Dockerfile`
- ✅ `.dockerignore`
- ✅ All source code files

## 🌐 Step 2: Set Up MongoDB Atlas

### 2.1 Create MongoDB Atlas Cluster
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free cluster
3. Set up database access (username/password)
4. Set up network access (allow all IPs: 0.0.0.0/0)
5. Get your connection string

### 2.2 Connection String Format
```
mongodb+srv://username:password@cluster.mongodb.net/bloodbank?retryWrites=true&w=majority
```

## 📧 Step 3: Set Up Email Service

### 3.1 Gmail Setup (Recommended)
1. Enable 2-factor authentication on your Gmail
2. Generate an App Password
3. Use your Gmail address and app password

### 3.2 Other Email Services
- **SendGrid**: Create account and get API key
- **Mailgun**: Create account and get API key
- **AWS SES**: Set up AWS account and get credentials

## 🚀 Step 4: Deploy on Render

### 4.1 Create New Web Service
1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select your repository

### 4.2 Configure Service Settings
```
Name: blood-bank-management-system
Environment: Node
Region: Choose closest to your users
Branch: main
Build Command: npm install
Start Command: npm start
```

### 4.3 Set Environment Variables
Click **"Environment"** tab and add these variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Environment mode |
| `PORT` | `10000` | Port number |
| `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB connection string |
| `JWT_SECRET` | `your-super-secret-jwt-key` | JWT signing secret |
| `EMAIL_USER` | `your-email@gmail.com` | Email service username |
| `EMAIL_PASS` | `your-app-password` | Email service password |

### 4.4 Advanced Settings
- **Health Check Path**: `/api/status`
- **Auto-Deploy**: Enabled
- **Plan**: Free (or choose paid for better performance)

### 4.5 Deploy
1. Click **"Create Web Service"**
2. Wait for build to complete (5-10 minutes)
3. Your app will be available at: `https://your-app-name.onrender.com`

## 🗄️ Step 5: Initialize Database

### 5.1 Run Seed Script
After deployment, you need to populate the database:

1. **Option A: Via Render Shell**
   - Go to your service dashboard
   - Click **"Shell"** tab
   - Run: `node scripts/seedData.js`

2. **Option B: Via API Endpoint**
   - Create a temporary endpoint to run seeding
   - Call: `POST /api/admin/seed` (if implemented)

### 5.2 Verify Data
Check if these users are created:
- **Admin**: `admin@bloodbank.com` / `admin123`
- **Donor**: `donor@example.com` / `password123`
- **Recipient**: `recipient@example.com` / `password123`

## 🔍 Step 6: Testing Your Deployment

### 6.1 Health Check
Visit: `https://your-app-name.onrender.com/api/status`
Should return: `{"success": true, "message": "Blood Bank Management System is operational"}`

### 6.2 Test Login
1. Go to your app URL
2. Try logging in with admin credentials
3. Test all dashboard features

### 6.3 Test Email
1. Register a new user
2. Check if welcome email is sent
3. Test password reset functionality

## 🛠️ Step 7: Troubleshooting

### Common Issues

#### 1. Build Fails
**Error**: `npm install` fails
**Solution**: 
- Check `package.json` for correct dependencies
- Ensure all files are committed to GitHub
- Check Render logs for specific error

#### 2. Database Connection Fails
**Error**: MongoDB connection timeout
**Solution**:
- Verify MongoDB Atlas network access (0.0.0.0/0)
- Check connection string format
- Ensure database user has correct permissions

#### 3. Email Not Working
**Error**: Email sending fails
**Solution**:
- Verify email credentials
- Check if 2FA is enabled for Gmail
- Use app password instead of regular password

#### 4. App Crashes
**Error**: Application crashes on startup
**Solution**:
- Check Render logs for error details
- Verify all environment variables are set
- Ensure port configuration is correct

### Debug Commands
```bash
# Check Render logs
# Go to your service dashboard → Logs tab

# Test database connection
curl https://your-app-name.onrender.com/api/status

# Check environment variables
# Go to Environment tab in Render dashboard
```

## 🔄 Step 8: Continuous Deployment

### Automatic Updates
- Every push to `main` branch triggers automatic deployment
- Monitor deployment status in Render dashboard
- Check logs for any issues

### Manual Deployment
- Go to your service dashboard
- Click **"Manual Deploy"**
- Select branch to deploy

## 📊 Step 9: Monitoring

### Render Dashboard
- **Logs**: Real-time application logs
- **Metrics**: CPU, memory usage
- **Events**: Deployment history

### Health Monitoring
- Set up uptime monitoring
- Configure alerts for downtime
- Monitor database performance

## 🔒 Step 10: Security

### Environment Variables
- Never commit sensitive data to Git
- Use Render's environment variable feature
- Rotate secrets regularly

### Database Security
- Use strong passwords
- Enable MongoDB Atlas security features
- Regular backups

## 🎉 Success!

Your Blood Bank Management System is now live at:
`https://your-app-name.onrender.com`

### Default Admin Credentials
- **Email**: `admin@bloodbank.com`
- **Password**: `admin123`

### Next Steps
1. Update DNS if you have a custom domain
2. Set up monitoring and alerts
3. Configure backups
4. Test all features thoroughly

## 📞 Support

If you encounter issues:
1. Check Render documentation
2. Review application logs
3. Verify environment variables
4. Test locally first

---

**Happy Deploying! 🚀** 