import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

function Loading() {
  const {nextUrl} = useParams()
  const navigate = useNavigate()
useEffect(()=>{
  if(nextUrl){
    setTimeout(()=>{
      navigate(`/${nextUrl}`)
    },1000)
  }
},[])
  return (
    <div className='flex justify-center items-center h-[80vh]'>
        <div className='animate-spin rounded-full h-14 w-14 border-2 border-t-primary'>
        </div>
        </div>
  )
}

export default Loading






// import React, { useEffect } from 'react'
// import { useNavigate, useSearchParams } from 'react-router-dom'
// import { useAppContext } from '../context/AppContext'

// function Loading() {
//   const [searchParams] = useSearchParams()
//   const navigate = useNavigate()
//   const { axios, getToken } = useAppContext()

//   const sessionId = searchParams.get('session_id')

//   useEffect(() => {
//     const verifyPayment = async () => {
//       try {
//         if (sessionId) {
//           const token = await getToken();
//           // Backend API call jo payment status update karegi
//           const { data } = await axios.post(
//             '/api/booking/verify-payment', 
//             { sessionId },
//             { headers: { Authorization: `Bearer ${token}` } }
//           );

//           if (data.success) {
//             console.log("Payment Verified Successfully");
//             navigate('/my-booking'); // Success ke baad bookings page par bhejein
//           } else {
//             console.error("Payment Verification Failed:", data.message);
//             navigate('/my-booking'); // Fail ho tab bhi le jayein, wahan 'Pay Now' dikhega
//           }
//         } else {
//           // Agar session_id nahi hai, toh seedha home ya bookings par bhej dein
//           navigate('/');
//         }
//       } catch (error) {
//         console.error("Error verifying payment:", error);
//         navigate('/my-booking');
//       }
//     };

//     verifyPayment();
//   }, [sessionId, navigate, axios, getToken]);

//   return (
//     <div className='flex flex-col justify-center items-center h-[80vh] gap-4'>
//       <div className='animate-spin rounded-full h-14 w-14 border-2 border-t-primary border-gray-200'></div>
//       <p className="text-gray-400 animate-pulse">Verifying your payment, please wait...</p>
//     </div>
//   )
// }

// export default Loading