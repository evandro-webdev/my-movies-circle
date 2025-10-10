const moviesListEl = document.querySelector('#movies-list');
const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-input');

const POPULAR_URL = 'https://api.themoviedb.org/3/movie/popular?language=pt-BR&page=1'
const BASE_URL = 'https://api.themoviedb.org/3/search/movie?language=pt-BR';
const BASE_IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0YjkwZTEzYWY1MDgyNWNlMDI2M2ZjOWQxOTdjOWU4YSIsIm5iZiI6MTYyOTkzNzQzOS45MTM5OTk4LCJzdWIiOiI2MTI2ZGYxZmFhZjg5NzAwNDQ3ZjlhMzUiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.WdS9xgyX4eaResQBc18BQSZ3eIzZR6shPU6mZOh0GM8'
  }
};

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
    movieCard.addEventListener('click', () => openMovieModal(movie));
    moviesListEl.append(movieCard);
  });
}

function openMovieModal(movie){
  let movieModal = document.createElement("div");

  let posterPath = movie.poster_path ? BASE_IMAGE_URL + movie.poster_path : '';

  let saveMovieBtn = document.createElement('button');
  saveMovieBtn.className = 'w-full cursor-pointer mt-6 py-2 px-3 rounded-lg text-white bg-blue-600 hover:bg-blue-700'
  saveMovieBtn.textContent = 'Marcar como assistido'
  saveMovieBtn.addEventListener('click', () => saveMovie(movie.id, movie.title, movie.vote_average))

  movieModal.className = 'fixed inset-0 w-full h-full p-4 bg-black/40 flex justify-center items-center z-50';

  movieModal.innerHTML = `
    <div id="movie-content" class="w-md p-4 space-y-2 rounded-lg bg-gray-200">
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
      <span class="text-sm text-slate-600">Nota: ${movie.vote_average}</span>
    </div>
  `;

  const movieContent = movieModal.querySelector('#movie-content');
  movieContent.appendChild(saveMovieBtn);

  movieModal.addEventListener('click', (e) => {
    if(e.target === movieModal){
      document.body.removeChild(movieModal);
    }
  })

  document.body.appendChild(movieModal);
}

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

async function saveMovie(movieId, movieTitle, movieVote) {
  await addDoc(collection(db, "filmes"), {
    id: movieId,
    titulo: movieTitle,
    nota: movieVote,
    data: new Date(),
  });
}