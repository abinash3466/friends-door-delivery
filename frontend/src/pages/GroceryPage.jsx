import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, IndianRupee, Search, Plus, Minus, Clock, AlertCircle, ShoppingBag, Truck } from 'lucide-react';
import Navbar from '../components/Navbar';
import PremiumButton from '../components/PremiumButton';

const GroceryPage = () => {
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [cart, setCart] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [itemSearchQuery, setItemSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, Grocery, Pharmacy, Bakery, Provision Store
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [address, setAddress] = useState('Vikramasingapuram Center, TN');
  const [lat, setLat] = useState('8.7000');
  const [lng, setLng] = useState('77.4000');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroceries = async () => {
      try {
        const res = await axios.get('/api/admin/stores');
        if (res.data.success) {
          const activeGroceries = res.data.stores.filter(
            s => ['Grocery', 'Pharmacy', 'Bakery', 'Provision Store'].includes(s.type) && s.isActive
          );
          setStores(activeGroceries);
        }
      } catch (error) {
        console.error('Error fetching grocery stores:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGroceries();
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

  // Advanced Instamart Billing Calculations
  const cartItemsArray = Object.values(cart);
  const itemTotal = cartItemsArray.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = itemTotal > 0 && itemTotal < 500 ? 25 : 0; // Free delivery over 500 like Zepto
  const handlingFee = itemTotal > 0 ? 4 : 0;
  const cartTotalValue = itemTotal + deliveryFee + handlingFee;

  // Filter Logics
  const filteredStores = stores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.locationName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'ALL' || store.type === activeTab;
    return matchesSearch && matchesTab;
  });

  const filteredItems = selectedStore?.items?.filter(item =>
    item.name.toLowerCase().includes(itemSearchQuery.toLowerCase())
  );

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
        orderType: 'GROCERY',
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
        alert('Instamart order placed successfully! Flash delivery tracking assigned.');
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
    <div className="flex-1 flex flex-col bg-[#F3F4F6] dark:bg-[#0e0e10]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Instamart Style Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-white dark:bg-[#18181c] p-6 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-sm gap-4">
          <div className="flex items-center space-x-4">
            <Link to="/customer" className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Instamart Delivery</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Fresh groceries, bakeries, and daily essentials delivered in 15 mins.</p>
            </div>
          </div>
          {/* Zepto Delivery Timer Banner */}
          <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-black shadow-sm self-start md:self-center animate-pulse">
            <Clock className="w-4 h-4" />
            <span>FLASH DELIVERY ACTIVE • VKS / AMBAS ZONE</span>
          </div>
        </div>

        {loading ? (
          <div className="py-24 flex justify-center"><div className="w-10 h-10 rounded-full border-4 border-brand-teal border-t-transparent animate-spin"></div></div>
        ) : !selectedStore ? (
          /* Zepto Category Store Browser Dashboard */
          <div className="space-y-6">
            {/* Quick Category Tab Filters */}
            <div className="flex flex-wrap gap-2 pb-1 overflow-x-auto">
              {['ALL', 'Grocery', 'Provision Store', 'Pharmacy', 'Bakery'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${activeTab === tab
                      ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:text-black dark:border-white shadow-sm'
                      : 'bg-white dark:bg-[#18181c] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                    }`}
                >
                  {tab === 'ALL' ? 'All Hubs 🏪' : tab}
                </button>
              ))}
            </div>

            {/* Global Store Search Engine */}
            <div className="relative max-w-md shadow-sm rounded-xl overflow-hidden">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400"><Search className="w-5 h-5" /></span>
              <input
                type="text"
                placeholder="Search daily needs, medicals, fresh breads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#18181c] text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-teal text-sm transition-all"
              />
            </div>

            {filteredStores.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#18181c] border border-slate-200 dark:border-slate-850 text-slate-400">No active merchants found matching criteria.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStores.map((store) => (
                  <div
                    key={store._id}
                    onClick={() => setSelectedStore(store)}
                    className="group bg-white dark:bg-[#18181c] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-850 shadow-sm hover:shadow-md cursor-pointer transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="relative overflow-hidden h-44 bg-slate-100">
                      <img
                        src={store.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500'}
                        alt={store.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-3 left-3 bg-brand-teal text-white px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wide">
                        {store.type}
                      </span>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h4 className="font-black text-base text-slate-850 dark:text-white group-hover:text-brand-teal transition-colors">{store.name}</h4>
                        <p className="text-xs text-slate-400 mt-1">📍 Delivery Area: {store.locationName}</p>
                      </div>
                      <div className="text-xs text-brand-amber font-black pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <span>Browse Catalog</span>
                        <span>⚡ 15 Mins</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Instamart Catalog Menu Grid */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Catalog list section */}
            <div className="lg:col-span-2 bg-white dark:bg-[#18181c] rounded-2xl p-6 border border-slate-200 dark:border-slate-850 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-150 dark:border-slate-800 gap-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">{selectedStore.name} Inventory</h3>
                  <p className="text-xs text-slate-450 dark:text-slate-400">{selectedStore.type} • {selectedStore.locationName}</p>
                </div>
                <button onClick={() => { setSelectedStore(null); setCart({}); }} className="text-xs font-bold text-brand-teal bg-brand-teal/5 px-3 py-1.5 rounded-lg hover:bg-brand-teal/10 transition-all">
                  Switch Store Hub
                </button>
              </div>

              {/* Catalog Search box */}
              <div className="relative max-w-xs shadow-sm rounded-xl overflow-hidden">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><Search className="w-4 h-4" /></span>
                <input
                  type="text"
                  placeholder="Search items in inventory..."
                  value={itemSearchQuery}
                  onChange={(e) => setItemSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 border border-slate-200 dark:border-slate-800 bg-transparent text-xs text-slate-800 dark:text-white focus:outline-none"
                />
              </div>

              {filteredItems?.length === 0 ? (
                <div className="text-slate-400 text-xs py-8 text-center">No active stock matching your keyword.</div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-850">
                  {filteredItems?.map((item) => (
                    <div key={item._id} className="py-4 flex justify-between items-center gap-4">
                      <div className="space-y-1 max-w-[70%]">
                        <h4 className="text-sm font-bold text-slate-800 dark:text-white">{item.name}</h4>
                        <p className="text-xs text-slate-450 dark:text-slate-400 line-clamp-2">{item.description || 'Pantry essential packed with care.'}</p>
                        <div className="text-sm font-black text-slate-850 dark:text-slate-200 flex items-center pt-0.5">
                          <IndianRupee className="w-3.5 h-3.5 mr-0.5" />{item.price}
                        </div>
                      </div>

                      {/* Zepto Premium Action Button */}
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
                              className="w-full bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-brand-teal font-black text-xs py-2 transition-all flex items-center justify-center"
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

            {/* Right Column: Checkout Invoice Basket */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#18181c] rounded-2xl p-5 border border-slate-200 dark:border-slate-850 shadow-sm space-y-4">
                <div className="flex items-center space-x-2 font-black text-slate-850 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                  <ShoppingBag className="w-5 h-5 text-brand-teal" />
                  <span>Basket Summary</span>
                </div>

                {cartItemsArray.length === 0 ? (
                  <div className="text-xs text-slate-450 dark:text-slate-400 text-center py-10 flex flex-col items-center justify-center space-y-2">
                    <ShoppingCart className="w-8 h-8 text-slate-200" />
                    <span>Your instamart basket is empty.</span>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                      {cartItemsArray.map((item) => (
                        <div key={item._id} className="flex justify-between items-center text-xs text-slate-700 dark:text-slate-350">
                          <span className="font-medium">{item.name} <b className="text-brand-teal">x{item.quantity}</b></span>
                          <span className="font-bold">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* Instamart Bill Breakdown */}
                    <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex justify-between"><span>Item Subtotal</span><span className="font-semibold text-slate-700 dark:text-slate-300">₹{itemTotal}</span></div>
                      <div className="flex justify-between"><span>Handling Charge</span><span>₹{handlingFee}</span></div>
                      <div className="flex justify-between text-emerald-600">
                        <span>Delivery Partner Fee</span>
                        <span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
                      </div>
                    </div>

                    {/* Grand Total */}
                    <div className="border-t border-slate-150 dark:border-slate-800 pt-3 flex justify-between font-black text-slate-900 dark:text-white text-sm">
                      <span>Total Pay Bill:</span>
                      <span className="flex items-center text-brand-teal"><IndianRupee className="w-4 h-4 mr-0.5" />{cartTotalValue}</span>
                    </div>

                    {/* Order Checkpoint Validator */}
                    {itemTotal < 200 ? (
                      <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 text-amber-700 dark:text-amber-400 rounded-xl flex items-start space-x-2 text-[11px] leading-relaxed">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-500 mt-0.5" />
                        <span>Add <b>₹{200 - itemTotal}</b> more items to pass the minimum basket routing parameters.</span>
                      </div>
                    ) : (
                      /* Address and Coordinate fields */
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
                      Place Delivery Order (COD)
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

export default GroceryPage;