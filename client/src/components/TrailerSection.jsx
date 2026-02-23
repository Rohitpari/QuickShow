// import { useState } from 'react'
// import { dummyTrailers } from '../assets/assets'
// import ReactPlayer from 'react-player'
// import BlurCircle from './BlurCircle'
// import { PlayCircleIcon } from 'lucide-react';

// function TrailerSection() {


//     const [currentTrailer, setcurrentTrailer] = useState(dummyTrailers[0])
//     // console.log(currentTrailer.videoUrl);
//     // console.log(videoUrl);

//     return (
//         <div className='px-6 md:px-16 lg:px-24 xl:px-44 py-20 overflow-hidden'>

//             <p className='text-gray-300 font-medium text-lg max-w-[960px]
//         mx-auto'>Trailers</p>

//             <div className='relative mt-6'>

//                 <BlurCircle top='-100px' right='-100px' />
//                 <ReactPlayer url={currentTrailer.videoUrl} controls={true}
//                     className='mx-auto max-w-full' width="960px" height="540px" light = {false} playing={false} />
//             </div>

//             <div className='group grid grid-cols-4 gap-4 md:gap-8 mt-8 max-w-3xl mx-auto'>
//                 {dummyTrailers.map((trailer,index) => (
//                     <div key={index} src={trailer.image} className='relative group-hover:not-hover:opacity-50
//                      hover:-translate-y-1 duration-300 transition max-md:h-60 md:max-h-60 cursor-pointer'
//                         onClick={() => setcurrentTrailer(trailer)}>
//                         <img src={trailer.image} alt="trailer" className='rounded-lg w-full h-full object-cover brightness-75' />

//                         <PlayCircleIcon strokeWidth={1.6} className='absolute top-1/2 left-1/2 w-5 md:w-8 h-5
//                     md:h-12 transform -translate-x-1/2 -translate-y-1/2'/>
//                     </div>
//                 ))}
//             </div>

//         </div>
//     )
// }

// export default TrailerSection;





import { useState } from 'react';
import { PlayCircle } from 'lucide-react';

// Dummy data - Replace with your actual data
const dummyTrailers = [
 {
        id: 1, 
        image: "https://img.youtube.com/vi/WpW36ldAqnM/maxresdefault.jpg",
        videoUrl: 'https://www.youtube.com//embed/WpW36ldAqnM'
    },
    {
        id: 2,
        image: "https://img.youtube.com/vi/-sAOWhvheK8/maxresdefault.jpg",
        videoUrl: 'https://www.youtube.com/embed/-sAOWhvheK8'
    },
    {
        id: 3,
         image: "https://img.youtube.com/vi/1pHDWnXmK7Y/maxresdefault.jpg",
        videoUrl: 'https://www.youtube.com/embed/1pHDWnXmK7Y'
    },
    {
        id: 4,
        image: "https://img.youtube.com/vi/umiKiW4En9g/maxresdefault.jpg",
        videoUrl: 'https://www.youtube.com/embed/umiKiW4En9g'
    },
];

// BlurCircle Component
const BlurCircle = ({ top, right, left, bottom }) => (
  <div 
    className="absolute w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"
    style={{ top, right, left, bottom }}
  />
);

function TrailerSection() {
  const [currentTrailer, setCurrentTrailer] = useState(dummyTrailers[0]);

  return (
    <div className='px-6 md:px-16 lg:px-24 xl:px-44 py-20 overflow-hidden bg-black'>
      
      {/* Title */}
      <p className='text-gray-300 font-medium text-lg max-w-[960px] mx-auto mb-6'>
        Trailers
      </p>

      {/* Video Player Section */}
      <div className='relative mt-6 max-w-[960px] mx-auto'>
        <BlurCircle top='-100px' right='-100px' />
        
        <div className='relative w-full bg-gray-900 rounded-lg overflow-hidden shadow-2xl' 
             style={{ paddingBottom: '56.25%' }}>
          <iframe
            src={currentTrailer.videoUrl}
            className='absolute top-0 left-0 w-full h-full'
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={currentTrailer.title}
          />
        </div>
      </div>

      {/* Thumbnail Grid */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-10 max-w-3xl mx-auto'>
        {dummyTrailers.map((trailer) => (
          <div
            key={trailer.id}
            className='relative cursor-pointer group overflow-hidden rounded-lg transition-all duration-300 hover:scale-105 hover:-translate-y-2'
            onClick={() => setCurrentTrailer(trailer)}
          >
            {/* Thumbnail Image */}
            <div className='relative h-40 md:h-60 overflow-hidden'>
              <img
                src={trailer.image}
                alt={trailer.title}
                className='w-full h-full object-cover brightness-75 group-hover:brightness-100 
                         group-hover:scale-110 transition-all duration-500'
              />
              
              {/* Play Icon Overlay */}
              <div className='absolute inset-0 flex items-center justify-center'>
                <div className='bg-black/50 rounded-full p-3 group-hover:bg-black/70 
                              transition-all duration-300 group-hover:scale-110'>
                  <PlayCircle 
                    strokeWidth={1.5} 
                    className='w-8 h-8 md:w-10 md:h-10 text-white'
                    fill="currentColor"
                  />
                </div>
              </div>

              {/* Active Indicator */}
              {currentTrailer.id === trailer.id && (
                <div className='absolute bottom-0 left-0 right-0 h-1 bg-red-600'></div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TrailerSection;
