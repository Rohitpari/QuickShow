import { createContext, useContext, useEffect, useState } from "react";
import axios from 'axios'
import { useAuth, useUser } from "@clerk/clerk-react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

export const AppContext = createContext()

export const AppProvider = ({children})=>{

    const [isAdmin,setIsAdmin] = useState(false)
    const [shows,setshows] = useState([])
    const [favoriteMovies,setfavoriteMovies] = useState([])
    const image_base_url = import.meta.env.VITE_TMDB_BASE_URL

    const navigate = useNavigate();
    const {user} = useUser()
    const {getToken} = useAuth();
    const location = useLocation()

    // console.log("user",user);
    
    

    const fetchIsAdmin = async()=>{
        try {
            const {data} = await axios.get('/api/admin/is-admin',
                {headers : {Authorization :`Bearer ${await getToken()}`}})

                setIsAdmin(data.isAdmin)
                
                if(!data.isAdmin && location.pathname.startsWith('/admin')){
                    navigate('/')
                    toast.error('You are not authorized to access admin dashboard')
                }
                // console.log("admin : " + isAdmin);

        } catch (error) { 
            console.log( "mesage : "+error.message);
            
        }
    }





    const fetchShows = async()=>{
        try {
            const {data} = await axios.get('/api/show/all',
                {headers : {Authorization :`Bearer ${await getToken()}`}}
            )
            if(data.success){
                setshows(data.shows)

            }else{
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error.message);
            
        }
    }

    const fetchFavoriteMovies = async()=>{
        try {
            const {data} = await axios.get('/api/user/favorites',{headers : 
                {Authorization : `Bearer ${await getToken()}`}})
                if(data.success){
                    setfavoriteMovies(data.movies)

                }else{
                    // toast.error(data.message)
                }
        } catch (error) {
            console.log(error);
            
        }
    }

    useEffect(()=>{
        fetchShows()
    },[])
    useEffect(()=>{
        if(user){
            fetchIsAdmin()
            fetchFavoriteMovies()
        }
        
    },[user])


    const value = {
        axios,
        fetchIsAdmin,
        user, getToken, navigate, isAdmin, shows,
        favoriteMovies,fetchFavoriteMovies,image_base_url,fetchShows        
    
    }
return (
    <AppContext.Provider value = {value}>
        {children}
    </AppContext.Provider>
)

}
export const useAppContext = ()=>useContext(AppContext)