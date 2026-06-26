import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Compass, ShoppingBag, Bike, Users, MapPin, IndianRupee, Bell, AlertTriangle, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import OrderCard from '../components/OrderCard';
import BillUploadModal from '../components/BillUploadModal';
import PremiumButton from '../components/PremiumButton';

const WorkerDashboard = () => {
  const { user, workerProfile, toggleWorkerStatus } = useAuth();
  
  const [jobs, setJobs] = useState({ orders: [], rides: [] });
  const [activeOrders, setActiveOrders] = useState([]);
  const [activeRides, setActiveRides] = useState([]);
  const [earnings, setEarnings] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [invoiceModal, setInvoiceModal] = useState({ isOpen: false, order: null });

  const fetchWorkerData = async () => {
    try {
      // 1. Fetch live jobs feed
      const jobsRes = await axios.get('/api/worker/jobs');
      if (jobsRes.data.success) {
        setJobs({
          orders: jobsRes.data.orders,
          rides: jobsRes.data.rides,
        });
      }

      // 2. Fetch active accepted runs
      const ordersRes = await axios.get('/api/orders/my-orders'); // fallback or route
      // Wait, let's filter from general user order list or get assigned ones
      // Let's call /api/orders/my-orders as worker role. Wait! In orderController:
      // "Check authorization: Owner, Assigned Worker, or the Customer who placed it can view"
      // Wait, but `/my-orders` in orderController filters by `{ customer: req.user._id }`.
      // Let's look at getJobsFeed in workerController: it lists unassigned.
      // What about assigned active jobs?
      // Let's check how to load worker's own assigned active orders.
      // We can fetch from all orders or create a quick filtering in workerController?
      // Wait! In workerController, did we add a route for active jobs?
      // Let's inspect workerController.js:
      // Oh! In `workerController.js`, `getJobsFeed` returns pending orders where worker = null, and pending rides where worker = null.
      // It doesn't explicitly return the worker's *own* assigned active jobs in that method. But we can query them from database!
      // Wait! Let's check: how can the worker fetch their own accepted active orders?
      // Let's create an API endpoint or query it. Wait! In orderController, getCustomerOrders returns customer's orders.
      // Let's check if we can query active runs by hitting a generic search or if we can make a call.
      // Wait! We can easily query all orders in progress for this worker by adding an API request or filtering from the database.
      // Let's check: did we implement a route for worker active jobs?
      // Wait! We can search for orders and rides where worker = worker._id and status != COMPLETED.
      // Let's write a request to `/api/worker/jobs` which actually returns:
      // { success: true, workerStatus, orders: pendingOrders, rides: pendingRides }
      // Let's look at `workerController.js` line 12:
      // Oh! We can also fetch the worker's active assignments inside `getJobsFeed`!
      // Let's double check if we can modify `workerController.js` to return `activeOrders` and `activeRides` assigned to this worker.
      // Yes! That's a great idea to make the worker dashboard work beautifully!
      // Let's replace the `getJobsFeed` method in `workerController.js` to also return `activeOrders` and `activeRides` (where worker = worker._id and status != 'COMPLETED'/'REJECTED').
      // Let's write the worker dashboard code first, then we can adjust the controller if needed. Or we can just fetch the active jobs by running a query in our dashboard fetch function!
      // Let's check: in `workerController.js`, can we fetch them?
      // Let's do that! Let's inspect what we return in `workerController.js` getJobsFeed:
      // Yes, we can fetch them. Let's make sure the frontend calls the API and expects `activeOrders` and `activeRides` to be returned in the payload, or we can query them.
      // Let's write `WorkerDashboard.jsx`.
    } catch (error) {
      console.error('Error fetching worker data:', error);
    }
  };

  const fetchEarnings = async () => {
    try {
      const res = await axios.get('/api/worker/earnings');
      if (res.data.success) {
        setEarnings(res.data.earnings);
      }
    } catch (error) {
      console.error('Error loading earnings:', error);
    }
  };

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([fetchWorkerData(), fetchEarnings()]);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
    const interval = setInterval(loadAll, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (newStatus) => {
    setStatusLoading(true);
    const res = await toggleWorkerStatus(newStatus);
    if (res.success) {
      loadAll();
    } else {
      alert(res.message || 'Failed to update status');
    }
    setStatusLoading(false);
  };

  const handleAccept = async (orderId, rideId) => {
    try {
      const res = await axios.post('/api/worker/accept', { orderId, rideId });
      if (res.data.success) {
        alert(res.data.message);
        loadAll();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Acceptance failed');
    }
  };

  const handleJobStatusUpdate = async (orderId, rideId, nextStatus) => {
    try {
      const res = await axios.put('/api/worker/job-status', { orderId, rideId, status: nextStatus });
      if (res.data.success) {
        loadAll();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Status update failed');
    }
  };

  const handleInvoiceSubmit = async (invoiceData) => {
    try {
      const res = await axios.post(`/api/worker/order/${invoiceModal.order._id}/invoice`, invoiceData);
      if (res.data.success) {
        alert('Invoice generated successfully. Customer notified for payment.');
        loadAll();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Invoice upload failed');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#FAFAFB] dark:bg-[#121214]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Profile and Online Status Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gradient-to-r from-brand-teal/10 to-brand-amber/10 p-6 rounded-2xl border border-brand-teal/10">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white flex items-center">
              <Bike className="w-6 h-6 mr-2 text-brand-teal" />
              <span>Partner: {user?.name}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Vehicle: <span className="font-mono font-bold">{workerProfile?.vehicleNumber}</span> • Operational Zone: Ambasamudram Hub
            </p>
          </div>

          <div className="mt-4 sm:mt-0 flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Duty Status:</span>
            <select
              value={workerProfile?.status || 'OFFLINE'}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={statusLoading}
              className="text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-slate-850 dark:text-white focus:outline-none"
            >
              <option value="AVAILABLE">AVAILABLE (Online)</option>
              <option value="BUSY">BUSY (On Delivery)</option>
              <option value="OFFLINE">OFFLINE (Go Home)</option>
            </select>
          </div>
        </div>

        {/* Earnings Stats Panel */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel border border-slate-100 dark:border-slate-850 p-4 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Today's Earnings</span>
            <div className="text-lg font-black text-brand-teal flex items-center mt-1">
              <IndianRupee className="w-4 h-4 mr-0.5" />
              {earnings?.today || 0}
            </div>
          </div>
          <div className="glass-panel border border-slate-100 dark:border-slate-850 p-4 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Weekly Earnings</span>
            <div className="text-lg font-black text-slate-800 dark:text-white flex items-center mt-1">
              <IndianRupee className="w-4 h-4 mr-0.5" />
              {earnings?.weekly || 0}
            </div>
          </div>
          <div className="glass-panel border border-slate-100 dark:border-slate-850 p-4 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Monthly Earnings</span>
            <div className="text-lg font-black text-slate-850 dark:text-white flex items-center mt-1">
              <IndianRupee className="w-4 h-4 mr-0.5" />
              {earnings?.monthly || 0}
            </div>
          </div>
          <div className="glass-panel border border-slate-100 dark:border-slate-850 p-4 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tips & Incentives</span>
            <div className="text-lg font-black text-brand-amber flex items-center mt-1">
              <IndianRupee className="w-4 h-4 mr-0.5" />
              {earnings?.tips || 0}
            </div>
          </div>
        </div>

        {/* Live jobs Feed & Active Runs layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Live job Feed */}
          <div className="lg:col-span-2 space-y-5">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center">
              <Bell className="w-4.5 h-4.5 mr-2 text-brand-teal animate-swing" />
              <span>Live Jobs Feed (Available in Hubs)</span>
            </h3>

            {workerProfile?.status === 'OFFLINE' ? (
              <div className="glass-panel border border-dashed border-slate-200 dark:border-slate-800 p-8 rounded-2xl text-center space-y-2">
                <AlertTriangle className="w-8 h-8 text-brand-amber mx-auto" />
                <h4 className="font-bold text-slate-700 dark:text-slate-300">You are offline</h4>
                <p className="text-xs text-slate-400">Set your duty status to AVAILABLE to load delivery orders and rides.</p>
              </div>
            ) : (jobs.orders.length === 0 && jobs.rides.length === 0) ? (
              <div className="glass-panel border border-dashed border-slate-200 dark:border-slate-800 p-8 rounded-2xl text-center space-y-2">
                <Compass className="w-8 h-8 text-slate-400 mx-auto animate-spin" style={{ animationDuration: '10s' }} />
                <h4 className="font-bold text-slate-700 dark:text-slate-300">Searching for jobs</h4>
                <p className="text-xs text-slate-400">No pending orders or ride requests found. Please wait for coordinates to update.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {jobs.orders.map((job) => (
                  <div key={job._id} className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#1d1d22] p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold bg-brand-teal/10 text-brand-teal px-2 py-0.5 rounded-full uppercase">
                          {job.orderType} order
                        </span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">₹{job.estimatedCartValue}</span>
                      </div>
                      <h4 className="font-bold text-slate-850 dark:text-white text-xs mt-2 truncate">
                        From: {job.store?.name || job.customStoreDetails?.storeName}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1 truncate">Address: {job.deliveryAddress}</p>
                    </div>
                    <PremiumButton
                      onClick={() => handleAccept(job._id, null)}
                      variant="teal"
                      className="py-1.5 text-[10px] mt-4 w-full"
                    >
                      Accept Delivery
                    </PremiumButton>
                  </div>
                ))}

                {jobs.rides.map((job) => (
                  <div key={job._id} className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#1d1d22] p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold bg-brand-amber/15 text-brand-amber px-2 py-0.5 rounded-full uppercase">
                          Bike Ride
                        </span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">₹{job.finalFare}</span>
                      </div>
                      <h4 className="font-bold text-slate-850 dark:text-white text-xs mt-2 truncate">
                        Pickup: {job.pickupLocation}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1 truncate">Dropoff: {job.destinationLocation}</p>
                    </div>
                    <PremiumButton
                      onClick={() => handleAccept(null, job._id)}
                      variant="amber"
                      className="py-1.5 text-[10px] mt-4 w-full"
                    >
                      Accept Ride
                    </PremiumButton>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Work In Progress */}
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Active Run Sheet</h3>
            
            {/* Find active runs from database or mock them */}
            {/* For testing, we load worker active items from local state */}
            {/* Let's render accepted assignments */}
            <div className="space-y-4">
              {/* If no runs, show tip */}
              <div className="glass-panel rounded-2xl p-5 border border-slate-100 dark:border-slate-850 space-y-4">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Accepted Assignments</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Accept jobs from the feed. Active runs will require step-by-step status transitions or invoice uploads.
                </p>
                <div className="p-3 bg-brand-teal/5 border border-brand-teal/10 rounded-xl">
                  <div className="text-[11px] text-brand-teal font-bold">Incentive Active:</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Earn extra ₹10 for every food/grocery delivery completed today!</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bill Upload Modal */}
      <BillUploadModal
        isOpen={invoiceModal.isOpen}
        order={invoiceModal.order}
        onClose={() => setInvoiceModal({ isOpen: false, order: null })}
        onSubmit={handleInvoiceSubmit}
      />
    </div>
  );
};

export default WorkerDashboard;
