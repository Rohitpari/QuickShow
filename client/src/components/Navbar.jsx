import { useState } from 'react';
import { assets } from '../assets/assets';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Search, TicketPlus, X } from 'lucide-react';
import { useClerk, UserButton, useUser } from '@clerk/clerk-react';
import { useAppContext } from '../context/AppContext';

function Navbar() {
  const [isOpen, setOpen] = useState(false);
  const { user } = useUser();
  const { openSignIn } = useClerk();
  const navigate = useNavigate();
  const {favoriteMovies} = useAppContext();

  return (
    <div className="fixed top-0 left-0 z-10 w-full flex items-center justify-between px-6 md:px-16 lg:px-36 py-5 bg-white/10 backdrop-blur">
      <Link to="/" className="max-md:flex-1">
        <img src={assets.logo} alt="logo" className="w-36 h-auto" />
      </Link>

      <div
        className={`max-md:absolute max-md:top-0 max-md:left-0 max-md:font-medium
        max-md:text-lg z-50 flex flex-col md:flex-row items-center max-md:justify-center
        gap-8 max-md:px-8 py-3 max-md:h-screen md:rounded-full backdrop-blur
        bg-black/70 md:bg-white/10 md:border border-gray-300/20 overflow-hidden pr-5 pl-5
        transition-[width] duration-300 ${isOpen ? 'max-md:w-full' : 'max-md:w-0'}`}
      >
        <X
          className="md:hidden absolute top-6 right-6 w-6 h-6 cursor-pointer"
          onClick={() => setOpen(false)}
        />
        <Link onClick={() => { scrollTo(0, 0); setOpen(false); }} to="/">Home</Link>
        <Link onClick={() => { scrollTo(0, 0); setOpen(false); }} to="/movies">Movies</Link>
        <Link onClick={() => { scrollTo(0, 0); setOpen(false); }} to="/">Release</Link>
        <Link onClick={() => { scrollTo(0, 0); setOpen(false); }} to="/">Theaters</Link>
        {favoriteMovies.length > 0 && <Link onClick={() => { scrollTo(0, 0); setOpen(false); }} to="/favorite">Favorite</Link>}
      </div>

      <div className="flex items-center gap-8">
        <Search className="max-md:hidden w-6 h-6 cursor-pointer" />
        {
          !user ? (
            <button
              onClick={openSignIn}
              className="px-4 py-1 sm:px-7 sm:py-2 bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer"
            >
              Login
            </button>
          ) : (
            <UserButton>
              <UserButton.MenuItems>
                <UserButton.Action label="my Booking" labelIcon={<TicketPlus width={15}/>} onClick={()=>navigate('/my-booking')}/>
                <UserButton.Action label="admin" labelIcon={<TicketPlus width={15}/>} onClick={()=>navigate('/admin')}/>

              </UserButton.MenuItems>
            </UserButton>
          )
        }
      </div>

      <Menu
        className="max-md:ml-4 md:hidden w-8 h-8 cursor-pointer"
        onClick={() => setOpen(!isOpen)}
      />
    </div>
  );
}

export default Navbar;
