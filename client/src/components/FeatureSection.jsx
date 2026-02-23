import { ArrowRight } from 'lucide-react'
import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BlurCircle from './BlurCircle';
import MovieCard from './MovieCard';
// import { dummyShowsData } from '../assets/assets';
import { useAppContext } from '../context/AppContext';
import { dummyShowsData } from '../assets/assets';


function FeatureSection({movie}) {
    const navigate = useNavigate();

    const { shows,image_url} = useAppContext();
    // console.log( " shows data" ,shows);
    // const [shows,setshows] = useState([]);
    
// console.log(shows);






  return (
    <div className='px-6 md:px-16 lg:px-24 xl:px-44 overflow-hidden'>
        <div className='relative flex items-center justify-between pt-20 pb-10'>
            <BlurCircle top='0' right='-80px' />
            <p className='text-gray-300 font-medium text-lg'>Mow Showing</p>
            <button onClick={()=>navigate('/movies')}>View All  <ArrowRight className='group-hover:translate-x-0.5 transition w-4.5 h-4.5'/></button>
        </div>
        
        <div className='flex flex-wrap max-sm:justify-center gap-8 mt-8'>
            {shows.slice(0,4).map((show)=>(
                <MovieCard key={show._id} movie={show}/>
            ))}
        </div>
      

        <div className='flex justify-center mt-20'>
            <button onClick={()=>{navigate('/movies'), scrollTo(0,0)}}
            className='px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medim
            cursor-pointer'>Show more</button>
        </div>
    </div>
  )
}

export default FeatureSection