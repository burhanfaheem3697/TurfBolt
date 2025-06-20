import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import turfRoutes from './routes/turfs.js';
import bookingRoutes from './routes/bookings.js';
import { Turf } from './models/Turf.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/turfs', turfRoutes);
app.use('/api/bookings', bookingRoutes);

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/turfbooking', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
    
    // Seed database with sample data if empty
    const count = await Turf.countDocuments();
    if (count === 0) {
      await seedDatabase();
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Seed database with sample turfs
const seedDatabase = async () => {
  try {
    const sampleTurfs = [
      {
        name: 'Green Valley Sports Arena',
        location: 'Whitefield, Bangalore',
        coordinates: { lat: 12.9698, lng: 77.7500 },
        description: 'Premium football turf with state-of-the-art facilities and professional lighting for night games.',
        pricePerHour: 1200,
        capacity: 22,
        amenities: ['Parking', 'Lighting', 'Wifi', 'Changing Room', 'Water'],
        images: ['https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg'],
        rating: 4.8,
        totalReviews: 156,
        availability: []
      },
      {
        name: 'Champions Football Club',
        location: 'Koramangala, Bangalore',
        coordinates: { lat: 12.9279, lng: 77.6271 },
        description: 'Professional-grade artificial turf perfect for competitive matches and training sessions.',
        pricePerHour: 1500,
        capacity: 20,
        amenities: ['Parking', 'Lighting', 'Cafe', 'Equipment Rental'],
        images: ['https://images.pexels.com/photos/1171084/pexels-photo-1171084.jpeg'],
        rating: 4.6,
        totalReviews: 89,
        availability: []
      },
      {
        name: 'Urban Sports Complex',
        location: 'Indiranagar, Bangalore',
        coordinates: { lat: 12.9716, lng: 77.6412 },
        description: 'Multi-sport facility with premium football turf, perfect for casual games and tournaments.',
        pricePerHour: 800,
        capacity: 18,
        amenities: ['Parking', 'Changing Room', 'Water', 'First Aid'],
        images: ['https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg'],
        rating: 4.4,
        totalReviews: 203,
        availability: []
      },
      {
        name: 'Elite Turf Arena',
        location: 'HSR Layout, Bangalore',
        coordinates: { lat: 12.9081, lng: 77.6476 },
        description: 'Newly renovated football turf with excellent drainage and FIFA-approved artificial grass.',
        pricePerHour: 1000,
        capacity: 24,
        amenities: ['Parking', 'Lighting', 'Wifi', 'Spectator Seating'],
        images: ['https://images.pexels.com/photos/163452/basketball-dunk-blue-game-163452.jpeg'],
        rating: 4.9,
        totalReviews: 67,
        availability: []
      },
      {
        name: 'SportZone Premier',
        location: 'Electronic City, Bangalore',
        coordinates: { lat: 12.8456, lng: 77.6603 },
        description: 'Community-focused turf with affordable rates and flexible booking options for all skill levels.',
        pricePerHour: 600,
        capacity: 16,
        amenities: ['Parking', 'Water', 'Basic Lighting'],
        images: ['https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg'],
        rating: 4.2,
        totalReviews: 134,
        availability: []
      },
      {
        name: 'Victory Sports Ground',
        location: 'Marathahalli, Bangalore',
        coordinates: { lat: 12.9563, lng: 77.6969 },
        description: 'Large football turf suitable for tournaments and corporate events with professional amenities.',
        pricePerHour: 1800,
        capacity: 26,
        amenities: ['Parking', 'Lighting', 'Cafe', 'Equipment Rental', 'Locker Room'],
        images: ['https://images.pexels.com/photos/159740/football-capture-ball-sport-159740.jpeg'],
        rating: 4.7,
        totalReviews: 98,
        availability: []
      }
    ];

    await Turf.insertMany(sampleTurfs);
    console.log('Sample turfs inserted successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

// Connect to database and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

export default app;