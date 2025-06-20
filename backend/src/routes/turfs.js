import express from 'express';
import { Turf } from '../models/Turf.js';

const router = express.Router();

// Get all turfs
router.get('/', async (req, res) => {
  try {
    const turfs = await Turf.find({ isActive: true })
      .populate('availability.bookings')
      .sort({ createdAt: -1 });
    res.json(turfs);
  } catch (error) {
    console.error('Error fetching turfs:', error);
    res.status(500).json({ error: 'Failed to fetch turfs' });
  }
});

// Get turf by ID
router.get('/:id', async (req, res) => {
  try {
    const turf = await Turf.findById(req.params.id)
      .populate('availability.bookings');
    
    if (!turf) {
      return res.status(404).json({ error: 'Turf not found' });
    }
    
    res.json(turf);
  } catch (error) {
    console.error('Error fetching turf:', error);
    res.status(500).json({ error: 'Failed to fetch turf' });
  }
});

// Search turfs
router.get('/search', async (req, res) => {
  try {
    const { q, lat, lng, radius = 10 } = req.query;
    
    let query = { isActive: true };
    
    // Text search
    if (q) {
      query.$text = { $search: q };
    }
    
    let turfs = await Turf.find(query)
      .populate('availability.bookings');
    
    // Location-based filtering
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const maxRadius = parseFloat(radius);
      
      turfs = turfs.filter(turf => {
        const distance = calculateDistance(
          userLat, userLng,
          turf.coordinates.lat, turf.coordinates.lng
        );
        return distance <= maxRadius;
      });
      
      // Sort by distance
      turfs.sort((a, b) => {
        const distanceA = calculateDistance(userLat, userLng, a.coordinates.lat, a.coordinates.lng);
        const distanceB = calculateDistance(userLat, userLng, b.coordinates.lat, b.coordinates.lng);
        return distanceA - distanceB;
      });
    }
    
    res.json(turfs);
  } catch (error) {
    console.error('Error searching turfs:', error);
    res.status(500).json({ error: 'Failed to search turfs' });
  }
});

// Create new turf (admin only)
router.post('/', async (req, res) => {
  try {
    const turf = new Turf(req.body);
    await turf.save();
    res.status(201).json(turf);
  } catch (error) {
    console.error('Error creating turf:', error);
    res.status(400).json({ error: 'Failed to create turf' });
  }
});

// Update turf availability
router.patch('/:id/availability', async (req, res) => {
  try {
    const { date, time, isBooked, currentPlayers } = req.body;
    
    const turf = await Turf.findById(req.params.id);
    if (!turf) {
      return res.status(404).json({ error: 'Turf not found' });
    }
    
    // Find existing slot or create new one
    let slot = turf.availability.find(s => s.date === date && s.time === time);
    
    if (slot) {
      slot.isBooked = isBooked;
      slot.currentPlayers = currentPlayers;
    } else {
      turf.availability.push({
        date,
        time,
        isBooked,
        currentPlayers,
        bookings: []
      });
    }
    
    await turf.save();
    res.json(turf);
  } catch (error) {
    console.error('Error updating availability:', error);
    res.status(500).json({ error: 'Failed to update availability' });
  }
});

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default router;