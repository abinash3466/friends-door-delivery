import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Bike, ShoppingCart, Compass, CheckCircle2, AlertTriangle, ArrowRight, IndianRupee } from 'lucide-react';
import Navbar from '../components/Navbar';
import OrderCard from '../components/OrderCard';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  const fetchActiveJobs = async () => {
    try {
      const orderRes = await axios.get('/api/orders/my-orders');
      const rideRes = await axios.get('/api/rides/my-rides');
      
      if (orderRes.data.success) {
        setOrders(orderRes.data.orders);
      }
      if (rideRes.data.success) {
        setRides(rideRes.data.rides);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveJobs();
    
    // Auto-refresh jobs every 8 seconds to mock real-time socket tracking
    const interval = setInterval(fetchActiveJobs, 8000);
    return () => clearInterval(interval);
  }, []);

  const handlePayOrder = async (orderId) => {
    try {
      const res = await axios.post(`/api/orders/${orderId}/pay`, { paymentMethod: 'RAZORPAY' });
      if (res.data.success) {
        alert('Payment processed successfully via Razorpay (Mock Gateway)');
        fetchActiveJobs();
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment processing failed. Try again.');
    }
  };

  const activeOrders = orders.filter(o => o.status !== 'COMPLETED' && o.status !== 'REJECTED');
  const activeRides = rides.filter(r => r.status !== 'COMPLETED' && r.status !== 'CANCELLED');

  return (
    <div className="flex-1 flex flex-col bg-[#FAFAFB] dark:bg-[#121214]">
      <Navbar />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gradient-to-r from-brand-teal/10 to-brand-amber/10 dark:from-brand-teal/20 dark:to-brand-amber/10 p-6 rounded-2xl border border-brand-teal/10">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">
              Vanakkam, {user?.name.split(' ')[0]}!
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Your personal assistant for deliveries and rides in Ambasamudram zone.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2 rounded-xl text-xs font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-slate-600 dark:text-slate-300">Geofence Active</span>
          </div>
        </div>

        {/* Primary Service Cards Grid */}
        <div>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Our Services</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Food delivery card */}
            <Link 
              to="/food"
              className="premium-card glass-panel rounded-2xl p-5 border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-[160px] cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 flex items-center justify-center font-bold text-lg">
                🍔
              </div>
              <div>
                <h4 className="font-bold text-slate-850 dark:text-white">Food Delivery</h4>
                <p className="text-[11px] text-slate-450 dark:text-slate-400 mt-0.5">Order from Ambasamudram Spicy & local restaurants.</p>
              </div>
            </Link>

            {/* Grocery delivery card */}
            <Link
              to="/grocery"
              className="premium-card glass-panel rounded-2xl p-5 border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-[160px] cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400 flex items-center justify-center font-bold text-lg">
                🛒
              </div>
              <div>
                <h4 className="font-bold text-slate-850 dark:text-white">Grocery Mart</h4>
                <p className="text-[11px] text-slate-450 dark:text-slate-400 mt-0.5">Fresh items and daily provisions delivered in 30 mins.</p>
              </div>
            </Link>

            {/* Custom Dunzo pickup card */}
            <Link
              to="/custom-order"
              className="premium-card glass-panel rounded-2xl p-5 border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-[160px] cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-teal/15 text-brand-teal flex items-center justify-center font-bold text-lg">
                📦
              </div>
              <div>
                <h4 className="font-bold text-slate-850 dark:text-white">Custom Pickup</h4>
                <p className="text-[11px] text-slate-450 dark:text-slate-400 mt-0.5">Dunzo style shopping list. Name any store & list items.</p>
              </div>
            </Link>

            {/* Bike taxi card */}
            <Link
              to="/bike-taxi"
              className="premium-card glass-panel rounded-2xl p-5 border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-[160px] cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-amber/15 text-brand-amber flex items-center justify-center font-bold text-lg">
                🏍️
              </div>
              <div>
                <h4 className="font-bold text-slate-850 dark:text-white">Bike Taxi (Rapido)</h4>
                <p className="text-[11px] text-slate-450 dark:text-slate-400 mt-0.5">Quick local commutes with base rates starting at ₹25.</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Live Track / Action Center */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Orders List */}
          <div className="lg:col-span-2 space-y-5">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center">
              <span>Active Orders & Commutes</span>
              {(activeOrders.length > 0 || activeRides.length > 0) && (
                <span className="w-2 h-2 rounded-full bg-brand-amber ml-2 animate-ping"></span>
              )}
            </h3>

            {loading ? (
              <div className="py-12 flex justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-brand-teal border-t-transparent animate-spin"></div>
              </div>
            ) : activeOrders.length === 0 && activeRides.length === 0 ? (
              <div className="glass-panel border border-dashed border-slate-200 dark:border-slate-800 p-8 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="font-bold text-slate-700 dark:text-slate-300">No active runs</h4>
                <p className="text-xs text-slate-400">Order foods, get groceries, or book a bike ride to track live statuses here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {activeOrders.map((order) => (
                  <OrderCard
                    key={order._id}
                    order={order}
                    userRole="CUSTOMER"
                    onPay={handlePayOrder}
                  />
                ))}
                {activeRides.map((ride) => (
                  <OrderCard
                    key={ride._id}
                    ride={ride}
                    userRole="CUSTOMER"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Side Info Panel & Service Zones */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Service Hub Details</h3>
            
            {/* Geofence info widget */}
            <div className="glass-panel rounded-2xl p-5 border border-slate-100 dark:border-slate-800 space-y-4">
              <div className="flex items-center space-x-2.5 text-brand-teal font-bold text-sm">
                <Compass className="w-5 h-5 animate-pulse" />
                <span>TN Operational Zone Check</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Friends SuperApp operates strictly inside the designated service zones of Tamil Nadu.
              </p>
              
              <div className="space-y-2 pt-1 text-xs">
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5 text-slate-700 dark:text-slate-300">
                  <span>Ambasamudram Hub</span>
                  <span className="font-bold text-green-500">12 KM Radius</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5 text-slate-700 dark:text-slate-300">
                  <span>Papanasam Hub</span>
                  <span className="font-bold text-green-500">10 KM Radius</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5 text-slate-700 dark:text-slate-300">
                  <span>Vikramasingapuram</span>
                  <span className="font-bold text-green-500">10 KM Radius</span>
                </div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                  <span>Alwarkurichi Hub</span>
                  <span className="font-bold text-green-500">12 KM Radius</span>
                </div>
              </div>
            </div>

            {/* Past orders statistics */}
            <div className="glass-panel rounded-2xl p-5 border border-slate-100 dark:border-slate-800 space-y-3">
              <div className="text-xs font-bold text-slate-450 uppercase tracking-wider">Your Stats Summary</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/20 p-3 rounded-xl border border-slate-100 dark:border-slate-800/40 text-center">
                  <div className="text-2xl font-black text-brand-teal">{orders.length}</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Total Orders</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/20 p-3 rounded-xl border border-slate-100 dark:border-slate-800/40 text-center">
                  <div className="text-2xl font-black text-brand-amber">{rides.length}</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Bike comms</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomerDashboard;
