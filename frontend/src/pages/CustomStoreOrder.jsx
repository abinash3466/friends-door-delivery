import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, IndianRupee, ClipboardList, ShieldAlert, Compass } from 'lucide-react';
import Navbar from '../components/Navbar';
import PremiumButton from '../components/PremiumButton';

const CustomStoreOrder = () => {
  const [storeName, setStoreName] = useState('');
  const [shoppingList, setShoppingList] = useState('');
  const [instructions, setInstructions] = useState('');
  const [estimatedValue, setEstimatedValue] = useState('');
  const [address, setAddress] = useState('Alwarkurichi Center, TN');
  const [lat, setLat] = useState('8.7833');
  const [lng, setLng] = useState('77.3833');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const val = parseFloat(estimatedValue);
    if (isNaN(val) || val < 200) {
      setError('Minimum order value is ₹200. Please enter a valid estimated cart value.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/orders', {
        orderType: 'CUSTOM',
        estimatedCartValue: val,
        deliveryAddress: address,
        deliveryCoordinates: {
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
        },
        customStoreDetails: {
          storeName,
          shoppingList,
          shoppingInstructions: instructions,
        },
        paymentMethod: 'COD',
      });

      if (res.data.success) {
        alert('Custom store order submitted successfully! A partner will purchase and upload the bill.');
        navigate('/customer');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit custom order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#FAFAFB] dark:bg-[#121214]">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Back Link */}
        <div className="flex items-center space-x-3">
          <Link to="/customer" className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">Custom Shop Delivery</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Dunzo model. Name any local shop, list items, and we'll buy them for you.</p>
          </div>
        </div>

        {error && (
          <div className="p-3 text-xs font-semibold text-red-650 bg-red-50 dark:bg-red-950/20 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-900/30">
            {error}
          </div>
        )}

        {/* Custom Order Form */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-md border border-slate-150 dark:border-slate-850">
          <div className="flex items-center space-x-2 font-bold text-slate-800 dark:text-white border-b border-slate-150 dark:border-slate-800 pb-3 mb-5">
            <ClipboardList className="w-5 h-5 text-brand-teal" />
            <span>Create Custom Procurement Request</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Store Name */}
            <div>
              <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1.5">Shop / Store Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Vasantham Supermarket (Ambasamudram) or Local Pharmacy"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/50 focus:border-brand-teal text-slate-800 dark:text-white"
              />
            </div>

            {/* Item checklist list */}
            <div>
              <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1.5">Shopping Item Checklist (Line by Line)</label>
              <textarea
                required
                rows="4"
                placeholder="e.g.&#10;1. Ponni Rice 5kg&#10;2. Aavin Milk Blue Packet x2&#10;3. Sugar 1kg"
                value={shoppingList}
                onChange={(e) => setShoppingList(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-teal/50 focus:border-brand-teal text-slate-800 dark:text-white"
              />
            </div>

            {/* Shopping instructions */}
            <div>
              <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1.5">Shopping Instructions (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Purchase fresh packet, check expiry date"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/50 focus:border-brand-teal text-slate-800 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Estimated order value */}
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1.5">Estimated Goods Value (₹)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-450">
                    <IndianRupee className="w-4 h-4" />
                  </span>
                  <input
                    type="number"
                    required
                    placeholder="Min ₹200"
                    value={estimatedValue}
                    onChange={(e) => setEstimatedValue(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/50 focus:border-brand-teal text-slate-800 dark:text-white font-semibold"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Rule: Estimated total must be at least ₹200.</p>
              </div>

              {/* Address */}
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1.5">Delivery Dropoff Address</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/50 focus:border-brand-teal text-slate-800 dark:text-white font-semibold"
                />
              </div>
            </div>

            {/* Coordinates geofence picker */}
            <div className="p-4 bg-slate-50 dark:bg-slate-850/20 border border-slate-100 dark:border-slate-800 rounded-xl space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Verify Dropoff Coordinates (Geofencing)</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[9px] text-slate-500 font-bold block mb-0.5">Latitude</span>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    className="w-full px-2 py-1.5 rounded bg-transparent border border-slate-200 dark:border-slate-850 text-xs text-slate-700 dark:text-slate-300"
                  />
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 font-bold block mb-0.5">Longitude</span>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    className="w-full px-2 py-1.5 rounded bg-transparent border border-slate-200 dark:border-slate-850 text-xs text-slate-700 dark:text-slate-300"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <PremiumButton type="submit" variant="teal" loading={loading} className="w-full py-3.5 font-bold shadow-md">
              Submit Custom Order Request
            </PremiumButton>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CustomStoreOrder;