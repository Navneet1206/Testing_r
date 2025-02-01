import React from 'react';

const VehiclePanel = (props) => {
    return (
        <div>
            <h5 className='p-1 text-center w-[93%] absolute top-0' onClick={() => {
                props.setVehiclePanel(false);
            }}>
                <i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i>
            </h5>
            <h3 className='text-2xl font-semibold mb-5'>Choose a Vehicle</h3>

            {/* 4-Seater */}
            <div onClick={() => {
                props.setConfirmRidePanel(true);
                props.selectVehicle('4-seater');
            }} className='flex border-2 active:border-black mb-2 rounded-xl w-full p-3 items-center justify-between'>
                <img className='h-10' src="https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg" alt="4-seater" />
                <div className='ml-2 w-1/2'>
                    <h4 className='font-medium text-base'>4-Seater <span><i className="ri-user-3-fill"></i> 4</span></h4>
                    <h5 className='font-medium text-sm'>2 mins away </h5>
                    <p className='text-normal text-xs text-gray-600'>Affordable, compact rides</p>
                </div>
                <h2 className='text-lg font-semibold'>₹{props.fare['4-seater']}</h2>
            </div>

            {/* 7-Seater */}
            <div onClick={() => {
                props.setConfirmRidePanel(true);
                props.selectVehicle('7-seater');
            }} className='flex border-2 active:border-black mb-2 rounded-xl w-full p-3 items-center justify-between'>
                <img className='h-10' src="https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_638,w_956/v1649231091/assets/2c/7fa194-c954-49b2-9c6d-a3b8601370f5/original/Uber_Moto_Orange_312x208_pixels_Mobile.png" alt="7-seater" />
                <div className='-ml-2 w-1/2'>
                    <h4 className='font-medium text-base'>7-Seater <span><i className="ri-user-3-fill"></i> 7</span></h4>
                    <h5 className='font-medium text-sm'>3 mins away </h5>
                    <p className='text-normal text-xs text-gray-600'>Affordable Family SUV</p>
                </div>
                <h2 className='text-lg font-semibold'>₹{props.fare['7-seater']}</h2>
            </div>

            {/* 11-Seater
            <div onClick={() => {
                props.setConfirmRidePanel(true);
                props.selectVehicle('11-seater');
            }} className='flex border-2 active:border-black mb-2 rounded-xl w-full p-3 items-center justify-between'>
                <img className='h-10' src="https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_368,w_552/v1648431773/assets/1d/db8c56-0204-4ce4-81ce-56a11a07fe98/original/Uber_Auto_558x372_pixels_Desktop.png" alt="11-seater" />
                <div className='ml-2 w-1/2'>
                    <h4 className='font-medium text-base'>11-Seater <span><i className="ri-user-3-fill"></i> 11</span></h4>
                    <h5 className='font-medium text-sm'>3 mins away </h5>
                    <p className='text-normal text-xs text-gray-600'>Affordable Mini Bus</p>
                </div>
                <h2 className='text-lg font-semibold'>₹{props.fare['11-seater']}</h2>
            </div> */}
        </div>
    );
}

export default VehiclePanel;
