// Pricing configuration for different vehicle types
export const vehiclePricing = {
  bike: {
    baseFare: 30, // Base fare in rupees
    perKm: 8,     // Per kilometer charge
    perMinute: 1, // Per minute charge
    maxPassengers: 1,
    icon: '🏍️',
    name: 'Bike'
  },
  auto: {
    baseFare: 40,
    perKm: 12,
    perMinute: 1.5,
    maxPassengers: 3,
    icon: '🛺',
    name: 'Auto'
  },
  sedan: {
    baseFare: 60,
    perKm: 15,
    perMinute: 2,
    maxPassengers: 4,
    icon: '🚗',
    name: 'Sedan'
  },
  suv: {
    baseFare: 80,
    perKm: 18,
    perMinute: 2.5,
    maxPassengers: 6,
    icon: '🚙',
    name: 'SUV'
  }
};

export const calculateFare = (
  vehicleType: keyof typeof vehiclePricing,
  distanceInKm: number,
  durationInMinutes: number
): number => {
  const pricing = vehiclePricing[vehicleType];
  const fare = pricing.baseFare + 
               (pricing.perKm * distanceInKm) + 
               (pricing.perMinute * durationInMinutes);
  
  // Add surge pricing during peak hours (1.2x between 8-10 AM and 5-7 PM)
  const hour = new Date().getHours();
  const isPeakHour = (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 19);
  const surgeFactor = isPeakHour ? 1.2 : 1;

  return Math.round(fare * surgeFactor);
};