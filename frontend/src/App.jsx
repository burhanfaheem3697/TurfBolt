import React, { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, Users, Clock, Star } from 'lucide-react';
import TurfCard from './components/TurfCard';
import BookingModal from './components/BookingModal';
import SearchFilters from './components/SearchFilters';
import { turfService } from './services/api';

function App() {
  const [turfs, setTurfs] = useState([]);
  const [filteredTurfs, setFilteredTurfs] = useState([]);
  const [selectedTurf, setSelectedTurf] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTurfs();
    getUserLocation();
  }, []);

  useEffect(() => {
    filterTurfs();
  }, [searchQuery, turfs, userLocation]);

  const loadTurfs = async () => {
    try {
      setLoading(true);
      const data = await turfService.getAllTurfs();
      console.log(data)
      setTurfs(data);
    } catch (error) {
      console.error('Failed to load turfs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied');
        }
      );
    }
  };

  const filterTurfs = () => {
    let filtered = turfs;

    if (searchQuery) {
      filtered = filtered.filter(turf => 
        turf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        turf.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (userLocation) {
      filtered = filtered.sort((a, b) => {
        const distanceA = calculateDistance(userLocation, a.coordinates);
        const distanceB = calculateDistance(userLocation, b.coordinates);
        return distanceA - distanceB;
      });
    }

    setFilteredTurfs(filtered);
  };

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

  const handleBookTurf = (turf) => {
    setSelectedTurf(turf);
    setShowBookingModal(true);
  };

  const handleBookingComplete = (booking) => {
    setShowBookingModal(false);
    setSelectedTurf(null);
    loadTurfs(); // Refresh turfs to update availability
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading turfs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-green-600 to-blue-600 p-2 rounded-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">TurfBook</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-1" />
                {userLocation ? 'Location detected' : 'Enable location for better recommendations'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Find Your Perfect <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">Turf</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Book premium sports turfs near you with real-time availability and smart capacity management
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by turf name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-lg text-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Turfs Grid */}
      <section className="pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {userLocation && (
            <div className="mb-6 flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2 text-green-600" />
              Showing turfs sorted by distance from your location
            </div>
          )}
          
          {filteredTurfs.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No turfs found</h3>
                <p className="text-gray-600">Try adjusting your search criteria</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTurfs.map((turf) => (
                <TurfCard 
                  key={turf._id} 
                  turf={turf} 
                  onBook={handleBookTurf}
                  userLocation={userLocation}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Booking Modal */}
      {showBookingModal && selectedTurf && (
        <BookingModal
          turf={selectedTurf}
          onClose={() => setShowBookingModal(false)}
          onBookingComplete={handleBookingComplete}
        />
      )}
    </div>
  );
}

export default App;