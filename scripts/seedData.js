const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Donation = require('../models/Donation');
const Request = require('../models/Request');
const Inventory = require('../models/Inventory');

// Sample data
const sampleUsers = [
    // Admin user
    {
        name: 'Admin User',
        email: 'admin@bloodbank.com',
        password: 'admin123',
        role: 'admin',
        phone: '1234567890',
        bloodType: 'O+',
        dateOfBirth: new Date('1985-06-15'),
        gender: 'male',
        address: '123 Admin St, New York, NY 10001',
        isActive: true,
        isVerified: true,
        lastLogin: new Date()
    },
    // Donors
    {
        name: 'John Donor',
        email: 'john.donor@email.com',
        password: 'password123',
        role: 'donor',
        phone: '2345678901',
        bloodType: 'A+',
        dateOfBirth: new Date('1990-03-20'),
        gender: 'male',
        address: '456 Donor Ave, Los Angeles, CA 90210',
        medicalInfo: {
            weight: 70,
            lastDonation: new Date('2024-01-15'),
            medicalConditions: [],
            medications: [],
            allergies: []
        },
        isActive: true,
        isVerified: true,
        lastLogin: new Date()
    },
    {
        name: 'Sarah Wilson',
        email: 'sarah.wilson@email.com',
        password: 'password123',
        role: 'donor',
        phone: '3456789012',
        bloodType: 'B-',
        dateOfBirth: new Date('1988-11-10'),
        gender: 'female',
        address: '789 Health Blvd, Chicago, IL 60601',
        medicalInfo: {
            weight: 65,
            medicalConditions: [],
            medications: [],
            allergies: []
        },
        isActive: true,
        isVerified: true,
        lastLogin: new Date()
    },
    {
        name: 'Mike Johnson',
        email: 'mike.johnson@email.com',
        password: 'password123',
        role: 'donor',
        phone: '4567890123',
        bloodType: 'O-',
        dateOfBirth: new Date('1992-07-25'),
        gender: 'male',
        address: '321 Universal Dr, Houston, TX 77001',
        medicalInfo: {
            weight: 80,
            medicalConditions: [],
            medications: [],
            allergies: []
        },
        isActive: true,
        isVerified: true,
        lastLogin: new Date()
    },
    // Recipients
    {
        name: 'Emily Patient',
        email: 'emily.patient@email.com',
        password: 'password123',
        role: 'recipient',
        phone: '5678901234',
        bloodType: 'AB+',
        dateOfBirth: new Date('1985-12-05'),
        gender: 'female',
        address: '654 Hospital Rd, Miami, FL 33101',
        isActive: true,
        isVerified: true,
        lastLogin: new Date()
    },
    {
        name: 'David Brown',
        email: 'david.brown@email.com',
        password: 'password123',
        role: 'recipient',
        phone: '6789012345',
        bloodType: 'A-',
        dateOfBirth: new Date('1978-04-18'),
        gender: 'male',
        address: '987 Care Lane, Seattle, WA 98101',
        isActive: true,
        isVerified: true,
        lastLogin: new Date()
    }
];

const sampleDonations = [
    {
        bloodType: 'A+',
        quantity: 450,
        donationDate: new Date('2024-07-15'),
        expiryDate: new Date('2024-08-19'), // 35 days from donation date
        status: 'approved',
        location: {
            bloodBank: 'Central Blood Bank',
            address: {
                street: '100 Medical Center Dr',
                city: 'Los Angeles',
                state: 'CA',
                zipCode: '90210'
            }
        },
        medicalScreening: {
            hemoglobin: 14.5,
            bloodPressure: { systolic: 120, diastolic: 80 },
            temperature: 98.6,
            pulse: 72,
            weight: 70,
            screeningDate: new Date('2024-07-15')
        },
        isAvailable: true,
        approvalDate: new Date('2024-07-15')
    },
    {
        bloodType: 'B-',
        quantity: 450,
        donationDate: new Date('2024-07-20'),
        expiryDate: new Date('2024-08-24'), // 35 days from donation date
        status: 'approved',
        location: {
            bloodBank: 'City Blood Center',
            address: {
                street: '200 Health Ave',
                city: 'Chicago',
                state: 'IL',
                zipCode: '60601'
            }
        },
        medicalScreening: {
            hemoglobin: 13.8,
            bloodPressure: { systolic: 115, diastolic: 75 },
            temperature: 98.4,
            pulse: 68,
            weight: 65,
            screeningDate: new Date('2024-07-20')
        },
        isAvailable: true,
        approvalDate: new Date('2024-07-20')
    },
    {
        bloodType: 'O-',
        quantity: 450,
        donationDate: new Date('2024-07-25'),
        expiryDate: new Date('2024-08-29'), // 35 days from donation date
        status: 'approved',
        location: {
            bloodBank: 'Universal Blood Bank',
            address: {
                street: '300 Donor St',
                city: 'Houston',
                state: 'TX',
                zipCode: '77001'
            }
        },
        medicalScreening: {
            hemoglobin: 15.2,
            bloodPressure: { systolic: 125, diastolic: 82 },
            temperature: 98.7,
            pulse: 75,
            weight: 80,
            screeningDate: new Date('2024-07-25')
        },
        isAvailable: true,
        approvalDate: new Date('2024-07-25')
    }
];

