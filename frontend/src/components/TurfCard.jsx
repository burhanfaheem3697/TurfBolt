import React from 'react';
import { MapPin, Users, Star, Calendar, Clock, Wifi, Car, Zap } from 'lucide-react';

const TurfCard = ({ turf, onBook, userLocation }) => {
  const calculateDistance = (point1, point2) => {
    const R = 6371;
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLon = (point2.lng - point1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const distance = userLocation ? calculateDistance(userLocation, turf.coordinates) : null;

  const getAmenityIcon = (amenity) => {
    switch (amenity.toLowerCase()) {
      case 'wifi':
        return <Wifi className="h-4 w-4" />;
      case 'parking':
        return <Car className="h-4 w-4" />;
      case 'lighting':
        return <Zap className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const availableSlots = turf.availability?.filter(slot => !slot.isBooked).length || 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-r from-green-400 to-blue-500">
        <img 
          src={turf.images[0] || 'https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg'} 
          alt={turf.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 left-4">
          <div className="bg-white px-3 py-1 rounded-full text-sm font-medium text-green-600">
            ₹{turf.pricePerHour}/hour
          </div>
        </div>
        {distance && (
          <div className="absolute top-4 right-4">
            <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
              {distance.toFixed(1)} km
            </div>
          </div>
        )}
      </div>

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{turf.name}</h3>
            <div className="flex items-center text-gray-600 text-sm">
              <MapPin className="h-4 w-4 mr-1" />
              {turf.location}
            </div>
          </div>
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 mr-1" />
            <span className="text-sm font-medium">{turf.rating}</span>
            <span className="text-xs text-gray-500 ml-1">({turf.totalReviews})</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {turf.description}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-2 text-blue-500" />
            <span>Up to {turf.capacity} players</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2 text-green-500" />
            <span>{availableSlots} slots available</span>
          </div>
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-2 mb-4">
          {turf.amenities.slice(0, 3).map((amenity, index) => (
            <div key={index} className="flex items-center bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-600">
              {getAmenityIcon(amenity)}
              <span className="ml-1 capitalize">{amenity}</span>
            </div>
          ))}
          {turf.amenities.length > 3 && (
            <div className="bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-600">
              +{turf.amenities.length - 3} more
            </div>
          )}
        </div>

        {/* Book Button */}
        <button
          onClick={() => onBook(turf)}
          className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:from-green-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
        >
          Book Now
        </button>
      </div>
    </div>
  );
};

export default TurfCard;