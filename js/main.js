import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBpSXsr8ZC_BmCnaySCp42NexSrTFTzHtg",
  authDomain: "my-movie-circle.firebaseapp.com",
  projectId: "my-movie-circle",
  storageBucket: "my-movie-circle.firebasestorage.app",
  messagingSenderId: "509365004119",
  appId: "1:509365004119:web:cac637bcf57aaaef1c4012"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const snapshotMovies = await getDocs(collection(db, 'movies'));
const watchedMovies = snapshotMovies.docs.map(doc => doc.data());
const watchedMoviesIds = watchedMovies.map(movie => movie.id);

const moviesListEl = document.querySelector('#movies-list');
const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-input');

const BASE_URL = 'https://api.themoviedb.org/3/search/movie?language=pt-BR';
const SINGLE_MOVIE_URL = 'https://api.themoviedb.org/3/movie/';
const POPULAR_URL = 'https://api.themoviedb.org/3/movie/popular?language=pt-BR&page=1'
const BASE_IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0YjkwZTEzYWY1MDgyNWNlMDI2M2ZjOWQxOTdjOWU4YSIsIm5iZiI6MTYyOTkzNzQzOS45MTM5OTk4LCJzdWIiOiI2MTI2ZGYxZmFhZjg5NzAwNDQ3ZjlhMzUiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.WdS9xgyX4eaResQBc18BQSZ3eIzZR6shPU6mZOh0GM8'
  }
};

async function getSingleMovie(movieId){
  const url = SINGLE_MOVIE_URL + movieId + '?language=pt-BR';

  return await fetch(url, options)
    .then(res => res.json())
    .then(res => res)
    .catch(err => console.error(err));
}

const watchedMoviesInfo = await Promise.all(
  watchedMovies.map(async movie => {
    const dadosTMDB = await getSingleMovie(movie.id);
    return { ...movie, poster_path: dadosTMDB.poster_path, genres: dadosTMDB.genres }
  })
)

document.addEventListener('DOMContentLoaded', showMovies(watchedMoviesInfo));

searchForm.addEventListener('submit', e => {
  e.preventDefault();

  moviesListEl.innerHTML = '';

  const searchTerm = searchInput.value;

  if(searchTerm != ''){
    getMovies(searchTerm);
  }
})

async function getMovies(searchTerm){
  const url = BASE_URL + "&query=" + searchTerm;

  await fetch(url, options)
    .then(res => res.json())
    .then(res => showMovies(res.results))
    .catch(err => console.error(err));
}

function showMovies(moviesList){
  moviesList.forEach(movie => {
    let movieCard = document.createElement("div");
    let posterPath = movie.poster_path ? BASE_IMAGE_URL + movie.poster_path : '';

    movieCard.innerHTML = `
      <div
        class="w-full aspect-[2/3] space-y-2 bg-white overflow-hidden cursor-pointer transition-all flex flex-col"
      >
        <div class="w-full h-[90%] rounded-lg overflow-hidden">
          <img 
            src="${posterPath}" 
            alt="${movie.title}" 
            class="w-full h-full object-cover transition-transform duration-500 ease-out hover:scale-110"
            onerror="this.src='../img/placeholder.jpg';"
          >
        </div>
        <div class="h-[10%]">
          <h3 class="text-sm font-semibold text-slate-800 line-clamp-1">${movie.title}</h3>
        </div>
      </div>
    `

    movieCard.addEventListener('click', () => getMovie(movie.id));
    moviesListEl.append(movieCard);
  });
}

async function getMovie(movieId){
  const url = SINGLE_MOVIE_URL + movieId + '?language=pt-BR';

  return await fetch(url, options)
    .then(res => res.json())
    .then(res => openMovieModal(res))
    .catch(err => console.error(err));
}

