import React, { useState } from 'react';
import BlurCircle from './BlurCircle';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function DateSelect({dateTime, id}) {
    const navigate = useNavigate();

    const [selected,setselected] = useState(null);
    const onBookhandler = ()=>{
        if(!selected){
            return toast('please select a date')
        }
        navigate(`/movies/${id}/${selected}`)
        scrollTo(0,0)
    }
console.log("datetime ",dateTime);


    return (
        <div id='dateselect' className='pt-30'>
            <div className='flex flex-col md:flex-row items-center justify-between
                gap-10 relative p-8 bg-primary/10 border border-primary/20 rounded-lg'>
                <BlurCircle top='-100' left='-100' />
                <BlurCircle top='100' right='0px' />
                <div>
                    <p className='text-lg font-semibold'>Choose Date</p>
                    <div className='flex items-center gap-6 text-sm mt-5'>
                        <ChevronLeftIcon width={28} />
                        <div className='grid grid-cols-3 md:flex flex-wrap md:max-w-lg gap-4'>
                            {Object.keys(dateTime).map((date) => (
                                <button
                                    onClick={()=>{setselected(date)}}
                                    key={date}
                                    className={`flex flex-col items-center justify-center h-14 w-14 aspect-square rounded cursor-pointer ${selected === date ? "bg-primary text-white" : "border border-primary/70"}`}>
                                    <span>{new Date().getDate()}</span>
                                    <span>{new Date().toLocaleDateString("en-US", { month: "short" })}</span>
                                </button>
                            ))}


                        </div>
                        <ChevronRightIcon width={28} />
                    </div>
                </div>
                <button onClick={onBookhandler} className='bg-primary text-white px-8 py-2 mt-6 rounded hover:bg-primary/90 transition-all cursor-pointer'>
                    Book now
                </button>
            </div>
        </div>
    );
}

export default DateSelect;
