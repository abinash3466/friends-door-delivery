import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, IndianRupee, Search, Plus, Minus, Compass, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import PremiumButton from '../components/PremiumButton';

const GroceryPage = () => {
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [cart, setCart] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
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
          // Filter to Grocery, Bakery, provision, pharmacy
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
          _id: item._id,
          name: item.name,
          price: item.price,
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

  const cartItemsArray = Object.values(cart);
  const cartTotalValue = cartItemsArray.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (cartTotalValue < 200) {
      alert('Minimum order value is ₹200. Please add more items to your cart.');
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
        alert('Grocery order placed successfully!');
        setCart({});
        setSelectedStore(null);
        navigate('/customer');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Order placement failed. Check geofence rules.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#FAFAFB] dark:bg-[#121214]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center space-x-3">
          <Link to="/customer" className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">Grocery & Provisions</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Quick pantry essentials delivered straight to your home.</p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-brand-teal border-t-transparent animate-spin"></div>
          </div>
        ) : !selectedStore ? (
          /* Store list */
          <div className="space-y-6">
            <div className="relative max-w-md">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Search className="w-5 h-5" />
              </span>
              <input
                type="text"
                placeholder="Search grocery stores, pharmacies, bakeries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-[#1d1d22] text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-teal/50 transition-all text-sm shadow-sm"
              />
            </div>

            {stores.length === 0 ? (
              <div className="glass-panel p-8 text-center rounded-2xl text-slate-400">No active grocery stores found in the service zone.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stores.map((store) => (
                  <div
                    key={store._id}
                    onClick={() => setSelectedStore(store)}
                    className="premium-card glass-panel rounded-2xl overflow-hidden border border-slate-150 dark:border-slate-850 shadow-sm flex flex-col justify-between cursor-pointer"
                  >
                    <img
                      src={store.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500'}
                      alt={store.name}
                      className="w-full h-44 object-cover"
                    />
                    <div className="p-5">
                      <span className="text-[9px] font-bold bg-brand-teal/15 text-brand-teal px-2 py-0.5 rounded-full uppercase">
                        {store.type} • {store.locationName}
                      </span>
                      <h4 className="font-extrabold text-slate-850 dark:text-white mt-2">{store.name}</h4>
                      <p className="text-xs text-slate-450 dark:text-slate-400 mt-1">Get grains, flours, OTC drugs, and everyday necessities.</p>
                      <div className="text-xs text-brand-amber font-bold mt-3.5">
                        Open Catalog →
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Item catalog */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-slate-850 dark:text-white">{selectedStore.name} Inventory</h3>
                  <p className="text-xs text-slate-450 dark:text-slate-400">{selectedStore.type} • {selectedStore.locationName}</p>
                </div>
                <button
                  onClick={() => { setSelectedStore(null); setCart({}); }}
                  className="text-xs font-bold text-brand-teal hover:underline"
                >
                  Change Store
                </button>
              </div>

              {selectedStore.items?.length === 0 ? (
                <div className="text-slate-400 text-xs py-6">No items listed.</div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-850 space-y-4">
                  {selectedStore.items?.map((item) => (
                    <div key={item._id} className="pt-4 flex justify-between items-center">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-800 dark:text-white">{item.name}</h4>
                        <p className="text-xs text-slate-450 dark:text-slate-400">{item.description}</p>
                        <div className="text-sm font-extrabold text-slate-700 dark:text-slate-200 flex items-center pt-0.5">
                          <IndianRupee className="w-3.5 h-3.5 mr-0.5" />
                          {item.price}
                        </div>
                      </div>

                      <div>
                        {cart[item._id] ? (
                          <div className="flex items-center space-x-3 bg-brand-teal text-white rounded-xl px-3 py-1.5 shadow-md">
                            <button onClick={() => handleRemoveFromCart(item)} className="font-bold"><Minus className="w-3.5 h-3.5" /></button>
                            <span className="text-xs font-bold">{cart[item._id].quantity}</span>
                            <button onClick={() => handleAddToCart(item)} className="font-bold"><Plus className="w-3.5 h-3.5" /></button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAddToCart(item)}
                            className="bg-brand-teal/10 hover:bg-brand-teal/20 text-brand-teal font-bold text-xs px-4 py-2 rounded-xl border border-brand-teal/20 transition-all flex items-center space-x-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>ADD</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Panel */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Cart Basket</h3>
              <div className="glass-panel rounded-2xl p-5 border border-slate-100 dark:border-slate-850 space-y-4">
                <div className="flex items-center space-x-2 font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                  <ShoppingCart className="w-5 h-5 text-brand-teal" />
                  <span>Basket Summary</span>
                </div>

                {cartItemsArray.length === 0 ? (
                  <div className="text-xs text-slate-450 dark:text-slate-400 text-center py-6">Your cart is empty. Add grocery items from menu.</div>
                ) : (
                  <>
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {cartItemsArray.map((item) => (
                        <div key={item._id} className="flex justify-between text-xs text-slate-700 dark:text-slate-350">
                          <span>{item.name} x{item.quantity}</span>
                          <span>₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between font-bold text-slate-800 dark:text-white text-sm">
                      <span>Total Value:</span>
                      <span className="flex items-center">
                        <IndianRupee className="w-3.5 h-3.5 mr-0.5" />
                        {cartTotalValue}
                      </span>
                    </div>

                    {cartTotalValue < 200 ? (
                      <div className="p-3 bg-brand-amber/10 border border-brand-amber/25 text-brand-amber-dark rounded-xl flex items-start space-x-2 text-[10px]">
                        <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span>Minimum order total is ₹200. Add ₹{200 - cartTotalValue} more items to proceed.</span>
                      </div>
                    ) : (
                      <div className="space-y-3 pt-2 text-xs border-t border-slate-100 dark:border-slate-800">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Delivery Address</label>
                          <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[9px] text-slate-500 font-bold block mb-0.5">Lat (Geofence Check)</span>
                            <input
                              type="number"
                              step="0.0001"
                              value={lat}
                              onChange={(e) => setLat(e.target.value)}
                              className="w-full px-2 py-1 bg-transparent border border-slate-200 dark:border-slate-800 rounded-md text-[10px]"
                            />
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 font-bold block mb-0.5">Lng (Geofence Check)</span>
                            <input
                              type="number"
                              step="0.0001"
                              value={lng}
                              onChange={(e) => setLng(e.target.value)}
                              className="w-full px-2 py-1 bg-transparent border border-slate-200 dark:border-slate-800 rounded-md text-[10px]"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <PremiumButton
                      onClick={handleCheckout}
                      variant="amber"
                      disabled={cartTotalValue < 200}
                      loading={checkoutLoading}
                      className="w-full py-3 mt-4 text-xs"
                    >
                      Place COD Order
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
