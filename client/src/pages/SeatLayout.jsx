import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { assets, dummyDateTimeData, dummyShowsData } from '../assets/assets';
import Loading from '../components/Loading';
import { ArrowRightIcon, ClockIcon } from 'lucide-react';
import isoTimeformate from '../lib/isotimeformate';
import BlurCircle from '../components/BlurCircle';
import toast from 'react-hot-toast';
import { useAppContext } from '../context/AppContext';

function SeatLayout() {
    const grouprows = [["A", "B"], ["C", "D"], ["E", "F"], ["G", "H"], ["I", "J"]]

    const { id, date } = useParams();
    const [selectedSeats, setselectedSeats] = useState([]);
    const [selectedtime, setselectedtime] = useState(null);
    const [show, setshow] = useState(null)
    const [occupiedseats, setoccupiedseats] = useState([]);

    const navigate = useNavigate()

    const { axios, getToken, user } = useAppContext();

    const getshow = async () => {
        try {
            const { data } = await axios.get(`/api/show/${id}`)
            if (data.success) {
                setshow(data);
            }
        } catch (error) {
            console.error(error);
        }
    }
    
    // Time Slots को Date के आधार पर निकालें
    const timing = show?.dateTime?.[date] || []; 
    
    useEffect(() => {
        getshow()
    }, [id]); // id dependency add करें


    const getoccupiedseats = async () => { // showId argument हटाएँ
        try {
            // Check करें कि selectedtime मौजूद है
            if (!selectedtime || !selectedtime.showId) return; 

            const { data } = await axios.get(`/api/booking/seats/${selectedtime.showId}`)
            if (data.success) {
                setoccupiedseats(data.occupiedSeats); // Empty array for safety
                console.log("seats" , data);
                
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error);
        }
    }
    // console.log("selectedtime",selectedtime.showId);
    

    useEffect(() => {
        if (selectedtime) {
            getoccupiedseats();
        }
    }, [selectedtime]);


    const bookedTickets = async () => {
        try {
            if (!user) return toast.error('Please login to proceed')
            if (!selectedtime || !selectedSeats.length) return toast.error('Please select time and seats')

            const { data } = await axios.post('/api/booking/create', { showId: selectedtime.showId, selectedSeats },
                 { headers: { Authorization: `Bearer ${await getToken()}` } })

            if (data.success) {
                window.location.href=data.url;
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error);
        }
        
    }

    const handleSeatclick = (seatid) => {
        if (!selectedtime) {
            return toast(`Please Select time First`)
        }
        
        // FIX D: Max 5 seats check (>= 5 means no more seats can be added)
        if (!selectedSeats.includes(seatid) && selectedSeats.length >= 5) { 
            return toast(`You can Only Select 5 seats`)
        }
        
        if (occupiedseats.includes(seatid)) {
            return toast(`This seat is already booked`)
        }

        // FIX A: Correct filter syntax to unselect the seat
        setselectedSeats(prev => 
            prev.includes(seatid) 
                ? prev.filter(seat => seat !== seatid) 
                : [...prev, seatid]
        );
    }


    const renderseat = (row, count = 9) => (
        <div key={row} className='flex gap-2 mt-2'>
            <div className='flex flex-wrap items-center justify-center gap-2'>
                {Array.from({ length: count }, (_, i) => {
                    const seatid = `${row}${i + 1}`;
                    const isSelected = selectedSeats.includes(seatid);
                    const isOccupied = occupiedseats.includes(seatid);
                    
                    return (
                        // FIX B: Use closure to pass the correct seatid
                        <button key={seatid} onClick={() => handleSeatclick(seatid)}
                            disabled={isOccupied} // बुक की गई सीटों को डिसेबल करें
                            className={`h-8 w-8 rounded border border-primary/60 cursor-pointer 
                            ${isSelected ? "bg-primary text-white" : "hover:bg-primary/20"}
                            ${isOccupied ? "bg-gray-700 opacity-50 cursor-not-allowed border-gray-500" : ""}`} // Occupied style
                        >
                            {seatid}
                        </button>
                    );
                })}
            </div>
        </div>
    );
    
    return show ? (
        <div className='flex flex-col md:flex-row px-6 md:px-16 lg:px-40 py-30 md:pt-50'>
            {/* Avalable Timings */}
            <div className='w-60 bg-primary/10 border border-primary/20 rounded-lg py-10
            h-max md:sticky md:top-30'>
                <p className='text-lg font-semibold px-6'>Available Timings</p>

                <div className='mt-4'>
                    {timing.length > 0 ? (
                        timing.map((item) => (
                            <div
                                key={item.showId}
                                onClick={() => setselectedtime(item)}
                                className={`flex items-center gap-2 px-6 py-2 w-full
                                rounded-r-md cursor-pointer transition 
                                ${selectedtime?.showId === item.showId ? "bg-primary text-white" : "hover:bg-primary/20"}`}>
                                <ClockIcon className='w-4 h-4' />
                                <p className='text-sm'>{isoTimeformate(item.time)}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm px-6 text-gray-500">No timings available for {date}.</p>
                    )}
                </div>
            </div>

            {/* Seat layout */}
            <div className='relative flex-1 flex flex-col items-center max-md:mt-16'>
                <BlurCircle top='-100' left='-100' />
                <BlurCircle bottom='0' right='0' />
                <h1 className='text-2xl font-semibold mb-4'>Select your seat</h1>
                <img src={assets.screenImage} alt="screen" />
                <p className='text-gray-400 text-sm mb-6'>SCREEN SIDE</p>

                <div className='flex flex-col items-center mt-10 text-x5 text-gray-300'>
                    <div className='grid grid-col-2 md:grid-cols-1 gap-8 md:gap-2 md-6'>
                        {grouprows[0].map((row) => renderseat(row))}
                    </div>

                    <div className='grid grid-cols-2 gap-11 pt-8'>
                        {grouprows.slice(1).map((group, index) => (
                            <div key={index}>
                                {group.map((row) => renderseat(row))}
                            </div>
                        ))}
                    </div>
                </div>

                <button onClick={bookedTickets} className='flex items-center gap-1 mt-20 px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer active:scale-95'>
                    Proceed to Checkout
                    <ArrowRightIcon strokeWidth={3} className='w-4 h-4' />
                </button>
            </div>
        </div>
    ) : (
        <Loading />
    )
}

export default SeatLayout;



// {Cannot destructure property 'showId' of 'req.Body' as it is undefined}