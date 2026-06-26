import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, IndianRupee, Search, Plus, Minus, Star, Clock, AlertCircle, Info } from 'lucide-react';
import Navbar from '../components/Navbar';
import PremiumButton from '../components/PremiumButton';

const FoodPage = () => {
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [cart, setCart] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [menuSearchQuery, setMenuSearchQuery] = useState('');
  const [vegFilter, setVegFilter] = useState('ALL'); // ALL, VEG, NON_VEG
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [address, setAddress] = useState('Ambasamudram Center, TN');
  const [lat, setLat] = useState('8.7061');
  const [lng, setLng] = useState('77.4578');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await axios.get('/api/admin/stores');
        if (res.data.success) {
          const activeRestaurants = res.data.stores.filter(s => s.type === 'Restaurant' && s.isActive);
          setStores(activeRestaurants);
        }
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  const handleAddToCart = (item) => {
    setCart(prev => {
      const currentQty = prev[item._id]?.quantity || 0;
      return {
        ...prev,
        [item._id]: {
          ...item,
          quantity: currentQty + 1,
        }
      };
    });
  };

  const handleRemoveFromCart = (item) => {
    setCart(prev => {
      const currentQty = prev[item._id]?.quantity || 0;
      if (currentQty <= 1) {
        const newCart = { ...prev };
        delete newCart[item._id];
        return newCart;
      }
      return {
        ...prev,
        [item._id]: {
          ...prev[item._id],
          quantity: currentQty - 1,
        }
      };
    });
  };

  // Calculations
  const cartItemsArray = Object.values(cart);
  const itemTotal = cartItemsArray.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = itemTotal > 0 ? 30 : 0;
  const platformFee = itemTotal > 0 ? 5 : 0;
  const cartTotalValue = itemTotal + deliveryFee + platformFee;

  // Filter Restaurants
  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.locationName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter Menu Items
  const filteredMenuItems = selectedStore?.items?.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(menuSearchQuery.toLowerCase());
    if (vegFilter === 'VEG') return matchesSearch && item.isVeg;
    if (vegFilter === 'NON_VEG') return matchesSearch && !item.isVeg;
    return matchesSearch;
  });

  const handleCheckout = async () => {
    if (itemTotal < 200) {
      alert('Minimum item value is ₹200 to place an order.');
      return;
    }

    setCheckoutLoading(true);
    try {
      const orderItems = cartItemsArray.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      }));

      const res = await axios.post('/api/orders', {
        orderType: 'FOOD',
        storeId: selectedStore._id,
        items: orderItems,
        estimatedCartValue: cartTotalValue,
        deliveryAddress: address,
        deliveryCoordinates: {
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
        },
        paymentMethod: 'COD',
      });

      if (res.data.success) {
        alert('Food order placed successfully! Swiggy style agent mapping started.');
        setCart({});
        setSelectedStore(null);
        navigate('/customer');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Order failed.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F4F5F7] dark:bg-[#0f0f11]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Section */}
        <div className="flex items-center space-x-4 bg-white dark:bg-[#1a1a1f] p-5 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-sm">
          <Link to="/customer" className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Food Delivery Hub</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Top-rated local restaurants around Ambasamudram zone.</p>
          </div>
        </div>

        {loading ? (
          <div className="py-24 flex justify-center"><div className="w-10 h-10 rounded-full border-4 border-brand-teal border-t-transparent animate-spin"></div></div>
        ) : !selectedStore ? (
          /* Restaurant Grid Page */
          <div className="space-y-6">
            <div className="relative max-w-md shadow-sm rounded-xl overflow-hidden">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400"><Search className="w-5 h-5" /></span>
              <input
                type="text"
                placeholder="Search restaurants, biryani, parotta..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1a1f] text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-teal text-sm transition-all"
              />
            </div>

            {filteredStores.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#1a1a1f] border border-slate-200 dark:border-slate-850 text-slate-400">No restaurants matching your search.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStores.map((restaurant) => (
                  <div
                    key={restaurant._id}
                    onClick={() => setSelectedStore(restaurant)}
                    className="group bg-white dark:bg-[#1a1a1f] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-850 shadow-sm hover:shadow-md cursor-pointer transition-all duration-300 flex flex-col"
                  >
                    <div className="relative overflow-hidden h-48 bg-slate-100">
                      <img
                        src={restaurant.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500'}
                        alt={restaurant.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[10px] font-bold text-brand-teal uppercase shadow-sm">
                        {restaurant.locationName || 'Ambasamudram'}
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h4 className="font-black text-base text-slate-850 dark:text-white group-hover:text-brand-teal transition-colors">{restaurant.name}</h4>
                        <p className="text-xs text-slate-450 dark:text-slate-400 mt-1 line-clamp-1">Authentic regional flavors, quick service.</p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-bold">
                        <div className="flex items-center text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded-md">
                          <Star className="w-3.5 h-3.5 fill-emerald-600 mr-1" /> 4.2
                        </div>
                        <div className="flex items-center text-slate-500 dark:text-slate-400">
                          <Clock className="w-3.5 h-3.5 mr-1" /> 25-35 mins
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Swiggy Style Menu & Checkout Layout */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Menu Items */}
            <div className="lg:col-span-2 bg-white dark:bg-[#1a1a1f] rounded-2xl p-6 border border-slate-200 dark:border-slate-850 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-150 dark:border-slate-800 gap-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">{selectedStore.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">📍 Hub: {selectedStore.locationName || 'Ambasamudram Zone'}</p>
                </div>
                <button onClick={() => { setSelectedStore(null); setCart({}); }} className="text-xs font-bold text-brand-teal bg-brand-teal/5 px-3 py-1.5 rounded-lg hover:bg-brand-teal/10 transition-all self-start sm:self-center">
                  Change Restaurant
                </button>
              </div>

              {/* Advanced Internal Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 max-w-xs">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><Search className="w-4 h-4" /></span>
                  <input
                    type="text"
                    placeholder="Search dishes..."
                    value={menuSearchQuery}
                    onChange={(e) => setMenuSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
                  <button onClick={() => setVegFilter('ALL')} className={`px-3 py-1 rounded-lg ${vegFilter === 'ALL' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500'}`}>All</button>
                  <button onClick={() => setVegFilter('VEG')} className={`px-3 py-1 rounded-lg ${vegFilter === 'VEG' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500'}`}>Veg Only</button>
                  <button onClick={() => setVegFilter('NON_VEG')} className={`px-3 py-1 rounded-lg ${vegFilter === 'NON_VEG' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-500'}`}>Non-Veg</button>
                </div>
              </div>

              {/* Menu Render */}
              {filteredMenuItems?.length === 0 ? (
                <div className="text-slate-400 text-xs py-8 text-center">No dishes match your specified filter options.</div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-850">
                  {filteredMenuItems?.map((item) => (
                    <div key={item._id} className="py-5 flex justify-between items-start gap-4">
                      <div className="space-y-1.5 max-w-[70%]">
                        <div className="flex items-center space-x-2">
                          <span className={`w-3.5 h-3.5 border flex items-center justify-center p-0.5 ${item.isVeg ? 'border-emerald-600' : 'border-red-600'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-emerald-600' : 'bg-red-600'}`}></span>
                          </span>
                          <h4 className="text-sm font-black text-slate-800 dark:text-white">{item.name}</h4>
                        </div>
                        <p className="text-xs text-slate-450 dark:text-slate-400 leading-normal line-clamp-2">{item.description || 'Fresh and delicious local dish made to order.'}</p>
                        <div className="text-sm font-black text-slate-850 dark:text-slate-200 flex items-center pt-1">
                          <IndianRupee className="w-3.5 h-3.5 mr-0.5" />{item.price}
                        </div>
                      </div>

                      {/* Professional Swiggy style ADD button block */}
                      <div className="flex flex-col items-center flex-shrink-0 w-24">
                        <div className="w-full shadow-sm rounded-xl border border-slate-150 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-900">
                          {cart[item._id] ? (
                            <div className="flex items-center justify-between bg-brand-teal text-white px-2.5 py-2">
                              <button onClick={() => handleRemoveFromCart(item)} className="font-extrabold hover:scale-110"><Minus className="w-3.5 h-3.5" /></button>
                              <span className="text-xs font-black">{cart[item._id].quantity}</span>
                              <button onClick={() => handleAddToCart(item)} className="font-extrabold hover:scale-110"><Plus className="w-3.5 h-3.5" /></button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAddToCart(item)}
                              className="w-full bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-brand-teal font-black text-xs py-2 transition-all flex items-center justify-center space-x-1"
                            >
                              <span>ADD</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Checkout Billing Panel */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#1a1a1f] rounded-2xl p-5 border border-slate-200 dark:border-slate-850 shadow-sm space-y-4">
                <div className="flex items-center space-x-2 font-black text-slate-850 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                  <ShoppingCart className="w-5 h-5 text-brand-teal" />
                  <span>Cart Bill Summary</span>
                </div>

                {cartItemsArray.length === 0 ? (
                  <div className="text-xs text-slate-400 text-center py-10 flex flex-col items-center justify-center space-y-2">
                    <ShoppingCart className="w-8 h-8 text-slate-300 animate-pulse" />
                    <span>Your food tray is empty!</span>
                  </div>
                ) : (
                  <>
                    {/* Itemized summary */}
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                      {cartItemsArray.map((item) => (
                        <div key={item._id} className="flex justify-between items-center text-xs text-slate-700 dark:text-slate-350">
                          <div className="flex items-center space-x-1.5">
                            <span className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                            <span className="font-medium">{item.name} <b className="text-brand-teal">x{item.quantity}</b></span>
                          </div>
                          <span className="font-bold">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* Zomato Style Split-up Pricing Architecture */}
                    <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex justify-between"><span>Item Total</span><span className="font-semibold text-slate-700 dark:text-slate-300">₹{itemTotal}</span></div>
                      <div className="flex justify-between text-emerald-600"><span>Delivery Partner Fee</span><span>₹{deliveryFee}</span></div>
                      <div className="flex justify-between"><span>Platform Governance Charge</span><span>₹{platformFee}</span></div>
                    </div>

                    {/* Total Grand Bill */}
                    <div className="border-t border-slate-150 dark:border-slate-800 pt-3 flex justify-between font-black text-slate-900 dark:text-white text-sm">
                      <span>Grand Total:</span>
                      <span className="flex items-center text-brand-teal"><IndianRupee className="w-4 h-4 mr-0.5" />{cartTotalValue}</span>
                    </div>

                    {/* Validation Gate */}
                    {itemTotal < 200 ? (
                      <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 text-amber-700 dark:text-amber-400 rounded-xl flex items-start space-x-2 text-[11px] leading-relaxed">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-500 mt-0.5" />
                        <span>Add <b>₹{200 - itemTotal}</b> more to fulfill the minimum ordering threshold rule.</span>
                      </div>
                    ) : (
                      /* Geofence Checkpoints */
                      <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Delivery Drop Address</label>
                          <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-teal"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850">
                          <div>
                            <span className="text-[9px] text-slate-450 font-bold block mb-0.5">Latitude</span>
                            <input type="number" step="0.0001" value={lat} onChange={(e) => setLat(e.target.value)} className="w-full bg-white dark:bg-slate-800 px-2 py-1 text-xs border border-slate-200 dark:border-slate-700 rounded-md" />
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-450 font-bold block mb-0.5">Longitude</span>
                            <input type="number" step="0.0001" value={lng} onChange={(e) => setLng(e.target.value)} className="w-full bg-white dark:bg-slate-800 px-2 py-1 text-xs border border-slate-200 dark:border-slate-700 rounded-md" />
                          </div>
                        </div>
                      </div>
                    )}

                    <PremiumButton
                      onClick={handleCheckout}
                      variant="teal"
                      disabled={itemTotal < 200}
                      loading={checkoutLoading}
                      className="w-full py-3.5 mt-2 font-bold shadow-md rounded-xl text-xs uppercase tracking-wider"
                    >
                      Confirm COD Order
                    </PremiumButton>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default FoodPage;