const UserCard = ({ user, toggleBlock }) => {
    return (
      <div className="bg-white shadow-md p-4 rounded-md">
        <h3 className="text-lg font-bold">{user.fullname.firstname} {user.fullname.lastname}</h3>
        <p className="text-gray-600">{user.email}</p>
        <p className={`text-sm ${user.status === "blocked" ? "text-red-500" : "text-green-500"}`}>{user.status}</p>
        <button 
          onClick={() => toggleBlock(user._id, user.status)} 
          className={`mt-2 p-2 rounded text-white ${user.status === "blocked" ? "bg-green-500" : "bg-red-500"}`}
        >
          {user.status === "blocked" ? "Unblock" : "Block"}
        </button>
      </div>
    );
  };
  
  export default UserCard;
  