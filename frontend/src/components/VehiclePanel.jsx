import React from 'react';

const VehiclePanel = (props) => {

    // Vehicle types with their labels
    const vehicleTypes = [
        { type: '4-seater hatchback', label: 'Hatchback', image: "https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg", description: 'Affordable, compact rides' },
        { type: '4-seater sedan', label: 'Sedan', image: "https://img.freepik.com/free-vector/realistic-car-mockup_107791-2432.jpg", description: 'Comfortable and stylish' },
        { type: '7-seater SUV', label: 'SUV', image: "https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_638,w_956/v1649231091/assets/2c/7fa194-c954-49b2-9c6d-a3b8601370f5/original/Uber_Moto_Orange_312x208_pixels_Mobile.png", description: 'Spacious family ride' },
        { type: '7-seater MUV', label: 'MUV', image: "https://img.indianautosblog.com/2016/02/Renault-Lodgy-Stepway-edition-at-IAA-2015.jpg", description: 'Large family carrier' },
    ];

    return (
        <div>
            <h5 className='p-1 text-center w-[93%] absolute top-0' onClick={() => {
                props.setVehiclePanel(false);
            }}>
                <i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i>
            </h5>
            <h3 className='text-2xl font-semibold mb-5'>Choose a Vehicle</h3>

            {/* Mapping through vehicle types to generate UI */}
            {vehicleTypes.map((vehicle, index) => (
                <div
                    key={index}
                    onClick={() => {
                        props.setConfirmRidePanel(true);
                        props.selectVehicle(vehicle.type);
                    }}
                    className='flex border-2 active:border-black mb-2 rounded-xl w-full p-3 items-center justify-between'
                >
                    <img className='h-10' src={vehicle.image} alt={vehicle.label} />
                    <div className='ml-2 w-1/2'>
                        <h4 className='font-medium text-base'>{vehicle.label} <span><i className="ri-user-3-fill"></i> {vehicle.type.charAt(0)}</span></h4>
                        <h5 className='font-medium text-sm'>2 mins away </h5>
                        <p className='text-normal text-xs text-gray-600'>{vehicle.description}</p>
                    </div>
                    <h2 className='text-lg font-semibold'>₹{props.fare[vehicle.type]}</h2>
                </div>
            ))}
        </div>
    );
}

export default VehiclePanel;
