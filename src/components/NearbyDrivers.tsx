import React from 'react';
import { User, MapPin } from 'lucide-react';

interface Driver {
  _id: string;
  name: string;
  phone: string;
  profilePhoto: string;
  distance: number;
  estimatedArrival: number;
}

interface NearbyDriversProps {
  drivers: Driver[];
  isLoading: boolean;
}

const NearbyDrivers: React.FC<NearbyDriversProps> = ({ drivers, isLoading }) => {
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="mt-2 h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (drivers.length === 0) {
    return (
      <div className="text-center py-4">
        <User className="h-8 w-8 mx-auto text-gray-400" />
        <p className="mt-2 text-sm text-gray-500">No drivers available nearby</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {drivers.map((driver) => (
        <div key={driver._id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
          <div className="flex items-center space-x-4">
            <img
              src={driver.profilePhoto || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
              alt={driver.name}
              className="h-12 w-12 rounded-full object-cover"
            />
            <div>
              <h4 className="text-sm font-medium text-gray-900">{driver.name}</h4>
              <div className="mt-1 flex items-center text-sm text-gray-500">
                <MapPin className="h-4 w-4 mr-1" />
                {driver.distance < 1 
                  ? `${Math.round(driver.distance * 1000)}m away`
                  : `${driver.distance.toFixed(1)}km away`
                }
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">
              {driver.estimatedArrival < 1 
                ? '< 1 min'
                : `${Math.round(driver.estimatedArrival)} mins`
              }
            </p>
            <p className="text-xs text-gray-500">arrival time</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NearbyDrivers;