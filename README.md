# 🩸 Blood Bank Management System

A comprehensive full-stack web application for managing blood donations, requests, and inventory with real-time analytics and advanced features.

## 🚀 Features

### 👥 User Management & Authentication
- **User Registration & Login**: Secure authentication with JWT tokens
- **Role-Based Access Control**: Donor, Recipient, and Admin roles
- **Profile Management**: Complete user profile with editable information
- **Password Security**: Bcrypt hashing for secure password storage
- **Email Verification**: Welcome emails and notifications

### 🏥 Core Blood Bank Features
- **Blood Donation Management**: Schedule, track, and manage donations
- **Blood Request System**: Submit and track blood requests
- **Inventory Management**: Real-time blood stock tracking
- **Status Tracking**: Monitor donation and request statuses
- **Eligibility Checking**: Automatic donor eligibility verification

### 📊 Advanced Analytics & Dashboard
- **Real-Time Analytics**: Live charts and statistics
- **Performance Monitoring**: System performance metrics
- **Data Visualization**: Interactive charts using Chart.js
- **Report Generation**: Export analytics in JSON, CSV, and HTML formats
- **Admin Dashboard**: Comprehensive admin overview with key metrics

### 🔔 Notification System
- **Real-Time Notifications**: In-app notification system
- **Email Notifications**: Automated email alerts
- **Urgent Alerts**: Emergency notification handling
- **Low Stock Alerts**: Automatic inventory alerts
- **Status Updates**: Real-time status change notifications

### 📞 Contact & Communication
- **Contact Form**: Professional contact page with form validation
- **Emergency Contact**: Prominent emergency hotline display
- **Email Integration**: Contact form email notifications
- **Multiple Contact Methods**: Phone, email, and location information

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-friendly interface
- **Modern Styling**: Clean, professional appearance
- **Interactive Elements**: Hover effects and animations
- **Accessibility**: Screen reader friendly
- **Loading States**: User feedback during operations

## 🛠️ Technology Stack

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with Flexbox and Grid
- **JavaScript (ES6+)**: Vanilla JS with modular architecture
- **Chart.js**: Data visualization
- **Font Awesome**: Icons

### Backend
- **Node.js**: Server runtime
- **Express.js**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: ODM for MongoDB
- **JWT**: Authentication tokens
- **Bcrypt**: Password hashing
- **Nodemailer**: Email service

### Development Tools
- **Helmet**: Security middleware
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: API protection
- **Logging**: Comprehensive logging system

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd blood-bank-management-system
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/bloodbank
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bloodbank

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ADMIN_EMAIL=admin@bloodbank.com

# Client Configuration
CLIENT_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5000
```

### 4. Database Setup
```bash
# Start MongoDB (if using local)
mongod

# Seed initial data (optional)
npm run seed
```

### 5. Start the Application
```bash
# Development mode
npm start

# Production mode
npm run start:prod
```

### 6. Access the Application
Open your browser and navigate to:
```
http://localhost:5000
```

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/change-password` - Change password
- `GET /api/users/statistics/summary` - User statistics

### Donations
- `GET /api/donations` - Get all donations
- `POST /api/donations` - Create donation
- `PUT /api/donations/:id` - Update donation
- `DELETE /api/donations/:id` - Delete donation

### Requests
- `GET /api/requests` - Get all requests
- `POST /api/requests` - Create request
- `PUT /api/requests/:id` - Update request
- `DELETE /api/requests/:id` - Delete request

### Inventory
- `GET /api/inventory` - Get inventory
- `POST /api/inventory` - Add inventory item
- `PUT /api/inventory/:id` - Update inventory
- `DELETE /api/inventory/:id` - Delete inventory

### Admin
- `GET /api/admin/dashboard` - Admin dashboard data
- `GET /api/admin/analytics/donations` - Donation analytics
- `GET /api/admin/analytics/requests` - Request analytics
- `GET /api/admin/analytics/inventory` - Inventory analytics
- `GET /api/admin/analytics/users` - User analytics
- `GET /api/admin/performance` - Performance metrics

### Contact
- `POST /api/contact/contact` - Submit contact form
- `GET /api/contact/test` - Test contact functionality
- `GET /api/contact/status` - Contact form status

## 🎯 User Roles & Permissions

### 👤 Donor
- Register and manage profile
- Schedule blood donations
- View donation history
- Check eligibility status
- Receive donation confirmations

### 🏥 Recipient
- Register and manage profile
- Submit blood requests
- Track request status
- View request history
- Receive status updates

### 👨‍💼 Admin
- Manage all users
- Approve/reject requests
- Update inventory
- View analytics dashboard
- Monitor system performance
- Handle contact form submissions

## 📊 Analytics Features

### Real-Time Dashboard
- Total users, donations, and requests
- Blood type distribution
- Recent activity feed
- Performance metrics
- Low stock alerts

### Data Visualization
- Bar charts for inventory
- Line charts for trends
- Doughnut charts for distributions
- Radar charts for performance
- Interactive chart updates

### Export Capabilities
- JSON format export
- CSV format export
- HTML format (for PDF generation)
- Comprehensive reports

## 🔔 Notification System

### In-App Notifications
- Real-time notification display
- Notification badges
- Mark as read functionality
- Notification history
- Custom notification types

### Email Notifications
- Welcome emails
- Donation confirmations
- Request status updates
- Low stock alerts
- Contact form submissions

## 📞 Contact System

### Contact Form
- Form validation
- Real-time error checking
- Loading states
- Success/error feedback
- Urgent matter flagging

### Emergency Contact
- Prominent emergency hotline
- 24/7 availability notice
- Click-to-call functionality
- Emergency banner display

## 🚀 Deployment

### Local Development
```bash
npm start
```

### Production Deployment
1. Set environment variables
2. Configure database connection
3. Set up email service
4. Deploy to hosting platform (Render, Heroku, etc.)

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
SMTP_USER=your-production-email
SMTP_PASS=your-production-email-password
```

## 🔧 Configuration

### Email Service Setup
1. Create Gmail app password
2. Configure SMTP settings in `.env`
3. Test email functionality

### Database Configuration
- Local MongoDB: Install and start MongoDB service
- MongoDB Atlas: Create cluster and get connection string

### Security Settings
- JWT secret key generation
- Rate limiting configuration
- CORS settings
- Helmet security headers

## 📈 Performance Features

### Monitoring
- API response time tracking
- Page load time monitoring
- Memory usage tracking
- Error rate monitoring
- User activity tracking

### Optimization
- Database query optimization
- Frontend asset optimization
- Caching strategies
- Lazy loading implementation

## 🧪 Testing

### Manual Testing
- User registration and login
- Donation and request workflows
- Admin dashboard functionality
- Contact form submission
- Email notifications

### API Testing
```bash
# Test contact form
curl -X POST http://localhost:5000/api/contact/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","subject":"Test","message":"Test message"}'

# Test analytics
curl -X GET http://localhost:5000/api/admin/analytics/donations
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Email: support@bloodbank.com
- Emergency: +1 (555) 911-0000
- Contact Form: Available on the website

## 🔮 Future Enhancements

- Google Maps integration for location services
- Mobile app development
- Advanced reporting features
- Integration with hospital systems
- Blood compatibility checking
- Donor matching algorithms

---

**Built with ❤️ for saving lives through efficient blood bank management.** 