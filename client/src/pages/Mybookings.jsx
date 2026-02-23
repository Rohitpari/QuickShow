



import React, { useEffect, useState, useCallback } from "react"; // useCallback import kiya
import { useAppContext } from "../context/AppContext";
import { Link, useLocation, useSearchParams } from "react-router-dom"; // useSearchParams import kiya
import Loading from "../components/Loading";
import BlurCircle from "../components/BlurCircle";
import timeformate from "../lib/TimeFormate";
import { dateFormate } from "../lib/dateFormate";

function MyBookings() {
  const { axios, getToken, user, image_base_url } = useAppContext();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams(); // setSearchParams bhi use kiya
  const currency = import.meta.env.VITE_CURRENCY;

  // ✅ 1. fetchBookings ko useCallback mein wrap kiya (Stability ke liye)
  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const { data } = await axios.get("/api/user/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setBookings(data.bookings);
        // console.log("Bookings Data Fetched:", data.bookings);
      }
    } catch (error) {
      console.error("Fetch bookings error:", error);
    } finally {
      setLoading(false);
    }
  }, [axios, getToken]); // Dependecies: axios aur getToken

  // ✅ 2. Verification aur Refresh Logic
  useEffect(() => {
    const verifyAndRefresh = async () => {
      const sessionId = searchParams.get("session_id");

      // Agar session_id URL mein hai, toh payment verify karo
      if (sessionId && user) {
        try {
          const token = await getToken();
          const { data } = await axios.post(
            "/api/booking/verify-payment", // Sahi API route use karein
            { sessionId },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (data.success) {
            console.log("✅ Payment verified successfully (Fallback)");
            
            // URL se session_id hatao taaki har baar verify na ho
            setSearchParams({}); 
            
          } else {
            console.log("⚠️ Payment verification failed:", data.message);
          }
          
        } catch (error) {
          console.error("Payment verification error:", error);
        }
      }

      // Bookings fetch karo (verification ke baad ya direct page load par)
      if (user) {
        fetchBookings();
      }
    };

    verifyAndRefresh();
  }, [user, fetchBookings, searchParams, setSearchParams, axios, getToken]); // Sahi dependencies

  if (isLoading) return <Loading />;

  return (
    <div className="relative px-6 md:px-16 lg:px-40 pt-30 md:pt-40 min-h-[80vh]">
      <BlurCircle top="100px" left="100px" />
      <BlurCircle bottom="0px" left="600px" />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-semibold">My Bookings</h1>
        {/* Manual refresh button for safety */}
        <button
          onClick={fetchBookings}
          className="text-sm text-primary hover:underline"
          disabled={isLoading}
        >
          🔄 {isLoading ? "Loading..." : "Refresh Status"}
        </button>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <p>No bookings found</p>
        </div>
      ) : (
        bookings.map((item, i) => (
          <div
            key={item._id || i}
            className="flex flex-col md:flex-row justify-between bg-primary/8 border border-primary/20 rounded-lg mt-4 p-2 max-w-3xl"
          >
            <div className="flex flex-col md:flex-row">
              <img
                src={image_base_url + item.show.movie.poster_path}
                alt={item.show.movie.title}
                className="md:max-w-45 aspect-video h-auto object-cover rounded"
              />
              <div className="flex flex-col p-4">
                <p className="text-lg font-semibold">{item.show.movie.title}</p>
                <p className="text-gray-400 text-sm">
                  {timeformate(item.show.movie.runtime)}
                </p>
                <p className="text-gray-400 text-sm mt-auto">
                  {dateFormate(item.show.showDateTime)}
                </p>
              </div>
            </div>

            <div className="flex flex-col md:items-end md:text-right justify-between p-4">
              <div className="flex items-center gap-4">
                <p className="text-2xl font-semibold mb-3">
                  {currency}
                  {item.amount}
                </p>

                {/* ✅ Pay Now button - only show when NOT paid */}
                {!item.isPaid && item.paymentLink ? (
                  <Link
                    to={item.paymentLink}
                    className="bg-primary px-4 py-1.5 mb-3 text-sm rounded-full font-medium cursor-pointer hover:bg-primary/80 transition"
                  >
                    Pay Now
                  </Link>
                ) : (
                  <span className="text-green-500 text-sm mb-3 font-medium">
                    ✓ Paid
                  </span>
                )}
              </div>
              <div className="text-sm">
                <p>
                  <span className="text-gray-400">Total Tickets: </span>
                  {item.bookedSeats.length}
                </p>
                <p>
                  <span className="text-gray-400">Seat Numbers: </span>
                  {item.bookedSeats.join(", ")}
                </p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default MyBookings;


