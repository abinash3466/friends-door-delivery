import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { IndianRupee, ShoppingBag, Bike, Users, Store as StoreIcon, ShieldAlert, Award, RefreshCw, Check } from 'lucide-react';
import Navbar from '../components/Navbar';
import PremiumButton from '../components/PremiumButton';

const OwnerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [stores, setStores] = useState([]);
  const [orders, setOrders] = useState([]);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payoutLoading, setPayoutLoading] = useState({});
  const [reassignModal, setReassignModal] = useState({ isOpen: false, orderId: null, rideId: null });
  const [targetWorker, setTargetWorker] = useState('');
  
  const navigate = useNavigate();

  const fetchAdminData = async () => {
    try {
      const statsRes = await axios.get('/api/admin/analytics');
      const storeRes = await axios.get('/api/admin/stores');
      const workerRes = await axios.get('/api/admin/workers');

      // We can also fetch raw active orders/rides to demonstrate manual allocations
      // For demonstration, let's fetch jobs by a custom route if needed, or query customer/worker tables
      // Let's populate some state
      if (statsRes.data.success) {
        setStats(statsRes.data.analytics);
        setWorkers(statsRes.data.workerPerformance);
      }
      if (storeRes.data.success) {
        setStores(storeRes.data.stores);
      }
      
      // Load active orders/rides inRECEIVED/REQUESTED states for reassignment demos
      // Since admin can query all orders, let's mock or load from admin records
      // Let's load worker lists
    } catch (error) {
      console.error('Error loading admin dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handlePayout = async (workerId) => {
    setPayoutLoading(prev => ({ ...prev, [workerId]: true }));
    try {
      const res = await axios.post(`/api/admin/workers/${workerId}/payout`);
      if (res.data.success) {
        alert(`Successfully paid out ₹${res.data.payoutAmount} to worker`);
        fetchAdminData();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Payout failed');
    } finally {
      setPayoutLoading(prev => ({ ...prev, [workerId]: false }));
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#FAFAFB] dark:bg-[#121214]">
      <Navbar />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white flex items-center">
              <Award className="w-6 h-6 mr-2 text-brand-teal" />
              <span>Owner Operations Hub</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Analyze corporate revenue, manage worker payouts, and edit partner shops.
            </p>
          </div>
          <div className="flex space-x-2">
            <Link to="/store-manager">
              <PremiumButton variant="teal" icon={<StoreIcon className="w-4 h-4" />} className="py-2 text-xs">
                Manage Stores
              </PremiumButton>
            </Link>
            <button
              onClick={() => { setLoading(true); fetchAdminData(); }}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1d1d22] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-brand-teal border-t-transparent animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Analytics Metric Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-panel border border-slate-100 dark:border-slate-850 p-5 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Enterprise Revenue</span>
                <div className="text-xl sm:text-2xl font-black text-brand-teal flex items-center mt-1">
                  <IndianRupee className="w-5 h-5 mr-0.5" />
                  {stats?.totalRevenue || 0}
                </div>
              </div>
              <div className="glass-panel border border-slate-100 dark:border-slate-850 p-5 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Daily Completed Revenue</span>
                <div className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white flex items-center mt-1">
                  <IndianRupee className="w-5 h-5 mr-0.5 text-slate-400" />
                  {stats?.dailyRevenue || 0}
                </div>
              </div>
              <div className="glass-panel border border-slate-100 dark:border-slate-850 p-5 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Weekly Completed Revenue</span>
                <div className="text-xl sm:text-2xl font-black text-brand-amber flex items-center mt-1">
                  <IndianRupee className="w-5 h-5 mr-0.5" />
                  {stats?.weeklyRevenue || 0}
                </div>
              </div>
              <div className="glass-panel border border-slate-100 dark:border-slate-850 p-5 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Bookings (Order/Trips)</span>
                <div className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white flex items-center mt-1">
                  <ShoppingBag className="w-5 h-5 mr-1.5 text-brand-teal" />
                  {(stats?.totalOrders || 0) + (stats?.totalBikeTrips || 0)}
                </div>
              </div>
            </div>

            {/* Worker management and Store List layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Worker performance & payout panel */}
              <div className="lg:col-span-2 space-y-4">
                  <div className="glass-panel rounded-2xl p-5 border border-slate-100 dark:border-slate-850">

                    <h3 className="font-bold text-lg mb-4">
                      Pending Worker Approvals
                    </h3>

                    {workers
                      .filter(worker => worker.verificationStatus === 'PENDING')
                      .map(worker => (

                        <div
                          key={worker.workerId}
                          className="flex justify-between items-center border-b py-3"
                        >

                          <div>
                            <h4 className="font-bold">
                              {worker.name}
                            </h4>

                            <p>
                              {worker.phone}
                            </p>

                            <p>
                              DL : {worker.licenseNumber}
                            </p>

                            <p>
                              RC : {worker.rcNumber}
                            </p>
                          </div>

                          <div className="flex gap-2">

                            <button
                              className="bg-green-600 text-white px-3 py-2 rounded"
                            >
                              Approve
                            </button>

                            <button
                              className="bg-red-600 text-white px-3 py-2 rounded"
                            >
                              Reject
                            </button>

                          </div>

                        </div>

                      ))}

                  </div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Worker Payouts & Performance</h3>
                <div className="glass-panel rounded-2xl border border-slate-100 dark:border-slate-850 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-850/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 font-bold uppercase">
                          <th className="p-4">Rider Details</th>
                          <th className="p-4">Vehicle</th>
                          <th className="p-4 text-center">Jobs Done</th>
                          <th className="p-4">Rating</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                        {workers.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="p-4 text-center text-slate-450">No delivery partners registered yet.</td>
                          </tr>
                        ) : (
                          workers.map((worker) => (
                            <tr key={worker.workerId} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/25">
                              <td className="p-4">
                                <div className="font-bold text-slate-850 dark:text-white">{worker.name}</div>
                                <div className="text-[10px] text-slate-400 mt-0.5">{worker.phone}</div>
                              </td>
                              <td className="p-4 font-mono">{worker.vehicleNumber}</td>
                              <td className="p-4 text-center font-bold text-slate-700 dark:text-slate-200">{worker.jobsCompleted}</td>
                              <td className="p-4">
                                <span className="text-brand-amber font-bold">★ {worker.rating.toFixed(1)}</span>
                              </td>
                              <td className="p-4 text-right">
                                {worker.earningsMonthly > 0 ? (
                                  <PremiumButton
                                    onClick={() => handlePayout(worker.workerId)}
                                    loading={payoutLoading[worker.workerId]}
                                    variant="amber"
                                    className="py-1.5 px-3 rounded-lg text-[10px] ml-auto"
                                  >
                                    Pay ₹{worker.earningsMonthly}
                                  </PremiumButton>
                                ) : (
                                  <span className="text-[10px] text-slate-400 flex items-center justify-end font-semibold">
                                    <Check className="w-3.5 h-3.5 mr-1 text-green-500" /> Settled
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Stores overview */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Active Shop Locations</h3>
                <div className="glass-panel rounded-2xl p-5 border border-slate-100 dark:border-slate-850 space-y-4">
                  {stores.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400">No stores loaded. Add stores inside Store Manager.</div>
                  ) : (
                    <div className="space-y-3.5">
                      {stores.slice(0, 5).map((store) => (
                        <div key={store._id} className="flex justify-between items-center text-xs">
                          <div>
                            <h4 className="font-bold text-slate-850 dark:text-white">{store.name}</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">{store.type} • {store.locationName}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            store.isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-300'
                          }`}>
                            {store.isActive ? 'Active' : 'Disabled'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  <Link to="/store-manager" className="block text-center text-xs text-brand-teal hover:underline font-bold pt-2 border-t border-slate-100 dark:border-slate-800">
                    Open Store CRUD Panel →
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default OwnerDashboard;
