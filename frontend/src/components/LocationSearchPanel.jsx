import React from 'react';
import axios from 'axios'; // Import axios

const LocationSearchPanel = ({
    suggestions,
    setVehiclePanel,
    setPanelOpen,
    setPickup,
    setDestination,
    activeField,
    setPickupSuggestions, // Add setPickupSuggestions as a prop
}) => {
    const handleSuggestionClick = (suggestion) => {
        if (activeField === 'pickup') {
            setPickup(suggestion); // Set pickup location
        } else if (activeField === 'destination') {
            setDestination(suggestion); // Set destination location
        }
        setVehiclePanel(true); // Show vehicle panel
        setPanelOpen(false); // Close the search panel
    };

    return (
        <div>
            {/* Display fetched suggestions */}
            {suggestions.length > 0 ? (
                suggestions.map((elem, idx) => (
                    <div
                        key={idx}
                        onClick={() => handleSuggestionClick(elem)}
                        className='flex gap-4 border-2 p-3 border-gray-50 active:border-black rounded-xl items-center my-2 justify-start cursor-pointer hover:bg-gray-100'
                    >
                        <h2 className='bg-[#eee] h-8 flex items-center justify-center w-12 rounded-full'>
                            <i className="ri-map-pin-fill"></i>
                        </h2>
                        <h4 className='font-medium'>{elem}</h4>
                    </div>
                ))
            ) : (
                <p className='text-gray-500 text-center'>No suggestions found.</p>
            )}
        </div>
    );
};

export default LocationSearchPanel;