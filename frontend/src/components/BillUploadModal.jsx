import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, IndianRupee, Image } from 'lucide-react';
import PremiumButton from './PremiumButton';

const BillUploadModal = ({ isOpen, onClose, order, onSubmit }) => {
  const [billAmount, setBillAmount] = useState('');
  const [billImage, setBillImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(billAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid bill amount greater than 0');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        billAmount: parsedAmount,
        billImage: billImage || '/uploads/receipt.jpg', // Mock fallback
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
        />

        {/* Modal content body */}
        <motion.div
          initial={{ scale: 0.95, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 20, opacity: 0 }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white dark:bg-[#1d1d22] p-6 shadow-2xl border border-slate-100 dark:border-slate-800/80 z-10"
        >
          {/* Header */}
          <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                Generate Store Invoice
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Order #{order?._id.slice(-6).toUpperCase()}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-900/30">
                {error}
              </div>
            )}

            {/* Bill Amount Input */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Actual Store Bill Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500 font-bold">
                  <IndianRupee className="w-4 h-4" />
                </span>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-teal/50 focus:border-brand-teal transition-all font-semibold"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Enter the exact amount paid at the checkout counter.
              </p>
            </div>

            {/* Bill Image URL Input */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Receipt / Bill Image URL
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
                  <Image className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Paste URL or leave empty for mock image"
                  value={billImage}
                  onChange={(e) => setBillImage(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-teal/50 focus:border-brand-teal transition-all text-sm"
                />
              </div>
            </div>

            {/* Invoice Estimate Preview Mock */}
            {billAmount && !isNaN(parseFloat(billAmount)) && (
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/30 rounded-xl space-y-1.5 border border-slate-100 dark:border-slate-800">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Estimated Invoice Breakdown</div>
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                  <span>Store Bill subtotal:</span>
                  <span>₹{parseFloat(billAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                  <span>Delivery Charge:</span>
                  <span>₹35.00</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                  <span>Service Fee (5%, min ₹15):</span>
                  <span>₹{Math.max(15, Math.round(parseFloat(billAmount) * 0.05)).toFixed(2)}</span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-800 pt-1.5 flex justify-between text-sm font-bold text-slate-800 dark:text-white">
                  <span>Customer Pays Total:</span>
                  <span>
                    ₹{(
                      parseFloat(billAmount) +
                      35 +
                      Math.max(15, Math.round(parseFloat(billAmount) * 0.05))
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-3 pt-2">
              <PremiumButton
                onClick={onClose}
                variant="outline"
                className="flex-1 py-2.5 text-sm"
              >
                Cancel
              </PremiumButton>
              <PremiumButton
                type="submit"
                variant="amber"
                loading={loading}
                className="flex-1 py-2.5 text-sm"
              >
                Generate Invoice
              </PremiumButton>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BillUploadModal;
