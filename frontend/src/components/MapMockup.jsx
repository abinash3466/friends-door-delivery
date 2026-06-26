import React from 'react';
import { Compass, MapPin, Navigation, Info } from 'lucide-react';
import { OPERATIONAL_HUBS } from "../constants/locations";

const MapMockup = ({ 
  pickupCoords, 
  destCoords, 
  pickupName = 'Pickup Point', 
  destName = 'Destination Point',
  serviceZoneStatus = true 
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-xl h-[320px] md:h-[400px]">
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-40"></div>
      
      {/* Radial Grid Shadow for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0f172a_80%)]"></div>

      {/* Geofence Hub Markers */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {/* Draw Service Zone Radii (15km circle approximations) */}
        <circle cx="50%" cy="50%" r="90" className="fill-brand-teal/5 stroke-brand-teal/20 stroke-2 stroke-dasharray animate-[spin_40s_linear_infinite]" />
        <circle cx="50%" cy="50%" r="140" className="fill-transparent stroke-brand-teal/10 stroke-1 stroke-dashed" />
        
        {/* Drawing Local Connections */}
        <line x1="35%" y1="45%" x2="50%" y2="50%" stroke="rgba(0,128,128,0.2)" strokeWidth="2" strokeDasharray="4 4" />
        <line x1="50%" y1="50%" x2="65%" y2="40%" stroke="rgba(0,128,128,0.2)" strokeWidth="2" strokeDasharray="4 4" />
        <line x1="50%" y1="50%" x2="45%" y2="65%" stroke="rgba(0,128,128,0.2)" strokeWidth="2" strokeDasharray="4 4" />
        <line x1="45%" y1="65%" x2="65%" y2="40%" stroke="rgba(0,128,128,0.1)" strokeWidth="2" strokeDasharray="4 4" />
      </svg>

      {/* Simulated Operational Hub Points */}
      <div className="absolute top-[45%] left-[35%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
        <span className="w-3 h-3 rounded-full bg-brand-teal ring-4 ring-brand-teal/30 animate-pulse"></span>
        <span className="text-[10px] text-slate-400 mt-1 font-bold">Papanasam</span>
      </div>
      <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
        <span className="w-3.5 h-3.5 rounded-full bg-brand-teal ring-4 ring-brand-teal/40 animate-pulse"></span>
        <span className="text-[10px] text-brand-amber font-bold mt-1">Ambasamudram</span>
      </div>
      <div className="absolute top-[40%] left-[65%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
        <span className="w-3 h-3 rounded-full bg-brand-teal ring-4 ring-brand-teal/30 animate-pulse"></span>
        <span className="text-[10px] text-slate-400 mt-1 font-bold">Vikramasingapuram</span>
      </div>
      <div className="absolute top-[65%] left-[45%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
        <span className="w-3 h-3 rounded-full bg-brand-teal ring-4 ring-brand-teal/30 animate-pulse"></span>
        <span className="text-[10px] text-slate-400 mt-1 font-bold">Alwarkurichi</span>
      </div>

      {/* Active Route Tracing (If Pick & Dest selected) */}
      {pickupCoords && destCoords && (
        <>
          {/* Animated Rider Path */}
          <div className="absolute top-[52%] left-[42%] flex items-center space-x-1.5 bg-brand-amber text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg border border-white/20 z-10 animate-bounce">
            <Compass className="w-3 h-3 animate-spin" />
            <span>Driver Moving</span>
          </div>

          <svg className="absolute inset-0 w-full h-full z-0" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M 180 180 Q 230 220, 280 190" 
              fill="transparent" 
              stroke="#FFBF00" 
              strokeWidth="3.5" 
              strokeDasharray="6 6"
              className="animate-[dash_2s_linear_infinite]"
            />
            <style>{`
              @keyframes dash {
                to {
                  stroke-dashoffset: -20;
                }
              }
            `}</style>
          </svg>

          {/* Pickup Marker */}
          <div className="absolute top-[48%] left-[38%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
            <MapPin className="w-6 h-6 text-red-500 fill-red-500/20 filter drop-shadow-md" />
            <span className="bg-slate-800 text-[9px] px-1.5 py-0.5 rounded border border-slate-700 mt-0.5 truncate max-w-[80px]">
              {pickupName}
            </span>
          </div>

          {/* Destination Marker */}
          <div className="absolute top-[52%] left-[58%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
            <Navigation className="w-6 h-6 text-brand-teal fill-brand-teal/20 filter drop-shadow-md rotate-45" />
            <span className="bg-slate-800 text-[9px] px-1.5 py-0.5 rounded border border-slate-700 mt-0.5 truncate max-w-[80px]">
              {destName}
            </span>
          </div>
        </>
      )}

      {/* Info Floating Badge */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10 pointer-events-none">
        <div className="flex items-center space-x-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800">
          <span className={`w-2.5 h-2.5 rounded-full ${serviceZoneStatus ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></span>
          <span className="text-[11px] font-semibold text-slate-300">
            {serviceZoneStatus ? 'Geofence Active: Tamil Nadu (TN-72)' : 'OUTSIDE SERVICE AREA'}
          </span>
        </div>

        <div className="flex items-center space-x-1 bg-brand-teal/20 backdrop-blur-md text-brand-teal-light border border-brand-teal/30 px-2.5 py-1 rounded-lg text-[10px] font-bold">
          <Info className="w-3.5 h-3.5" />
          <span>Hub Radius: 12KM</span>
        </div>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 bg-slate-950/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-800 text-[10px] space-y-1 max-w-[200px]">
        <div className="font-bold text-slate-400 uppercase tracking-wider mb-1">Operational Map Legend</div>
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-brand-teal"></span>
          <span className="text-slate-300">Friends Hub Center</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-brand-amber"></span>
          <span className="text-slate-300">Active Delivery Route</span>
        </div>
      </div>
    </div>
  );
};

export default MapMockup;
