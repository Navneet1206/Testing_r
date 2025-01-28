import { createContext, useState, useEffect } from 'react';

export const CaptainDataContext = createContext();

const CaptainContext = ({ children }) => {
  const [captain, setCaptain] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Default to `true` as we are fetching on mount
  const [error, setError] = useState(null);

  // Function to manually update captain data
  const updateCaptain = (captainData) => {
    setCaptain(captainData);
  };

  // Fetch captain data
  useEffect(() => {
    const fetchCaptain = async () => {
      setIsLoading(true);
      setError(null);
  
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token missing');
        setIsLoading(false);
        return;
      }
  
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/captains/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        const data = await response.json();
        if (response.ok) {
          setCaptain(data.captain);
          console.log('Captain data fetched:', data.captain); // Debug log
        } else {
          setError(data.message || 'Failed to fetch captain data');
          console.error('Error fetching captain data:', data.message);
        }
      } catch (err) {
        setError('Network error: ' + err.message);
        console.error('Network error fetching captain:', err);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchCaptain();
  }, []);
  

  const value = {
    captain,
    setCaptain,
    isLoading,
    setIsLoading,
    error,
    setError,
    updateCaptain,
  };

  return (
    <CaptainDataContext.Provider value={value}>
      {children}
    </CaptainDataContext.Provider>
  );
};

export default CaptainContext;
