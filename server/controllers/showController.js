import axios from "axios";
// import Movie from "../models/Movie.js";
import Show from "../models/Show.js";
import Movie from "../models/Movie.js";

export const getNowPlayingMovies = async (req, res) => {

  const tmdburl = "https://api.themoviedb.org/3/movie/now_playing";
  const proxyUrl = "https://cors-anywhere.herokuapp.com/";
  const targeturl = proxyUrl + tmdburl;
  try {
    const { data } = await axios.get(
     tmdburl,
      {
        headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
      }
    );

    const movies = data.results;
    res.json({ success: true, movies: movies });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};



export const addshow = async (req, res) => {
  try {
    const { movieId, showInput, showPrice } = req.body;
    if (!Array.isArray(showInput)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid Request Body: 'showInput' must be an array." 
            });
        }
    

    let movie = await Movie.findById(movieId);
    if (!movie) {
      //fetch movie detail and credits from TMDB API

      const [movieDetailsResponse, movieCreditsResponse] = await Promise.all([
        axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
          headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
        }),
        axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
          headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
        }),
      ]);
      const movieApiData = movieDetailsResponse.data;
      const movieCreditsData = movieCreditsResponse.data;

      //save movie to db
      const movieDetails = {
        _id: movieId,
        title: movieApiData.title,
        overview: movieApiData.overview,
        poster_path: movieApiData.poster_path,
        backdrop_path: movieApiData.backdrop_path,
        genres: movieApiData.genres,
        casts: movieCreditsData.cast,
        release_date: movieApiData.release_date,
        original_language: movieApiData.original_language,
        tagline: movieApiData.tagline || "",
        vote_average: movieApiData.vote_average,
        runtime: movieApiData.runtime,
      };
      movie = await Movie.create(movieDetails);
    }
    const showsToCreate = [];
    showInput.forEach((show) => {
      const showDate = show.date;

      show.time.forEach((time) => {
        const dateTimeString = `${showDate}T${time}`;
        showsToCreate.push({
          movie: movieId,
          showDateTime: new Date(dateTimeString),
          showPrice,
          occupiedSeats: {}
        });
      });
  });
    if (showsToCreate.length > 0) {
      await Show.insertMany(showsToCreate);
      // await Show.create(showsToCreate);
    }
    res.json({ success: true, message: "Show added successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};


// export const addShow = async (req, res) => {
//   try {
//     const { movieId, showInput, showPrice } = req.body;

//     // Validation
//     if (!movieId || !Array.isArray(showInput) || showInput.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid movieId or showInput"
//       });
//     }

//     if (!showPrice || showPrice <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid show price"
//       });
//     }

//     // Get movie details from TMDB API
//     const [movieDetails, movieCredits] = await Promise.all([
//       axios.get(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.TMDB_API_KEY}`),
//       axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${process.env.TMDB_API_KEY}`)
//     ]);

//     const movieData = movieDetails.data;
//     const creditsData = movieCredits.data;

//     const movie = {
//       id: movieData.id,
//       title: movieData.title,
//       poster_path: movieData.poster_path,
//       backdrop_path: movieData.backdrop_path,
//       release_date: movieData.release_date,
//       vote_average: movieData.vote_average,
//       overview: movieData.overview,
//       genres: movieData.genres,
//       casts: creditsData.cast.slice(0, 10)
//     };

//     const showsToCreate = [];

//     // Loop through input
//     for (const show of showInput) {
//       const showDate = show.date;

//       for (const time of show.time) {
//         const dateTime = new Date(`${showDate}T${time}:00`);

//         // Check duplicate show
//         const existingShow = await Show.findOne({
//           "movie.id": movieId,
//           showDateTime: dateTime
//         });

//         if (!existingShow) {
//           showsToCreate.push({
//             movie,
//             showDateTime: dateTime,
//             showPrice
//           });
//         }
//       }
//     }

//     if (showsToCreate.length === 0) {
//       return res.json({
//         success: false,
//         message: "Shows already exist"
//       });
//     }

//     await Show.insertMany(showsToCreate);

//     res.json({
//       success: true,
//       message: "Shows added successfully"
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: "Server Error"
//     });
//   }
// };




// API TO get show from the database






export const getShows = async (req, res) => {
  try {
    const shows = await Show.find({ showDateTime: {$gte: new Date() }} )
      .populate("movie")
      .sort({ showDateTime: 1 });

    // filter uniq shows

    const uniqueMoviesMap = new Map();
    shows.forEach((show) => {
      if (show.movie && !uniqueMoviesMap.has(show.movie._id.toString())) {
        uniqueMoviesMap.set(show.movie._id.toString(), show.movie);
      }
    });
    res.json({ success: true, shows: Array.from(uniqueMoviesMap.values()) });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "error : "+error.message });
  }
};

//API TO GET a single show from the database

export const getShow = async (req, res) => {
  try {
    const { movieId } = req.params;
    //get all upcoming shows for the movie
    const shows = await Show.find({
      movie: movieId,
      showDateTime: { $gte: new Date() },
    });
    const movie = await Movie.findById(movieId);
    const dateTime = {};
    shows.forEach((show) => {
      const date = show.showDateTime.toISOString().split("T")[0];

      if (!dateTime[date]) {
        dateTime[date] = [];
      }
      dateTime[date].push({ time: show.showDateTime, showId: show._id });
    });

    res.json({ success: true, movie, dateTime });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};












// import { HttpsProxyAgent } from 'https-proxy-agent';
// // import axios from 'axios';
// // import Show from "../models/Show.js";
// // import Movie from "../models/Movie.js";

// export const getNowPlayingMovies = async (req, res) => {
//   try {
//     // 1. DIRECT TMDB URL (CORS-Anywhere bilkul nahi use karna)
//     const url = "https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=1";

//     // 2. Naya Proxy Agent (Ek naya free proxy IP)
//     // Agar ye IP kaam na kare, toh 'free-proxy-list.net' se naya IP uthayein
//     const proxyUrl = 'http://167.172.188.47:80'; 
//     const agent = new HttpsProxyAgent(proxyUrl);

//     const { data } = await axios.get(url, {
//       httpsAgent: agent, // Node.js isi agent ka use karke block bypass karega
//       headers: { 
//         Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
//         Accept: 'application/json'
//       },
//       timeout: 15000 
//     });

//     res.json({ success: true, movies: data.results });
//   } catch (error) {
//     // Agar yahan 403 aata hai, toh uska matlab Proxy IP expire ho gaya hai
//     console.error("Connection Error:", error.message);
//     res.json({ success: false, message: "Proxy error: " + error.message });
//   }
// };