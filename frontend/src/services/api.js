const API_BASE_URL = 'http://localhost:3001/api';

class TurfService {
  async getAllTurfs() {
    try {
      const response = await fetch(`${API_BASE_URL}/turfs`);
      if (!response.ok) throw new Error('Failed to fetch turfs');
      return await response.json();
    } catch (error) {
      console.error('Error fetching turfs:', error);
      // Return mock data for development
      return this.getMockTurfs();
    }
  }

  async getTurfById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/turfs/${id}`);
      if (!response.ok) throw new Error('Failed to fetch turf');
      return await response.json();
    } catch (error) {
      console.error('Error fetching turf:', error);
      throw error;
    }
  }

  async createBooking(bookingData) {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });
      if (!response.ok) throw new Error('Failed to create booking');
      return await response.json();
    } catch (error) {
      console.error('Error creating booking:', error);
      // Return mock booking for development
      return {
        _id: Math.random().toString(36).substr(2, 9),
        ...bookingData,
        status: 'confirmed',
        totalPrice: 800,
        createdAt: new Date().toISOString()
      };
    }
  }

  async searchTurfs(query) {
    try {
      const response = await fetch(`${API_BASE_URL}/turfs/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Failed to search turfs');
      return await response.json();
    } catch (error) {
      console.error('Error searching turfs:', error);
      return [];
    }
  }

  // Mock data for development
  getMockTurfs() {
    return [
      {
        _id: '1',
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
        availability: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      },
      {
        _id: '2',
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
        availability: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      },
      {
        _id: '3',
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
        availability: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      },
      {
        _id: '4',
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
        availability: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      },
      {
        _id: '5',
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
        availability: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      },
      {
        _id: '6',
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
        availability: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
    ];
  }
}

export const turfService = new TurfService();