const sampleRequests = [
    {
        bloodType: 'A+',
        quantity: 2,
        urgency: 'high',
        requiredBy: new Date('2024-08-15'),
        reason: 'Surgery preparation for cardiac procedure',
        hospital: {
            name: 'General Hospital',
            address: {
                street: '400 Hospital Way',
                city: 'Miami',
                state: 'FL',
                zipCode: '33101'
            },
            contactNumber: '7890123456'
        },
        status: 'pending'
    },
    {
        bloodType: 'O-',
        quantity: 1,
        urgency: 'critical',
        requiredBy: new Date('2024-08-05'),
        reason: 'Emergency trauma case',
        hospital: {
            name: 'Emergency Medical Center',
            address: {
                street: '500 Emergency Blvd',
                city: 'Seattle',
                state: 'WA',
                zipCode: '98101'
            },
            contactNumber: '8901234567'
        },
        status: 'approved'
    }
];

async function seedDatabase() {
    try {
        console.log('🌱 Starting database seeding...');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bloodbank', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        console.log('🧹 Clearing existing data...');
        await User.deleteMany({});
        await Donation.deleteMany({});
        await Request.deleteMany({});
        await Inventory.deleteMany({});

        // Create users
        console.log('👥 Creating users...');
        const createdUsers = [];
        
        for (const userData of sampleUsers) {
            const user = new User(userData);
            await user.save();
            createdUsers.push(user);
            console.log(`   ✓ Created ${user.role}: ${user.name}`);
        }

        // Create donations and link to donors
        console.log('🩸 Creating donations...');
        const donors = createdUsers.filter(user => user.role === 'donor');
        
        for (let i = 0; i < sampleDonations.length; i++) {
            const donationData = { ...sampleDonations[i] };
            donationData.donor = donors[i]._id;
            donationData.medicalScreening.screenedBy = createdUsers[0]._id; // Admin
            donationData.approvedBy = createdUsers[0]._id; // Admin
            
            const donation = new Donation(donationData);
            await donation.save();
            console.log(`   ✓ Created donation: ${donation.bloodType} - ${donation.quantity}ml`);
        }

        // Create requests and link to recipients
        console.log('📋 Creating blood requests...');
        const recipients = createdUsers.filter(user => user.role === 'recipient');
        
        for (let i = 0; i < sampleRequests.length; i++) {
            const requestData = { ...sampleRequests[i] };
            requestData.recipient = recipients[i]._id;
            if (requestData.status === 'approved') {
                requestData.approvedBy = createdUsers[0]._id; // Admin
                requestData.approvalDate = new Date();
            }
            
            const request = new Request(requestData);
            await request.save();
            console.log(`   ✓ Created request: ${request.bloodType} - ${request.quantity} units`);
        }

        // Initialize inventory
        console.log('📦 Initializing inventory...');
        await Inventory.initializeAllBloodTypes();
        
        // Add sample inventory data
        const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        const sampleInventoryData = {
            'A+': { availableUnits: 25, totalUnits: 30, reservedUnits: 3, expiredUnits: 2 },
            'A-': { availableUnits: 15, totalUnits: 18, reservedUnits: 2, expiredUnits: 1 },
            'B+': { availableUnits: 20, totalUnits: 24, reservedUnits: 3, expiredUnits: 1 },
            'B-': { availableUnits: 8, totalUnits: 12, reservedUnits: 2, expiredUnits: 2 },
            'AB+': { availableUnits: 12, totalUnits: 15, reservedUnits: 2, expiredUnits: 1 },
            'AB-': { availableUnits: 5, totalUnits: 8, reservedUnits: 1, expiredUnits: 2 },
            'O+': { availableUnits: 35, totalUnits: 42, reservedUnits: 5, expiredUnits: 2 },
            'O-': { availableUnits: 18, totalUnits: 22, reservedUnits: 3, expiredUnits: 1 }
        };

        for (const bloodType of bloodTypes) {
            const data = sampleInventoryData[bloodType];
            await Inventory.findOneAndUpdate(
                { bloodType },
                {
                    ...data,
                    minThreshold: 10,
                    maxCapacity: 100,
                    statistics: {
                        totalDonationsReceived: Math.floor(Math.random() * 50) + 20,
                        totalUnitsDispensed: Math.floor(Math.random() * 30) + 10,
                        totalUnitsExpired: data.expiredUnits,
                        averageShelfLife: 35
                    }
                },
                { upsert: true }
            );
            console.log(`   ✓ Updated inventory for ${bloodType}: ${data.availableUnits} units available`);
        }

        console.log('🎉 Database seeding completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`   • Users created: ${createdUsers.length}`);
        console.log(`   • Donations created: ${sampleDonations.length}`);
        console.log(`   • Requests created: ${sampleRequests.length}`);
        console.log(`   • Blood types initialized: ${bloodTypes.length}`);
        
        console.log('\n🔐 Login Credentials:');
        console.log('   Admin: admin@bloodbank.com / admin123');
        console.log('   Donor: john.donor@email.com / password123');
        console.log('   Recipient: emily.patient@email.com / password123');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        await mongoose.connection.close();
        console.log('📡 Database connection closed');
        process.exit(0);
    }
}

// Run the seeding script
if (require.main === module) {
    seedDatabase();
}

module.exports = { seedDatabase };
