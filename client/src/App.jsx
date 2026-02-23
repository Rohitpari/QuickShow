import React from 'react'
import Navbar from './components/Navbar'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import MoviesDetails from './pages/MoviesDetails'
import Movies from './pages/Movies'
import Mybookings from './pages/Mybookings'
import SeatLayout from './pages/SeatLayout'
import Favorite from './pages/Favorite'
import { Toaster } from 'react-hot-toast'
import Footer from './components/Footer'
import DashBoard from './pages/admin/DashBoard'
import Addshows from './pages/admin/Addshows'
import Listshows from './pages/admin/Listshows'
import ListBooking from './pages/admin/ListBooking'
import Layout from './pages/admin/Layout'
import { useAppContext } from './context/AppContext.jsx'
import { SignIn } from '@clerk/clerk-react'
import Loading from './components/Loading.jsx'
// import Loading from './components/Loading.jsx'
// import ABC from './ABC.jsx'


function App() {
  const isadminRoute = useLocation().pathname.startsWith('/admin')
  const {user} = useAppContext();
  return (
    <>
      <Toaster />
      {!isadminRoute && <Navbar />} 
       <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/movies' element={<Movies />} />
        <Route path='/movies/:id/' element={<MoviesDetails />} />
        <Route path='/movies/:id/:date' element={<SeatLayout />} />
        <Route path='/my-booking' element={<Mybookings />} />
        <Route path='/loading/:nextUrl' element={<Loading />} />
        <Route path='/favorite' element={<Favorite />} />
        
        <Route path ='/admin/*' element={user ? <Layout/> : (
          <div className='min-h-screen flex justify-center items-center'>
            <SignIn fallbackRedirectUrl={'/admin'}/>
          </div>
        )} >
        <Route  index element= {<DashBoard/>} />
        <Route path = 'DashBoard' element={<DashBoard/>} />
        <Route path='add-shows' element={<Addshows/>} />
        <Route path='list-shows' element={<Listshows/>} />
        <Route path='list-booking' element={<ListBooking/>} />
        </Route> 
       </Routes>
         {/* <ABC/> */}

      {!isadminRoute && <Footer />}


       
      

    </>
  )
}

export default App