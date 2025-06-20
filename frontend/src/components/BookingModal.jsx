import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Users, MapPin, Star, AlertCircle, Check } from 'lucide-react';
import { turfService } from '../services/api';

const BookingModal = ({ turf, onClose, onBookingComplete }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [playerCount, setPlayerCount] = useState(1);
  const [isOpenParty, setIsOpenParty] = useState(false);
  const [bookerName, setBookerName] = useState('');
  const [bookerEmail, setBookerEmail] = useState('');
  const [bookerPhone, setBookerPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [availableSlots, setAvailableSlots] = useState([]);

  useEffect(() => {
    generateAvailableSlots();
  }, [selectedDate]);

  const generateAvailableSlots = () => {
    if (!selectedDate) return;
    
    const timeSlots = [
      '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
      '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
      '18:00', '19:00', '20:00', '21:00', '22:00'
    ];

    const slots = timeSlots.map(time => {
      const existingSlot = turf.availability?.find(
        slot => slot.date === selectedDate && slot.time === time
      );
      
      return {
        time,
        isBooked: existingSlot?.isBooked || false,
        currentPlayers: existingSlot?.currentPlayers || 0,
        availableSpots: turf.capacity - (existingSlot?.currentPlayers || 0)
      };
    });

    setAvailableSlots(slots);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedTime('');
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  };

  const calculateTotal = () => {
    const basePrice = turf.pricePerHour;
    const playerMultiplier = playerCount / turf.capacity;
    return Math.round(basePrice * playerMultiplier);
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !bookerName || !bookerEmail || !bookerPhone) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const bookingRequest = {
        turfId: turf._id,
        slotId: `${selectedDate}-${selectedTime}`,
        date: selectedDate,
        time: selectedTime,
        playerCount,
        isOpenParty,
        bookerName,
        bookerEmail,
        bookerPhone
      };

      const booking = await turfService.createBooking(bookingRequest);
      onBookingComplete(booking);
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedSlot = availableSlots.find(slot => slot.time === selectedTime);
  const canJoinSlot = selectedSlot && !selectedSlot.isBooked && 
    selectedSlot.availableSpots >= playerCount;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Book {turf.name}</h2>
            <div className="flex items-center text-gray-600 mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              {turf.location}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  min={getMinDate()}
                  max={getMaxDate()}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Time Slot
                  </label>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                    {availableSlots.map((slot) => {
                      const isDisabled = slot.isBooked || slot.availableSpots === 0;
                      const isPartiallyBooked = slot.currentPlayers > 0 && slot.availableSpots > 0;
                      
                      return (
                        <button
                          key={slot.time}
                          onClick={() => !isDisabled && setSelectedTime(slot.time)}
                          disabled={isDisabled}
                          className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                            selectedTime === slot.time
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : isDisabled
                              ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                              : isPartiallyBooked
                              ? 'border-orange-300 bg-orange-50 text-orange-700 hover:border-orange-400'
                              : 'border-gray-300 hover:border-green-300 hover:bg-green-50'
                          }`}
                        >
                          <div>{slot.time}</div>
                          {isPartiallyBooked && (
                            <div className="text-xs mt-1">
                              {slot.availableSpots} spots left
                            </div>
                          )}
                          {slot.isBooked && (
                            <div className="text-xs mt-1">Booked</div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {selectedTime && (
                <button
                  onClick={() => setStep(2)}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition-all"
                >
                  Continue
                </button>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              {/* Selected Slot Info */}
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center text-green-800 font-medium">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(selectedDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="flex items-center text-green-600 mt-1">
                      <Clock className="h-4 w-4 mr-2" />
                      {selectedTime} - {(parseInt(selectedTime.split(':')[0]) + 1).toString().padStart(2, '0')}:00
                    </div>
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="text-green-600 hover:text-green-700 text-sm font-medium"
                  >
                    Change
                  </button>
                </div>
              </div>

              {/* Player Count */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Players
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setPlayerCount(Math.max(1, playerCount - 1))}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="text-lg font-medium w-12 text-center">{playerCount}</span>
                  <button
                    onClick={() => setPlayerCount(Math.min(selectedSlot?.availableSpots || turf.capacity, playerCount + 1))}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                  >
                    +
                  </button>
                  <span className="text-sm text-gray-600">
                    (Max: {selectedSlot?.availableSpots || turf.capacity})
                  </span>
                </div>
              </div>

              {/* Open Party Option */}
              {playerCount < (selectedSlot?.availableSpots || turf.capacity) && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="openParty"
                      checked={isOpenParty}
                      onChange={(e) => setIsOpenParty(e.target.checked)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div>
                      <label htmlFor="openParty" className="text-sm font-medium text-blue-800">
                        Open Party
                      </label>
                      <p className="text-sm text-blue-600 mt-1">
                        Allow other players to join your booking and fill the remaining {(selectedSlot?.availableSpots || turf.capacity) - playerCount} spots
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Personal Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Your Details</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={bookerName}
                    onChange={(e) => setBookerName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={bookerEmail}
                    onChange={(e) => setBookerEmail(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={bookerPhone}
                    onChange={(e) => setBookerPhone(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              {/* Booking Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Booking Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Turf:</span>
                    <span className="font-medium">{turf.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Base Price:</span>
                    <span>₹{turf.pricePerHour}/hour</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Players:</span>
                    <span>{playerCount}/{turf.capacity}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-medium">
                    <span>Total:</span>
                    <span>₹{calculateTotal()}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleBooking}
                disabled={loading || !canJoinSlot}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  'Confirm Booking'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;