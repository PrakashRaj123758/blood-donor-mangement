// Contact Form API Routes for Blood Bank Management System

const express = require('express');
const router = express.Router();
const EmailService = require('../utils/emailService');

// Initialize email service
const emailService = new EmailService();

// POST /api/contact - Handle contact form submission
router.post('/contact', async (req, res) => {
    try {
        const { name, email, phone, subject, message, urgent } = req.body;

        // Validate required fields
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'Please fill in all required fields'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid email address'
            });
        }

        // Validate message length
        if (message.length < 10) {
            return res.status(400).json({
                success: false,
                message: 'Message must be at least 10 characters long'
            });
        }

        // Prepare contact data
        const contactData = {
            name: name.trim(),
            email: email.trim(),
            phone: phone ? phone.trim() : '',
            subject: subject.trim(),
            message: message.trim(),
            urgent: urgent === 'true' || urgent === true,
            submittedAt: new Date()
        };

        // Send email notification
        const emailSent = await emailService.sendContactFormEmail(contactData);

        if (!emailSent) {
            console.error('Failed to send contact form email');
            // Still return success to user, but log the error
        }

        // Log the contact submission
        console.log('📧 Contact form submission:', {
            name: contactData.name,
            email: contactData.email,
            subject: contactData.subject,
            urgent: contactData.urgent,
            timestamp: contactData.submittedAt
        });

        res.json({
            success: true,
            message: 'Thank you for your message! We will get back to you soon.',
            data: {
                submittedAt: contactData.submittedAt,
                urgent: contactData.urgent
            }
        });

    } catch (error) {
        console.error('Contact form submission error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit contact form. Please try again.'
        });
    }
});

// GET /api/contact/test - Test contact form functionality
router.get('/test', async (req, res) => {
    try {
        // Test email service
        const testEmailSent = await emailService.testEmailService();

        res.json({
            success: true,
            message: 'Contact form test completed',
            data: {
                emailService: testEmailSent ? 'Working' : 'Not configured',
                timestamp: new Date()
            }
        });

    } catch (error) {
        console.error('Contact form test error:', error);
        res.status(500).json({
            success: false,
            message: 'Contact form test failed',
            error: error.message
        });
    }
});

// GET /api/contact/status - Get contact form status
router.get('/status', (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Contact form is operational',
            data: {
                emailService: 'Available',
                timestamp: new Date(),
                endpoints: {
                    submit: 'POST /api/contact',
                    test: 'GET /api/contact/test',
                    status: 'GET /api/contact/status'
                }
            }
        });

    } catch (error) {
        console.error('Contact status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get contact form status'
        });
    }
});

module.exports = router; 