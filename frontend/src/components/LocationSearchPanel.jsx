import React, { useState, useCallback } from 'react'

const LocationSearchPanel = ({ 
    suggestions, 
    setVehiclePanel, 
    setPanelOpen, 
    setPickup, 
    setDestination, 
    activeField 
}) => {
    const [isPanelVisible, setIsPanelVisible] = useState(true);

    const handleSuggestionClick = useCallback((suggestion) => {
        // Set pickup or destination
        if (activeField === 'pickup') {
            setPickup(suggestion)
        } else if (activeField === 'destination') {
            setDestination(suggestion)
        }
        
        // Hide panel after 1 second
        setTimeout(() => {
            setIsPanelVisible(false);

            // Unhide panel after 3 seconds
            setTimeout(() => {
                setIsPanelVisible(true);
            }, 4000);
        }, 1000);
    }, [activeField, setPickup, setDestination]);

    return (
        <>
            {isPanelVisible && (
                <div className='absolute top-70 left-0 w-full p-4 z-50'>
                    {suggestions.map((elem, idx) => (
                        <div 
                            key={idx} 
                            onClick={() => handleSuggestionClick(elem)} 
                            className='flex gap-4 border-2 p-3 border-gray-50 active:border-black rounded-xl items-center my-2 justify-start z-50'
                        >
                            <h2 className='bg-[#eee] h-8 flex items-center justify-center w-12 rounded-full'>
                                <i className="ri-map-pin-fill"></i>
                            </h2>
                            <h4 className='font-medium'>{elem}</h4>
                        </div>
                    ))}
                </div>
            )}
        </>
    )
}

export default LocationSearchPanel
