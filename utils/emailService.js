// Email Service for Blood Bank Management System

const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
        this.transporter = null;
        this.initialize();
    }

    initialize() {
        // Configure email transporter
            this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: false, // true for 465, false for other ports
      auth: {
                user: process.env.SMTP_USER || 'your-email@gmail.com',
                pass: process.env.SMTP_PASS || 'your-app-password'
            }
        });

        console.log('📧 Email service initialized');
    }

    // Send welcome email to new users
    async sendWelcomeEmail(user) {
        try {
            const mailOptions = {
                from: `"Blood Bank System" <${process.env.SMTP_USER}>`,
                to: user.email,
                subject: 'Welcome to Blood Bank Management System',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #3b82f6;">Welcome to Blood Bank Management System!</h2>
                        <p>Hello ${user.name},</p>
                        <p>Thank you for joining our blood bank community. Your registration has been successful!</p>
                        
                        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #1f2937; margin-top: 0;">Your Account Details:</h3>
                            <p><strong>Name:</strong> ${user.name}</p>
                            <p><strong>Email:</strong> ${user.email}</p>
                            <p><strong>Role:</strong> ${user.role}</p>
                            <p><strong>Blood Type:</strong> ${user.bloodType || 'Not specified'}</p>
                        </div>
                        
                        <p>You can now:</p>
                        <ul>
                            <li>Schedule blood donations (if you're a donor)</li>
                            <li>Request blood when needed (if you're a recipient)</li>
                            <li>Track your donation/request history</li>
                            <li>Update your profile information</li>
                        </ul>
                        
                        <p>If you have any questions, please don't hesitate to contact us.</p>
                        
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                            <p style="color: #6b7280; font-size: 14px;">
                                Best regards,<br>
                                Blood Bank Management Team
                            </p>
                        </div>
                    </div>
                `
            };

            await this.transporter.sendMail(mailOptions);
            console.log('✅ Welcome email sent to:', user.email);
            return true;
        } catch (error) {
            console.error('❌ Failed to send welcome email:', error);
            return false;
        }
    }

    // Send donation confirmation email
    async sendDonationConfirmation(donation, user) {
        try {
    const mailOptions = {
                from: `"Blood Bank System" <${process.env.SMTP_USER}>`,
                to: user.email,
                subject: 'Blood Donation Confirmation',
      html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #10b981;">Thank You for Your Donation!</h2>
                        <p>Hello ${user.name},</p>
                        <p>Your blood donation has been successfully scheduled and confirmed.</p>
                        
                        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
                            <h3 style="color: #065f46; margin-top: 0;">Donation Details:</h3>
                            <p><strong>Blood Type:</strong> ${donation.bloodType}</p>
                            <p><strong>Quantity:</strong> ${donation.quantity} units</p>
                            <p><strong>Date:</strong> ${new Date(donation.donationDate).toLocaleDateString()}</p>
                            <p><strong>Location:</strong> ${donation.location?.bloodBank || 'TBD'}</p>
                            <p><strong>Status:</strong> ${donation.status}</p>
                        </div>
                        
                        <p><strong>Important Reminders:</strong></p>
                        <ul>
                            <li>Please arrive 15 minutes before your scheduled time</li>
                            <li>Bring a valid ID with you</li>
                            <li>Stay hydrated and eat a light meal before donating</li>
                            <li>You must be in good health on the day of donation</li>
        </ul>
                        
                        <p>Your donation can save up to 3 lives. Thank you for making a difference!</p>
                        
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                            <p style="color: #6b7280; font-size: 14px;">
                                Best regards,<br>
                                Blood Bank Management Team
                            </p>
                        </div>
                    </div>
                `
            };

            await this.transporter.sendMail(mailOptions);
            console.log('✅ Donation confirmation email sent to:', user.email);
            return true;
        } catch (error) {
            console.error('❌ Failed to send donation confirmation email:', error);
            return false;
        }
    }

    // Send request status update email
    async sendRequestStatusUpdate(request, user) {
        try {
            const statusColors = {
                'pending': '#f59e0b',
                'approved': '#3b82f6',
                'fulfilled': '#10b981',
                'rejected': '#ef4444'
            };

    const mailOptions = {
                from: `"Blood Bank System" <${process.env.SMTP_USER}>`,
                to: user.email,
                subject: `Blood Request ${request.status.charAt(0).toUpperCase() + request.status.slice(1)}`,
      html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: ${statusColors[request.status] || '#3b82f6'};">Blood Request Update</h2>
                        <p>Hello ${user.name},</p>
                        <p>Your blood request status has been updated.</p>
                        
                        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${statusColors[request.status] || '#3b82f6'};">
                            <h3 style="color: #1f2937; margin-top: 0;">Request Details:</h3>
                            <p><strong>Blood Type:</strong> ${request.bloodType}</p>
                            <p><strong>Quantity:</strong> ${request.quantity} units</p>
                            <p><strong>Urgency:</strong> ${request.urgency}</p>
                            <p><strong>Status:</strong> <span style="color: ${statusColors[request.status] || '#3b82f6'}; font-weight: bold;">${request.status.toUpperCase()}</span></p>
                            <p><strong>Request Date:</strong> ${new Date(request.createdAt).toLocaleDateString()}</p>
                        </div>
                        
                        ${request.status === 'approved' ? `
                            <p><strong>Next Steps:</strong></p>
                            <ul>
                                <li>We will contact you within 24 hours to arrange pickup</li>
                                <li>Please have your ID ready for verification</li>
                                <li>Bring any required medical documentation</li>
                            </ul>
                        ` : ''}
                        
                        ${request.status === 'rejected' ? `
                            <p><strong>Note:</strong> Your request was not approved at this time. This could be due to:</p>
                            <ul>
                                <li>Current blood supply limitations</li>
                                <li>Missing required documentation</li>
                                <li>Incomplete request information</li>
        </ul>
                            <p>Please contact us for more information or to submit a new request.</p>
                        ` : ''}
                        
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                            <p style="color: #6b7280; font-size: 14px;">
                                Best regards,<br>
                                Blood Bank Management Team
                            </p>
                        </div>
                    </div>
                `
            };

            await this.transporter.sendMail(mailOptions);
            console.log('✅ Request status update email sent to:', user.email);
            return true;
        } catch (error) {
            console.error('❌ Failed to send request status update email:', error);
            return false;
        }
    }

    // Send contact form submission email
    async sendContactFormEmail(contactData) {
        try {
    const mailOptions = {
                from: `"Blood Bank System" <${process.env.SMTP_USER}>`,
                to: process.env.ADMIN_EMAIL || 'admin@bloodbank.com',
                subject: `Contact Form Submission - ${contactData.subject}`,
      html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #3b82f6;">New Contact Form Submission</h2>
                        
                        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #1f2937; margin-top: 0;">Contact Information:</h3>
                            <p><strong>Name:</strong> ${contactData.name}</p>
                            <p><strong>Email:</strong> ${contactData.email}</p>
                            <p><strong>Phone:</strong> ${contactData.phone || 'Not provided'}</p>
                            <p><strong>Subject:</strong> ${contactData.subject}</p>
                            <p><strong>Urgent:</strong> ${contactData.urgent ? 'Yes' : 'No'}</p>
                        </div>
                        
                        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #0c4a6e; margin-top: 0;">Message:</h3>
                            <p style="white-space: pre-wrap;">${contactData.message}</p>
                        </div>
                        
                        <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
                        
                        ${contactData.urgent ? `
                            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                                <p style="color: #92400e; margin: 0; font-weight: bold;">⚠️ URGENT MATTER - Requires immediate attention!</p>
                            </div>
                        ` : ''}
                    </div>
                `
            };

            await this.transporter.sendMail(mailOptions);
            console.log('✅ Contact form email sent to admin');
            return true;
        } catch (error) {
            console.error('❌ Failed to send contact form email:', error);
            return false;
        }
    }

    // Send low stock alert email
    async sendLowStockAlert(inventoryItem) {
        try {
    const mailOptions = {
                from: `"Blood Bank System" <${process.env.SMTP_USER}>`,
                to: process.env.ADMIN_EMAIL || 'admin@bloodbank.com',
                subject: `Low Stock Alert - ${inventoryItem.bloodType}`,
      html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #ef4444;">⚠️ Low Stock Alert</h2>
                        
                        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
                            <h3 style="color: #991b1b; margin-top: 0;">Inventory Alert:</h3>
                            <p><strong>Blood Type:</strong> ${inventoryItem.bloodType}</p>
                            <p><strong>Available Units:</strong> ${inventoryItem.availableUnits}</p>
                            <p><strong>Minimum Threshold:</strong> ${inventoryItem.minThreshold || 10}</p>
                            <p><strong>Status:</strong> ${inventoryItem.availableUnits <= (inventoryItem.minThreshold || 10) ? 'CRITICAL' : 'LOW'}</p>
                        </div>
                        
                        <p><strong>Action Required:</strong></p>
                        <ul>
                            <li>Schedule additional donation drives</li>
                            <li>Contact regular donors</li>
                            <li>Update inventory management</li>
                            <li>Consider emergency procurement</li>
        </ul>
                        
                        <p><strong>Alert Time:</strong> ${new Date().toLocaleString()}</p>
                    </div>
                `
            };

            await this.transporter.sendMail(mailOptions);
            console.log('✅ Low stock alert email sent');
            return true;
        } catch (error) {
            console.error('❌ Failed to send low stock alert email:', error);
            return false;
        }
    }

    // Send password reset email
    async sendPasswordResetEmail(user, resetToken) {
        try {
            const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/reset-password?token=${resetToken}`;
            
            const mailOptions = {
                from: `"Blood Bank System" <${process.env.SMTP_USER}>`,
                to: user.email,
                subject: 'Password Reset Request',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #3b82f6;">Password Reset Request</h2>
                        <p>Hello ${user.name},</p>
                        <p>You have requested to reset your password for the Blood Bank Management System.</p>
                        
                        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                            <a href="${resetUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                                Reset Password
                            </a>
                        </div>
                        
                        <p><strong>Important:</strong></p>
                        <ul>
                            <li>This link will expire in 1 hour</li>
                            <li>If you didn't request this, please ignore this email</li>
                            <li>For security, this link can only be used once</li>
                        </ul>
                        
                        <p>If the button doesn't work, copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; color: #6b7280; font-size: 14px;">${resetUrl}</p>
                        
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                            <p style="color: #6b7280; font-size: 14px;">
                                Best regards,<br>
                                Blood Bank Management Team
                            </p>
                        </div>
                    </div>
                `
            };

            await this.transporter.sendMail(mailOptions);
            console.log('✅ Password reset email sent to:', user.email);
            return true;
        } catch (error) {
            console.error('❌ Failed to send password reset email:', error);
            return false;
        }
    }

    // Test email service
    async testEmailService() {
        try {
            const mailOptions = {
                from: `"Blood Bank System" <${process.env.SMTP_USER}>`,
                to: process.env.SMTP_USER,
                subject: 'Email Service Test',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #10b981;">Email Service Test</h2>
                        <p>This is a test email to verify that the email service is working correctly.</p>
                        <p><strong>Test Time:</strong> ${new Date().toLocaleString()}</p>
                        <p>If you receive this email, the email service is configured correctly.</p>
                    </div>
                `
            };

            await this.transporter.sendMail(mailOptions);
            console.log('✅ Email service test successful');
            return true;
        } catch (error) {
            console.error('❌ Email service test failed:', error);
            return false;
        }
    }
}

module.exports = EmailService;
