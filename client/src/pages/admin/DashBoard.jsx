import React, { useEffect, useState } from 'react'
import Loading from '../../components/Loading.jsx'
import { ChartLineIcon, CircleDollarSignIcon, PlayCircleIcon, StarIcon, UserIcon}from 'lucide-react'
import {dummyDashboardData} from '../../assets/assets.js'
import Title from '../../components/admin/Title.jsx'

import BlurCircle from '../../components/BlurCircle.jsx'
import { dateFormate } from '../../lib/dateFormate.js'
import { useAppContext } from '../../context/AppContext.jsx'
import toast from 'react-hot-toast'
import { useUser } from '@clerk/clerk-react'



function DashBoard() {


  const {axios,getToken,user,image_base_url} = useAppContext();
  

  const currency = import.meta.env.VITE_CURRENCY
  const [dashboardData,setdashboardData] = useState({
    totalBooking : 0, 
    totalRevenue  : 0,
    activeShows:[],
    totalUser : 0
  });
  const [loading,setloading] = useState(true);

  const DashBoardCards = [
    {title : "total Bookings",value : dashboardData.totalBooking || "0", icon : ChartLineIcon},
    {title : "total Revenue",value : currency + dashboardData.totalRevenue || "0", icon : CircleDollarSignIcon},
    {title : "total shows",value : dashboardData.activeShows.length || "0", icon : PlayCircleIcon},
    {title : "total Users",value : dashboardData.totalUser || "0", icon : UserIcon}
  ]

  const fetchDashboardData = async () => {
    try {
      const {data} =await axios.get('/api/admin/dashboard',{headers : {
        Authorization : `Bearer ${await getToken()}`
      }})
      // console.log("data" , data);
      
      if(data.success){
        setdashboardData(data.dashboardData)
        setloading(false);
      }else{
        console.log("error" ,data.error );
        
        toast.error(data.error)
      }
    } catch (error) {
      console.log(error);
      
      toast.error("Error fetching dashboard data : ",error)
    }
  };
  useEffect (()=>{
if(user){
    fetchDashboardData();

}  },[user]);

  return !loading ? (
    <>
    <Title text1 = "admin" text2="Dashboard" />

    <div className='relative flex flex-wrap gap-4 mt-6'>
      <BlurCircle top="-100px" left="0px"/>
      <div className='flex flex-wrap gap-4 w-full'>
        {DashBoardCards.map((card, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-4 py-3 bg-primary/10 border border-primary/20 rounded-md max-w-50 w-full"
            >
              <div>
                <h1 className="text-sm">{card.title}</h1>
                <h1 className="text-sm">{card.activeShow}</h1>

                
                <p className="text-xl font-medium mt-1">{card.value}</p>
              </div>
              <card.icon className="w-6 h-6" />
            </div>
          ))}
      </div>
    </div>

    <p className='mt-10 text-lg font-medium'>Active shows</p>
    <div className='relative flex flex-wrap gap-6 mt-4 max-w-5xl'>
      <BlurCircle top="100px" left="-10%"/>
      {dashboardData.activeShows.map((show)=>(
        
        <div key={show._id} className='w-55 rounded-lg overflow overflow-hidden h-full
        pb-3 bg-primary/10 border border-primary/20 hover:-translate-y-1 transition duration-300'>
          <img src={image_base_url+ show.movie.poster_path} alt=""  className='h-60 w-full object-cover'/>
          <p className='font-medium p-2 truncate'>{show.movie.title}</p>
          <div className='flex items-center justify-between px-2'>
            <p className='text-lg font-medium'>{currency} {show.showPrice}</p>
            <p className='flex items-center gap-1 text-sm text-gray-400 mt-1 pr-1'>

              <StarIcon className='w-4 h-4 text-primary fill-primary'/>
              {show.movie.vote_average.toFixed(1)}
            </p>
          </div>
          <p className='px-2 pt-2 text-sm text-gray-500'>{dateFormate(show.showDateTime)}</p>
        </div>
      ))}
    </div>
    </>
  ) : <Loading/>
}

