import React from 'react';

const LocationSearchPanel = ({ suggestions, onSelect }) => {
  return (
    <div className="absolute left-0 right-0 bg-white border rounded shadow mt-1 max-h-60 overflow-y-auto z-50">
      {suggestions.length > 0 ? (
        suggestions.map((suggestion, index) => (
          <div
            key={index}
            className="p-2 hover:bg-gray-200 cursor-pointer"
            onClick={() => onSelect(suggestion)}
          >
            {suggestion}
          </div>
        ))
      ) : (
        <div className="p-2 text-gray-500">No suggestions available</div>
      )}
    </div>
  );
};

export default LocationSearchPanel;
