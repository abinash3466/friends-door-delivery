import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Compass, Bike, IndianRupee, MapPin, Navigation, Info, AlertTriangle } from 'lucide-react';
import Navbar from '../components/Navbar';
import PremiumButton from '../components/PremiumButton';
import MapMockup from '../components/MapMockup';

const BikeTaxiPage = () => {
  const [pickup, setPickup] = useState('Ambasamudram');
  const [destination, setDestination] = useState('Papanasam');
  
  // Coordinates
  const [pickLat, setPickLat] = useState('8.7061');
  const [pickLng, setPickLng] = useState('77.4578');
  const [destLat, setDestLat] = useState('8.6833');
  const [destLng, setDestLng] = useState('77.3667');
  
  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  // Helper helper to load hub coordinates templates
  const handleSelectHub = (type, hubName) => {
    let lat = '8.7061';
    let lng = '77.4578';

    switch (hubName) {
      case 'Ambasamudram':
        lat = '8.7061'; lng = '77.4578'; break;
      case 'Papanasam':
        lat = '8.6833'; lng = '77.3667'; break;
      case 'Vikramasingapuram':
        lat = '8.7000'; lng = '77.4000'; break;
      case 'Alwarkurichi':
        lat = '8.7833'; lng = '77.3833'; break;
      default:
        break;
    }

    if (type === 'pickup') {
      setPickup(hubName);
      setPickLat(lat);
      setPickLng(lng);
    } else {
      setDestination(hubName);
      setDestLat(lat);
      setDestLng(lng);
    }
    setEstimate(null);
    setError('');
  };

  const handleEstimate = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setEstimate(null);

    if (pickup === destination) {
      setError('Pickup and destination locations cannot be the same');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post('/api/rides/estimate', {
        pickupLocation: pickup,
        destinationLocation: destination,
        pickupCoordinates: {
          latitude: parseFloat(pickLat),
          longitude: parseFloat(pickLng),
        },
        destinationCoordinates: {
          latitude: parseFloat(destLat),
          longitude: parseFloat(destLng),
        },
      });

      if (res.data.success) {
        setEstimate({
          distanceKm: res.data.distanceKm,
          fare: res.data.fareBreakdown,
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to estimate fare. Ensure hubs are inside Tamil Nadu geofence.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookRide = async () => {
    setBooking(true);
    try {
      const res = await axios.post('/api/rides', {
        pickupLocation: pickup,
        destinationLocation: destination,
        pickupCoordinates: {
          latitude: parseFloat(pickLat),
          longitude: parseFloat(pickLng),
        },
        destinationCoordinates: {
          latitude: parseFloat(destLat),
          longitude: parseFloat(destLng),
        },
        paymentMethod: 'COD',
      });

      if (res.data.success) {
        alert('Bike taxi ride request placed successfully! A driver will pick you up shortly.');
        navigate('/customer');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Ride booking failed.');
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#FAFAFB] dark:bg-[#121214]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Back Link */}
        <div className="flex items-center space-x-3">
          <Link to="/customer" className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">Bike Taxi (Rapido)</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Instant local transport across operational Tamil Nadu zones.</p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 text-xs font-semibold text-red-650 bg-red-50 dark:bg-red-950/20 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-900/30">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Booking inputs panel */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-panel rounded-2xl p-5 border border-slate-150 dark:border-slate-850 space-y-4">
              <div className="flex items-center space-x-2 font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                <Bike className="w-5 h-5 text-brand-amber" />
                <span>Configure Trip Locations</span>
              </div>

              <form onSubmit={handleEstimate} className="space-y-4">
                {/* Pickup selection */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pickup Location</label>
                  <div className="flex flex-wrap gap-1">
                    {['Ambasamudram', 'Papanasam', 'Vikramasingapuram', 'Alwarkurichi'].map((hub) => (
                      <button
                        key={hub}
                        type="button"
                        onClick={() => handleSelectHub('pickup', hub)}
                        className={`text-[9px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                          pickup === hub
                            ? 'bg-brand-teal text-white border-brand-teal'
                            : 'bg-slate-100 dark:bg-slate-800 border-transparent text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {hub}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dropoff selection */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Destination Location (Dropoff)</label>
                  <div className="flex flex-wrap gap-1">
                    {['Ambasamudram', 'Papanasam', 'Vikramasingapuram', 'Alwarkurichi'].map((hub) => (
                      <button
                        key={hub}
                        type="button"
                        onClick={() => handleSelectHub('dropoff', hub)}
                        className={`text-[9px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                          destination === hub
                            ? 'bg-brand-amber text-slate-900 border-brand-amber font-extrabold'
                            : 'bg-slate-100 dark:bg-slate-800 border-transparent text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {hub}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Estimate Button */}
                <PremiumButton type="submit" variant="teal" loading={loading} className="w-full py-3 text-xs mt-2">
                  Get Fare Invoice Estimation
                </PremiumButton>
              </form>

              {/* Estimate Breakdown Invoice */}
              {estimate && (
                <div className="p-4 bg-slate-50 dark:bg-slate-850/20 border border-slate-100 dark:border-slate-800 rounded-xl space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fare Breakdown</div>
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-350">
                    <span>Base Fare:</span>
                    <span>₹{estimate.fare.baseFare}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-350">
                    <span>Distance Fare ({estimate.distanceKm} KM x ₹12):</span>
                    <span>₹{estimate.fare.distanceFare}</span>
                  </div>
                  {estimate.fare.surgeMultiplier > 1.0 && (
                    <div className="flex justify-between text-xs text-brand-amber font-bold">
                      <span>Peak Hour Surge ({estimate.fare.surgeMultiplier}x):</span>
                      <span>+₹{estimate.fare.surgeAmount}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-200 dark:border-slate-800 pt-2 flex justify-between text-sm font-extrabold text-slate-800 dark:text-white">
                    <span>Grand Total:</span>
                    <span className="flex items-center text-brand-teal text-base">
                      <IndianRupee className="w-4 h-4 mr-0.5" />
                      {estimate.fare.finalFare}
                    </span>
                  </div>

                  <PremiumButton
                    onClick={handleBookRide}
                    variant="amber"
                    loading={booking}
                    className="w-full py-3 mt-4 text-xs font-black shadow-lg"
                  >
                    Confirm & Book Bike Taxi Now
                  </PremiumButton>
                </div>
              )}
            </div>
          </div>

          {/* Map visualization panel */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Trip Visualizer (Geofenced Hubs)</h3>
            <MapMockup
              pickupCoords={{ latitude: parseFloat(pickLat), longitude: parseFloat(pickLng) }}
              destCoords={{ latitude: parseFloat(destLat), longitude: parseFloat(destLng) }}
              pickupName={pickup}
              destName={destination}
              serviceZoneStatus={true}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default BikeTaxiPage;
