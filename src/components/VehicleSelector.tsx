import React from 'react';
import { Car } from 'lucide-react';
import { vehiclePricing } from '../utils/pricing';

interface VehicleSelectorProps {
  selectedType: string;
  onSelect: (type: string) => void;
  distance: number;
  duration: number;
  passengers: number;
}

const VehicleSelector: React.FC<VehicleSelectorProps> = ({
  selectedType,
  onSelect,
  distance,
  duration,
  passengers
}) => {
  const calculateEstimatedFare = (type: keyof typeof vehiclePricing) => {
    const pricing = vehiclePricing[type];
    const fare = pricing.baseFare + 
                 (pricing.perKm * distance) + 
                 (pricing.perMinute * duration);
    
    const hour = new Date().getHours();
    const isPeakHour = (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 19);
    const surgeFactor = isPeakHour ? 1.2 : 1;

    return Math.round(fare * surgeFactor);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Object.entries(vehiclePricing).map(([type, details]) => {
        const isDisabled = passengers > details.maxPassengers;
        const estimatedFare = calculateEstimatedFare(type as keyof typeof vehiclePricing);

        return (
          <button
            key={type}
            onClick={() => !isDisabled && onSelect(type)}
            disabled={isDisabled}
            className={`
              p-4 border rounded-lg text-center transition-all
              ${isDisabled 
                ? 'opacity-50 cursor-not-allowed bg-gray-50' 
                : selectedType === type
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-200'
              }
            `}
          >
            <div className="text-2xl mb-2">{details.icon}</div>
            <div className="text-sm font-medium">{details.name}</div>
            <div className="text-xs text-gray-500">{details.maxPassengers} seats</div>
            <div className="mt-2 text-sm font-medium text-indigo-600">
              ₹{estimatedFare}
            </div>
            {isPeakHour && (
              <div className="mt-1 text-xs text-orange-500">
                Peak hour pricing
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default VehicleSelector;