const RideCard = ({ ride, updateStatus }) => {
    return (
      <div className="bg-white shadow-md p-4 rounded-md">
        <h3 className="text-lg font-bold">Ride: {ride.pickup} → {ride.destination}</h3>
        <p className="text-gray-600">User: {ride.user.fullname.firstname} {ride.user.fullname.lastname}</p>
        <p className="text-gray-600">Status: <span className="text-blue-500">{ride.status}</span></p>
        <div className="flex space-x-2 mt-2">
          <button onClick={() => updateStatus(ride._id, "ongoing")} className="p-2 bg-blue-500 text-white rounded">Ongoing</button>
          <button onClick={() => updateStatus(ride._id, "completed")} className="p-2 bg-green-500 text-white rounded">Complete</button>
          <button onClick={() => updateStatus(ride._id, "cancelled")} className="p-2 bg-red-500 text-white rounded">Cancel</button>
        </div>
      </div>
    );
  };
  
  export default RideCard;
  