import express from 'express';
import { Booking } from '../models/Booking.js';
import { Turf } from '../models/Turf.js';

const router = express.Router();

// Get all bookings
router.get('/', async (req, res) => {
  try {
    const { email, turfId, status } = req.query;
    let query = {};
    
    if (email) query.bookerEmail = email;
    if (turfId) query.turfId = turfId;
    if (status) query.status = status;
    
    const bookings = await Booking.find(query)
      .populate('turfId')
      .sort({ createdAt: -1 });
    
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Create new booking
router.post('/', async (req, res) => {
  try {
    const {
      turfId,
      slotId,
      date,
      time,
      playerCount,
      isOpenParty,
      bookerName,
      bookerEmail,
      bookerPhone
    } = req.body;
    
    // Validate turf exists
    const turf = await Turf.findById(turfId);
    if (!turf) {
      return res.status(404).json({ error: 'Turf not found' });
    }
    
    // Check slot availability
    let slot = turf.availability.find(s => s.date === date && s.time === time);
    
    if (!slot) {
      // Create new slot
      slot = {
        date,
        time,
        isBooked: false,
        currentPlayers: 0,
        bookings: []
      };
      turf.availability.push(slot);
    }
    
    // Check if slot has enough capacity
    const availableSpots = turf.capacity - slot.currentPlayers;
    if (availableSpots < playerCount) {
      return res.status(400).json({ 
        error: `Only ${availableSpots} spots available for this slot` 
      });
    }
    
    // Calculate total price
    const playerRatio = playerCount / turf.capacity;
    const totalPrice = Math.round(turf.pricePerHour * playerRatio);
    
    // Create booking
    const booking = new Booking({
      turfId,
      slotId,
      date,
      time,
      playerCount,
      isOpenParty,
      bookerName,
      bookerEmail,
      bookerPhone,
      totalPrice
    });
    
    await booking.save();
    
    // Update slot
    slot.currentPlayers += playerCount;
    slot.bookings.push(booking._id);
    
    // Mark slot as fully booked if capacity is reached or if it's a closed party
    if (slot.currentPlayers >= turf.capacity || !isOpenParty) {
      slot.isBooked = true;
    }
    
    await turf.save();
    
    res.status(201).json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(400).json({ error: 'Failed to create booking' });
  }
});

// Get booking by ID
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('turfId');
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

// Cancel booking
router.patch('/:id/cancel', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: 'Booking already cancelled' });
    }
    
    // Update booking status
    booking.status = 'cancelled';
    await booking.save();
    
    // Update turf availability
    const turf = await Turf.findById(booking.turfId);
    if (turf) {
      const slot = turf.availability.find(s => 
        s.date === booking.date && s.time === booking.time
      );
      
      if (slot) {
        slot.currentPlayers -= booking.playerCount;
        slot.bookings = slot.bookings.filter(id => !id.equals(booking._id));
        
        // Unmark as booked if there's now available capacity
        if (slot.currentPlayers < turf.capacity) {
          slot.isBooked = false;
        }
        
        await turf.save();
      }
    }
    
    res.json(booking);
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

// Join open party booking
router.post('/:id/join', async (req, res) => {
  try {
    const { playerCount, bookerName, bookerEmail, bookerPhone } = req.body;
    
    const existingBooking = await Booking.findById(req.params.id);
    if (!existingBooking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    if (!existingBooking.isOpenParty) {
      return res.status(400).json({ error: 'This is not an open party booking' });
    }
    
    const turf = await Turf.findById(existingBooking.turfId);
    if (!turf) {
      return res.status(404).json({ error: 'Turf not found' });
    }
    
    const slot = turf.availability.find(s => 
      s.date === existingBooking.date && s.time === existingBooking.time
    );
    
    if (!slot) {
      return res.status(400).json({ error: 'Slot not found' });
    }
    
    const availableSpots = turf.capacity - slot.currentPlayers;
    if (availableSpots < playerCount) {
      return res.status(400).json({ 
        error: `Only ${availableSpots} spots available for this slot` 
      });
    }
    
    // Calculate price for joining
    const playerRatio = playerCount / turf.capacity;
    const totalPrice = Math.round(turf.pricePerHour * playerRatio);
    
    // Create new booking for joining player
    const joinBooking = new Booking({
      turfId: existingBooking.turfId,
      slotId: existingBooking.slotId,
      date: existingBooking.date,
      time: existingBooking.time,
      playerCount,
      isOpenParty: true,
      bookerName,
      bookerEmail,
      bookerPhone,
      totalPrice
    });
    
    await joinBooking.save();
    
    // Update slot
    slot.currentPlayers += playerCount;
    slot.bookings.push(joinBooking._id);
    
    if (slot.currentPlayers >= turf.capacity) {
      slot.isBooked = true;
    }
    
    await turf.save();
    
    res.status(201).json(joinBooking);
  } catch (error) {
    console.error('Error joining booking:', error);
    res.status(400).json({ error: 'Failed to join booking' });
  }
});

export default router;