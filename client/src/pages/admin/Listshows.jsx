import React, { useEffect, useState } from 'react'
import Loading from '../../components/Loading';
import Title from '../../components/admin/Title';
import { dateFormate } from '../../lib/dateFormate';
import { useAppContext } from '../../context/AppContext';

function Listshows() {

  // FIX: Typo in environment variable name corrected
  const currency = import.meta.env.VITE_CURRENCY; 

  // getToken is destructured for use in dependency array
  const { axios, getToken, user } = useAppContext(); 

  const [shows, setshows] = useState([]);
  const [loading, setloading] = useState(true);

  const getallshow = async () => {
    try {
      const { data } = await axios.get('/api/admin/all-shows', {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
      // console.log("data : ", data);

      // Check if data.shows is an array before setting state
      if (data.success && Array.isArray(data.shows)) {
        setshows(data.shows);
      } else {
        console.error("API did not return a valid 'shows' array.");
        setshows([]); // Set to empty array to prevent map errors
      }
      setloading(false);
    } catch (error) {
      console.error("Error fetching shows:", error);
      // Ensure loading is set to false even on error
      setloading(false); 
    }
  }

  useEffect(() => {
    // FIX: Check for 'user' and include 'getToken' in the dependency array
    // This prevents calling the API before the token is available (Authentication required error)
    if (user && getToken) { 
      getallshow();
    }
    // Dependency array is correct now
  }, [user, getToken]); 


  // FIX: Corrected inverted loading logic: Show <Loading/> when loading is TRUE
  return loading ? (
    <Loading /> 
  ) : (
    <>
      <Title text1="List" text2="shows" />
      <div className='max-w-4xl mt-6 overflow-x-auto'>
        <table className='w-full border-collapse rounded-md overflow-hidden text-nowrap'>
          <thead>
            <tr className='bg-primary/20 text-left text-white'>
              <th className='p-2 font-medium pl-5'>movie Name</th>
              <th className='p-2 font-medium pl-5'>Show Time</th>
              <th className='p-2 font-medium pl-5'>Total Booking</th>
              <th className='p-2 font-medium pl-5'>Earnings</th>
            </tr>
          </thead>
          <tbody className='text-sm font-light'>
            {/* The 'for Each' error was prevented by checking Array.isArray above */}
            {shows.map((show, index) => (
              // Use show._id as key if available, fallback to index
              <tr key={show._id || index} className='border-b border-primary/10 bg-primary/5 even:bg-primary/10'>
                {/* Use optional chaining (?) for nested properties */}
                <td className='p-2 min-w-45 pl-5'>{show.movie?.title}</td> 
                <td className='p-2 '>{dateFormate(show.showDateTime)}</td>
                <td className='p-2 '> {Object.keys(show.occupiedSeats || {}).length}</td>
                <td className='p-2 '>{currency}{Object.keys(show.occupiedSeats || {}).length * show.showPrice}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {shows.length === 0 && !loading && <p className='mt-4 text-gray-500 text-center'>No active shows found.</p>}
      </div>
    </>
  )
}

export default Listshows;