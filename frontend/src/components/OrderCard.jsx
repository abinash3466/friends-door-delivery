import React from 'react';
import { ShoppingBag, Bike, ArrowRight, User, ShoppingCart, IndianRupee, Clock, CheckCircle2 } from 'lucide-react';
import PremiumButton from './PremiumButton';

const OrderCard = ({ order, ride, onAction, onPay, userRole }) => {
  // If this card is rendering a Bike Taxi Ride
  if (ride) {
    const statusTimeline = ['REQUESTED', 'ASSIGNED', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED'];
    const currentStep = statusTimeline.indexOf(ride.status);
    
    return (
      <div className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#1d1d22] p-5 shadow-sm space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-amber/15 text-brand-amber flex items-center justify-center font-bold">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">Bike Taxi Trip</h4>
              <p className="text-[10px] text-slate-400">Ride #{ride._id.slice(-6).toUpperCase()}</p>
            </div>
          </div>
          <span className="text-xs font-bold text-brand-teal bg-brand-teal/5 dark:bg-brand-teal/10 px-2.5 py-1 rounded-full">
            {ride.status}
          </span>
        </div>

        {/* Route Locations */}
        <div className="bg-slate-50 dark:bg-slate-800/20 p-3.5 rounded-xl space-y-2 border border-slate-100 dark:border-slate-800/60 text-xs">
          <div className="flex items-start space-x-2">
            <span className="w-2 h-2 rounded-full bg-brand-teal mt-1 flex-shrink-0"></span>
            <span className="text-slate-600 dark:text-slate-300">
              <strong className="text-slate-800 dark:text-slate-100">Pickup:</strong> {ride.pickupLocation}
            </span>
          </div>
          <div className="h-4 border-l border-dashed border-slate-300 dark:border-slate-700 ml-1"></div>
          <div className="flex items-start space-x-2">
            <span className="w-2 h-2 rounded-full bg-brand-amber mt-1 flex-shrink-0"></span>
            <span className="text-slate-600 dark:text-slate-300">
              <strong className="text-slate-800 dark:text-slate-100">Dropoff:</strong> {ride.destinationLocation}
            </span>
          </div>
        </div>

        {/* Pricing details */}
        <div className="flex justify-between items-center text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-3">
          <span>Distance: {ride.distanceKm} KM</span>
          <span className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center">
            <IndianRupee className="w-3.5 h-3.5 mr-0.5" />
            {ride.finalFare}
          </span>
        </div>

        {/* Timeline Progress */}
        <div className="pt-2">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Trip Progress</div>
          <div className="flex justify-between items-center relative">
            <div className="absolute left-0 right-0 h-0.5 bg-slate-100 dark:bg-slate-800 z-0"></div>
            {statusTimeline.map((step, idx) => (
              <div key={step} className="flex flex-col items-center z-10">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                    idx <= currentStep
                      ? 'bg-brand-teal text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  {idx <= currentStep ? '✓' : idx + 1}
                </div>
                <span className="text-[8px] mt-1 text-slate-400 font-bold hidden sm:inline">
                  {step.slice(0, 6)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions depending on Role */}
        {userRole === 'WORKER' && ride.status !== 'COMPLETED' && ride.status !== 'CANCELLED' && (
          <div className="pt-2 flex space-x-2">
            {ride.status === 'ASSIGNED' && (
              <PremiumButton onClick={() => onAction(ride._id, 'ARRIVED')} variant="teal" className="w-full py-2 text-xs">
                I Have Arrived
              </PremiumButton>
            )}
            {ride.status === 'ARRIVED' && (
              <PremiumButton onClick={() => onAction(ride._id, 'IN_PROGRESS')} variant="amber" className="w-full py-2 text-xs">
                Start Trip
              </PremiumButton>
            )}
            {ride.status === 'IN_PROGRESS' && (
              <PremiumButton onClick={() => onAction(ride._id, 'COMPLETED')} variant="teal" className="w-full py-2 text-xs">
                Complete Trip
              </PremiumButton>
            )}
          </div>
        )}
      </div>
    );
  }

  // If this card is rendering a standard Food/Grocery/Custom Order
  const orderTimeline = [
    'RECEIVED',
    'ASSIGNED',
    'PURCHASE_IN_PROGRESS',
    'BILL_UPLOADED',
    'PAYMENT_CONFIRMED',
    'OUT_FOR_DELIVERY',
    'COMPLETED',
  ];
  const currentOrderStep = orderTimeline.indexOf(order.status);

  return (
    <div className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#1d1d22] p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand-teal/15 text-brand-teal flex items-center justify-center font-bold">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">
              {order.orderType} Order
            </h4>
            <p className="text-[10px] text-slate-400">Order #{order._id.slice(-6).toUpperCase()}</p>
          </div>
        </div>
        <span className="text-xs font-bold text-brand-amber bg-brand-amber/10 text-brand-amber-dark px-2.5 py-1 rounded-full">
          {order.status}
        </span>
      </div>

      {/* Order Info */}
      <div className="text-xs space-y-2">
        {order.store ? (
          <div className="text-slate-500 dark:text-slate-400">
            Store: <strong className="text-slate-700 dark:text-slate-200">{order.store.name}</strong>
          </div>
        ) : order.customStoreDetails?.storeName ? (
          <div className="text-slate-500 dark:text-slate-400">
            Custom Store: <strong className="text-slate-700 dark:text-slate-200">{order.customStoreDetails.storeName}</strong>
          </div>
        ) : null}

        {/* Item listing */}
        {order.items && order.items.length > 0 ? (
          <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl space-y-1">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>{item.name} x{item.quantity}</span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
        ) : order.customStoreDetails?.shoppingList ? (
          <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl space-y-1">
            <div className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">Shopping List</div>
            <div className="text-slate-700 dark:text-slate-300 whitespace-pre-line text-xs font-mono">
              {order.customStoreDetails.shoppingList}
            </div>
          </div>
        ) : null}

        {/* Address */}
        <div className="text-[11px] text-slate-500 dark:text-slate-400">
          Delivery Address: <span className="text-slate-700 dark:text-slate-200">{order.deliveryAddress}</span>
        </div>
      </div>

      {/* Bill Breakdowns */}
      <div className="border-t border-b border-slate-100 dark:border-slate-800 py-3 text-xs space-y-1.5 font-semibold text-slate-500">
        <div className="flex justify-between text-slate-500 dark:text-slate-400">
          <span>Cart Value (Estimated):</span>
          <span>₹{order.estimatedCartValue}</span>
        </div>
        {order.billAmount > 0 && (
          <>
            <div className="flex justify-between">
              <span>Actual Store Bill:</span>
              <span>₹{order.billAmount}</span>
            </div>
            <div className="flex justify-between">
              <span>Service Charge:</span>
              <span>₹{order.serviceCharge}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Charge:</span>
              <span>₹{order.deliveryCharge}</span>
            </div>
            <div className="flex justify-between text-slate-800 dark:text-white font-extrabold pt-1">
              <span>Final Total (Grand):</span>
              <span className="flex items-center text-sm">
                <IndianRupee className="w-3.5 h-3.5 mr-0.5" />
                {order.grandTotal}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Timeline Tracking */}
      <div className="pt-2">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Delivery Track</div>
        <div className="flex justify-between items-center relative">
          <div className="absolute left-0 right-0 h-0.5 bg-slate-100 dark:bg-slate-800 z-0"></div>
          {orderTimeline.map((step, idx) => (
            <div key={step} className="flex flex-col items-center z-10">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                  idx <= currentOrderStep
                    ? 'bg-brand-teal text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}
              >
                {idx <= currentOrderStep ? '✓' : idx + 1}
              </div>
              <span className="text-[8px] mt-1 text-slate-400 font-bold hidden lg:inline">
                {step.slice(0, 6)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="pt-1 flex space-x-2">
        {/* Customer Actions */}
        {userRole === 'CUSTOMER' && order.status === 'BILL_UPLOADED' && (
          <PremiumButton onClick={() => onPay(order._id)} variant="amber" className="w-full py-2.5 text-xs">
            Pay Invoice (₹{order.grandTotal})
          </PremiumButton>
        )}

        {/* Worker Actions */}
        {userRole === 'WORKER' && (
          <>
            {order.status === 'ASSIGNED' && (
              <PremiumButton onClick={() => onAction(order._id, 'PURCHASE_IN_PROGRESS')} variant="teal" className="w-full py-2.5 text-xs">
                Start Purchase at Store
              </PremiumButton>
            )}
            {order.status === 'PURCHASE_IN_PROGRESS' && (
              <PremiumButton onClick={() => onAction(order._id, 'BILL_UPLOADED')} variant="amber" className="w-full py-2.5 text-xs">
                Upload Purchase Bill
              </PremiumButton>
            )}
            {order.status === 'PAYMENT_CONFIRMED' && (
              <PremiumButton onClick={() => onAction(order._id, 'OUT_FOR_DELIVERY')} variant="teal" className="w-full py-2.5 text-xs">
                Depart for Delivery
              </PremiumButton>
            )}
            {order.status === 'OUT_FOR_DELIVERY' && (
              <PremiumButton onClick={() => onAction(order._id, 'COMPLETED')} variant="teal" className="w-full py-2.5 text-xs">
                Confirm Handed Over
              </PremiumButton>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OrderCard;