function openMovieModal(movie){
  let movieModal = document.createElement("div");
  movieModal.className = 'overflow-auto fixed inset-0 w-full h-full p-4 bg-black/40 flex justify-center items-center z-50';
  movieModal.id = 'movie-modal';

  let modalContent = document.createElement("div");
  modalContent.className = 'w-md p-4 space-y-2 rounded-lg bg-gray-200';
  modalContent.id = 'modal-content';

  let posterPath = movie.poster_path ? BASE_IMAGE_URL + movie.poster_path : '';

  modalContent.innerHTML = `
    <div class="w-full h-[90%] rounded-lg overflow-hidden">
      <img 
        src="${posterPath}" 
        alt="${movie.title}" 
        class="w-full h-full object-cover transition-transform duration-500 ease-out hover:scale-110"
        onerror="this.src='../img/placeholder.jpg';"
      >
    </div>
    <div>
      <h2 class="text-lg font-bold text-slate-900">${movie.title}</h2>
      <p class="text-sm text-slate-700">${movie.overview}</p>
    </div>
    <div class="my-4 flex flex-wrap gap-2">
      ${movie.genres.map(g => `<span class="text-xs bg-gray-300 px-2 py-1 rounded">${g.name}</span>`).join('')}
    </div>
    <span class="text-sm text-slate-600">Nota: ${movie.vote_average}</span>
  `;

  if(!isAlreadyWatched(movie.id)){
    let saveMovieBtn = document.createElement('button');
    saveMovieBtn.className = 'w-full cursor-pointer mt-6 py-2 px-3 rounded-lg text-white bg-blue-600 hover:bg-blue-700'
    saveMovieBtn.textContent = 'Marcar como assistido'
    saveMovieBtn.addEventListener('click', () => openRatingModal(movie))
    modalContent.appendChild(saveMovieBtn);
  }

  movieModal.appendChild(modalContent);

  movieModal.addEventListener('click', (e) => {
    if(e.target === movieModal){
      document.body.removeChild(movieModal);
    }
  })

  document.body.appendChild(movieModal);
}

function openRatingModal(movie){
  const reviewers = ["evandro", "tauane", "kauane"];
  const ratings = {};

  let currentReviewerIndex = 0;

  let posterPath = movie.poster_path ? BASE_IMAGE_URL + movie.poster_path : '';
  const movieModal = document.querySelector('#movie-modal');
  const modalContent = document.querySelector('#modal-content');

  function renderStep(){
    const reviewer = reviewers[currentReviewerIndex];

    modalContent.innerHTML = `
      <div id="movie-content" class="p-4 space-y-2 rounded-lg bg-gray-200">
        <div class="w-32 mb-4 mx-auto aspect-[2/3] rounded-lg overflow-hidden">
          <img 
            src="${posterPath}" 
            alt="${movie.title}" 
            class="w-full h-full object-cover transition-transform duration-500 ease-out hover:scale-110"
            onerror="this.src='../img/placeholder.jpg';"
          >
        </div>
        <div class="mb-4 text-center">
          <h2 class="text-lg font-bold text-slate-900">${movie.title}</h2>
          <p class="text-sm text-slate-700">${reviewer.charAt(0).toUpperCase() + reviewer.slice(1)}, que nota você da para esse filme?</p>
        </div>
        <input 
          type="number" 
          id="rating-input" 
          min="0" 
          max="10" 
          step="0.5" 
          class="w-full border border-gray-300 rounded-lg p-2 text-center focus:outline-none focus:ring-2 focus:ring-blue-500" 
          placeholder="Digite uma nota de 0 a 10"
        >
        <button 
          id="next-btn" 
          class="ml-auto px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors block"
        >
          Próximo →
        </button>
      </div>
    `;
  }

  renderStep()

  modalContent.addEventListener('click', (e) => {
    if(e.target.id === 'next-btn'){
      const input = document.querySelector("#rating-input");
      const value = parseFloat(input.value);

      if(isNaN(value) || value < 0 || value > 10){
        alert("Por favor né, digite uma nota de 0 a 10");
        return;
      }

      const reviewer = reviewers[currentReviewerIndex];
      ratings[reviewer] = value;

      currentReviewerIndex++;

      if(currentReviewerIndex < reviewers.length){
        renderStep();
      } else {
        movieModal.remove()
        saveMovie(movie, ratings);
      }
    }
  })
}

function isAlreadyWatched(movieId){
  return watchedMoviesIds.includes(movieId);
}

async function saveMovie(movie, ratings) {
  if(isAlreadyWatched(movie.id)){
    return;
  }

  const ratingValues = Object.values(ratings);
  const average_rating = Number(
    (ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length).toFixed(1)
  )

  await addDoc(collection(db, "movies"), {
    id: movie.id,
    title: movie.title,
    original_title: movie.original_title,
    watched_at: new Date().toISOString(),
    ratings,
    average_rating,
    imdb_rating: movie.vote_average,
    review: 'Filmaço hein!',
    created_at: new Date(),
    updated_at: new Date()
  });

  alert(`O filme "${movie.title}" foi salvo com a nota: ${average_rating}!`);
}