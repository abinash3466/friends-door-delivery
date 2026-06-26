import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Store as StoreIcon, Plus, Trash2, Edit, X, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import PremiumButton from '../components/PremiumButton';

const StoreManager = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [type, setType] = useState('Restaurant');
  const [locationName, setLocationName] = useState('Ambasamudram');
  const [lat, setLat] = useState('8.7061');
  const [lng, setLng] = useState('77.4578');
  const [image, setImage] = useState('');
  const [itemsList, setItemsList] = useState([]);
  
  // Item Form fields
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemCategory, setItemCategory] = useState('');

  const navigate = useNavigate();

  const fetchStores = async () => {
    try {
      const res = await axios.get('/api/admin/stores');
      if (res.data.success) {
        setStores(res.data.stores);
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const resetForm = () => {
    setName('');
    setType('Restaurant');
    setLocationName('Ambasamudram');
    setLat('8.7061');
    setLng('77.4578');
    setImage('');
    setItemsList([]);
    setEditingStore(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleOpenEdit = (store) => {
    setEditingStore(store);
    setName(store.name);
    setType(store.type);
    setLocationName(store.locationName);
    setLat(store.coordinates.latitude.toString());
    setLng(store.coordinates.longitude.toString());
    setImage(store.image || '');
    setItemsList(store.items || []);
    setModalOpen(true);
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!itemName || !itemPrice) return;
    setItemsList(prev => [
      ...prev,
      {
        name: itemName,
        price: parseFloat(itemPrice),
        category: itemCategory || 'General',
        isAvailable: true,
      }
    ]);
    setItemName('');
    setItemPrice('');
    setItemCategory('');
  };

  const handleRemoveItem = (index) => {
    setItemsList(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name,
      type,
      locationName,
      coordinates: {
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
      },
      image: image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500',
      items: itemsList,
    };

    try {
      if (editingStore) {
        const res = await axios.put(`/api/admin/stores/${editingStore._id}`, payload);
        if (res.data.success) {
          alert('Store updated successfully');
        }
      } else {
        const res = await axios.post('/api/admin/stores', payload);
        if (res.data.success) {
          alert('Store created successfully');
        }
      }
      setModalOpen(false);
      resetForm();
      fetchStores();
    } catch (error) {
      alert(error.response?.data?.message || 'Store action failed. Check geofence parameters.');
    }
  };

  const handleDelete = async (storeId) => {
    if (!window.confirm('Are you sure you want to delete this store?')) return;
    try {
      const res = await axios.delete(`/api/admin/stores/${storeId}`);
      if (res.data.success) {
        alert('Store deleted successfully');
        fetchStores();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete store');
    }
  };

  const toggleStoreActive = async (store) => {
    try {
      const res = await axios.put(`/api/admin/stores/${store._id}`, { isActive: !store.isActive });
      if (res.data.success) {
        fetchStores();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to toggle status');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#FAFAFB] dark:bg-[#121214]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Link to="/owner" className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white flex items-center">
                <StoreIcon className="w-6 h-6 mr-2 text-brand-teal" />
                <span>Store Management CRUD</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Register restaurants, grocery chains, or provision shops in Tamil Nadu.
              </p>
            </div>
          </div>

          <PremiumButton onClick={handleOpenCreate} variant="teal" icon={<Plus className="w-4 h-4" />} className="py-2.5 text-xs">
            Add Store
          </PremiumButton>
        </div>

        {/* Store Cards Grid */}
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-brand-teal border-t-transparent animate-spin"></div>
          </div>
        ) : stores.length === 0 ? (
          <div className="glass-panel border border-dashed border-slate-200 dark:border-slate-800 p-8 rounded-2xl text-center">
            <StoreIcon className="w-10 h-10 text-slate-450 mx-auto mb-2" />
            <h4 className="font-bold text-slate-700 dark:text-slate-300">No stores found</h4>
            <p className="text-xs text-slate-400">Click the 'Add Store' button to register your first local shop.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => (
              <div key={store._id} className="glass-panel rounded-2xl overflow-hidden border border-slate-150 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
                <div>
                  <img
                    src={store.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500'}
                    alt={store.name}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-5 space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold bg-brand-teal/10 text-brand-teal px-2 py-0.5 rounded-full uppercase">
                        {store.type}
                      </span>
                      <button
                        onClick={() => toggleStoreActive(store)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          store.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-300'
                        }`}
                      >
                        {store.isActive ? 'Active' : 'Disabled'}
                      </button>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white">{store.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{store.locationName} • {store.coordinates.latitude.toFixed(4)}, {store.coordinates.longitude.toFixed(4)}</p>
                    </div>

                    {/* Items count */}
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Menu Items: <span className="font-bold text-slate-700 dark:text-slate-200">{store.items?.length || 0} items</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-850/10 flex justify-end space-x-2">
                  <button
                    onClick={() => handleOpenEdit(store)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-350 transition-colors"
                  >
                    <Edit className="w-4.5 h-4.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(store._id)}
                    className="p-2 rounded-xl bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-650 dark:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
          <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white dark:bg-[#1d1d22] p-6 shadow-2xl border border-slate-100 dark:border-slate-800/80 z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-slate-150 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                {editingStore ? 'Edit Store Registry' : 'Add Store to Service Area'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Store Name */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Store Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent text-sm"
                  />
                </div>

                {/* Store Type */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Store Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent text-sm dark:bg-[#1d1d22]"
                  >
                    <option value="Restaurant">Restaurant</option>
                    <option value="Grocery">Grocery</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Bakery">Bakery</option>
                    <option value="Provision Store">Provision Store</option>
                    <option value="Custom Shop">Custom Shop</option>
                  </select>
                </div>

                {/* Hub Town */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Operational Town</label>
                  <select
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent text-sm dark:bg-[#1d1d22]"
                  >
                    <option value="Ambasamudram">Ambasamudram</option>
                    <option value="Papanasam">Papanasam</option>
                    <option value="Vikramasingapuram">Vikramasingapuram</option>
                    <option value="Alwarkurichi">Alwarkurichi</option>
                  </select>
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Banner Image URL</label>
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent text-sm"
                  />
                </div>

                {/* Coordinates */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent text-sm"
                  />
                </div>
              </div>

              {/* Menu items list editor */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Catalog / Menu Items ({itemsList.length})</h4>
                
                {/* List items added */}
                <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-2 border border-slate-100 dark:border-slate-800 rounded-xl">
                  {itemsList.length === 0 ? (
                    <div className="text-[11px] text-slate-400">No items. Add items below.</div>
                  ) : (
                    itemsList.map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg text-xs">
                        <span>{item.name} (₹{item.price})</span>
                        <button type="button" onClick={() => handleRemoveItem(idx)} className="text-red-500 font-bold hover:scale-110">×</button>
                      </div>
                    ))
                  )}
                </div>

                {/* Add item form row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end bg-slate-50 dark:bg-slate-850/20 p-3 rounded-xl">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-450 uppercase mb-1">Item Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Parotta"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      className="w-full px-2 py-1.5 rounded bg-transparent border border-slate-250 dark:border-slate-850 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-450 uppercase mb-1">Price (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 15"
                      value={itemPrice}
                      onChange={(e) => setItemPrice(e.target.value)}
                      className="w-full px-2 py-1.5 rounded bg-transparent border border-slate-250 dark:border-slate-850 text-xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="bg-brand-teal text-white text-xs font-bold py-2 rounded shadow-sm hover:bg-brand-teal-light"
                  >
                    Add Menu Item
                  </button>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex space-x-3 pt-2">
                <PremiumButton onClick={() => setModalOpen(false)} variant="outline" className="flex-1 py-2 text-sm">
                  Cancel
                </PremiumButton>
                <PremiumButton type="submit" variant="teal" className="flex-1 py-2 text-sm">
                  {editingStore ? 'Save Changes' : 'Publish Store'}
                </PremiumButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreManager;