export default DashBoard










// DashBoard.jsx (Corrected)

// ... imports remain the same

// function DashBoard() {
//     // ... const {axios, getToken, user, image_base_url} = useAppContext();

//     const currency = import.meta.env.VITE_CURRENCY
//     const [dashBoardData, setdashBoardData] = useState({
//         totalBooking: 0,
//         totalRevenue: 0,
//         activeShows: [],
//         totalUser: 0
//     });
//     const [loading, setloading] = useState(true);

//     const DashBoardCards = [
//         // Property name totalBooking (singular) का उपयोग करें जैसा कि state में है
//         { title: "total Booking", value: dashBoardData.totalBooking || "0", icon: ChartLineIcon },
//         { title: "total Revenue", value: currency + dashBoardData.totalRevenue || "0", icon: CircleDollarSignIcon },
//         { title: "total shows", value: dashBoardData.activeShows.length || "0", icon: PlayCircleIcon },
//         { title: "total Users", value: dashBoardData.totalUser || "0", icon: UserIcon }
//     ]

//     const fetchDashboardData = async () => {
//         try {
//             const { data } = await axios.get('/api/admin/dashboard', {
//                 headers: {
//                     Authorization: `Bearer ${await getToken()}`
//                 }
//             })
//             console.log("data", data.dashBoardData.totalUser);

//             if (data.success) {
//                 // FIX 1: पूरा dashBoardData object सेट करें
//                 setdashBoardData(data.dashBoardData) 
//                 setloading(false);
//             } else {
//                 toast.error(data.message || data.error);
//             }
//         } catch (error) {
//             console.error("Error fetching dashboard data:", error);
//             toast.error("Error fetching dashboard data. Check console for details.");
//             setloading(false); // Loading state को भी reset करें
//         }
//     };
//     const user = useUser()

//     // console.log( " user",user);
    
    
//     // FIX 3: getToken को dependency array में जोड़ें
//     useEffect(() => {
//       if(user.isLoaded){
//         fetchDashboardData();
//       }       
//     }, [user ]); 

//     return !loading ? (
//         <>
//             <Title text1="admin" text2="Dashboard" />

//             <div className='relative flex flex-wrap gap-4 mt-6'>
//                 <BlurCircle top="-100px" left="0px" />
//                 <div className='flex flex-wrap gap-4 w-full'>
//                     {DashBoardCards.map((card, index) => (
//                         <div
//                             key={index}
//                             className="flex items-center justify-between px-4 py-3 bg-primary/10 border border-primary/20 rounded-md max-w-50 w-full"
//                         >
//                             <div>
//                                 <h1 className="text-sm">{card.title}</h1>
//                                 {/* FIX 2: यह लाइन हटा दी गई है */}
//                                 {/* <h1 className="text-sm">{card.activeShow}</h1> */}
                                
//                                 <p className="text-xl font-medium mt-1">{card.value}</p>
//                             </div>
//                             <card.icon className="w-6 h-6" />
//                         </div>
//                     ))}
//                 </div>
//             </div>

//             <p className='mt-10 text-lg font-medium'>Active shows</p>
//             <div className='relative flex flex-wrap gap-6 mt-4 max-w-5xl'>
//                 <BlurCircle top="100px" left="-10%" />
//                 {dashBoardData.activeShows.map((show) => (
//                     <div key={show._id} className='w-55 rounded-lg overflow overflow-hidden h-full
//                 pb-3 bg-primary/10 border border-primary/20 hover:-translate-y-1 transition duration-300'>
//                         {/* सुनिश्चित करें कि show.movie object मौजूद है */}
//                         <img src={show.movie?.poster_path} alt="" className='h-60 w-full object-cover' /> 
//                         <p className='font-medium p-2 truncate'>{show.movie?.title}</p>
//                         {/* ... rest of the rendering */}
//                         <p className='px-2 pt-2 text-sm text-gray-500'>{dateFormate(show.showDateTime)}</p>
//                     </div>
//                 ))}
//             </div>
//         </>
//     ) : <Loading />
// }

// export default DashBoard;