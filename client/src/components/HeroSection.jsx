import React from 'react'
import { assets } from '../assets/assets'
import { ArrowRight, CalendarIcon, ClockIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function HeroSection() {
    const navigate = useNavigate();
    return (
        <div className='flex items-center justify-between px-6 md:px-16 lg:px-36 
        bg-[url("/backgroundImage.png")] bg-cover bg-center h-screen'>

            {/* Left Column: Text Content */}
            <div className='flex flex-col gap-4 max-w-xl text-white'>
                <img src={assets.marvelLogo} alt="" className='max-h-11 lg:h-11 mt-20' />

                <h1 className='text-5xl md:text-[70px] md:leading-[1.2] font-semibold'>
                    Guardians <br /> of the Galaxy
                </h1>

                <div className='flex items-center gap-4 text-gray-300'>
                    <span>Action | Adventure | Sci-Fi</span>
                    <div className='flex items-center gap-1'>
                        <CalendarIcon className='w-4 h-4' /> 2018
                    </div>
                    <div className='flex items-center gap-1'>
                        <ClockIcon className='w-4 h-4' /> 2h 8m
                    </div>
                </div>

                <p className='text-gray-300'>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Eveniet iure alias provident vero sunt delectus fuga sint...
                </p>

                <button onClick={() => navigate('/movies')} className='flex items-center
                gap-1 px-6 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-full
                font-medium cursor-pointer w-fit'>
                    Explore Movies
                    <ArrowRight className='w-5 h-5' />
                </button>
            </div>

            {/* Right Column: (Optional) Poster or Graphic */}
            {/* <div className='hidden lg:block'>
                <img src='/some-movie-poster.png' alt='Poster' className='w-[300px]' />
            </div> */}
        </div>
    )
}

export default HeroSection
