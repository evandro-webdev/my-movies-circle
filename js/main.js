import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";

import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBpSXsr8ZC_BmCnaySCp42NexSrTFTzHtg",
  authDomain: "my-movie-circle.firebaseapp.com",
  projectId: "my-movie-circle",
  storageBucket: "my-movie-circle.appspot.com",
  messagingSenderId: "509365004119",
  appId: "1:509365004119:web:cac637bcf57aaaef1c4012"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Obtém os filmes salvos no Firestore
const snapshotMovies = await getDocs(collection(db, 'movies'));
const watchedMovies = snapshotMovies.docs.map(doc => doc.data());
const watchedMoviesIds = watchedMovies.map(movie => movie.id);


/*************************************************
 * 🌐 TMDB CONFIGURAÇÃO DE API
 *************************************************/

const BASE_URL = 'https://api.themoviedb.org/3/search/movie?language=pt-BR';
const SINGLE_MOVIE_URL = 'https://api.themoviedb.org/3/movie/';
const POPULAR_URL = 'https://api.themoviedb.org/3/movie/popular?language=pt-BR&page=1';
const BASE_IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0YjkwZTEzYWY1MDgyNWNlMDI2M2ZjOWQxOTdjOWU4YSIsIm5iZiI6MTYyOTkzNzQzOS45MTM5OTk4LCJzdWIiOiI2MTI2ZGYxZmFhZjg5NzAwNDQ3ZjlhMzUiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.WdS9xgyX4eaResQBc18BQSZ3eIzZR6shPU6mZOh0GM8' // 🔒 Ideal: colocar isso em variável .env no backend
  }
};


/*************************************************
 * 🔍 BUSCAR FILME ÚNICO NO TMDB
 *************************************************/

async function getSingleMovie(movieId) {
  const url = `${SINGLE_MOVIE_URL}${movieId}?language=pt-BR`;

  try {
    const res = await fetch(url, options);
    return await res.json();
  } catch (err) {
    console.error("Erro ao buscar filme único:", err);
  }
}


/*************************************************
 * 🎬 COMPLETA OS DADOS DOS FILMES JÁ ASSISTIDOS
 *************************************************/

async function loadWatchedMoviesInfo(){ 
  return await Promise.all(
    watchedMovies.map(async movie => {
      const dadosTMDB = await getSingleMovie(movie.id);
      return { 
        ...movie,
        poster_path: dadosTMDB.poster_path,
        genres: dadosTMDB.genres,
        overview: dadosTMDB.overview,
        tagline: dadosTMDB.tagline,
        release_date: dadosTMDB.release_date,
        runtime: dadosTMDB.runtime
      };
    })
  )
};


/*************************************************
 * 🧩 ELEMENTOS DO DOM
 *************************************************/

const moviesListEl = document.querySelector('#watched-movies');
const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-input');


/*************************************************
 * 🚀 EXIBIÇÃO INICIAL DOS FILMES ASSISTIDOS
 *************************************************/

async function initApp() {
  const watchedMoviesInfo = await loadWatchedMoviesInfo();

  showMovies(watchedMoviesInfo, 'watchedList');

  const splash = document.querySelector('#splash-screen');
  splash.classList.add("opacity-0");

  setTimeout(() => {
    splash.style.display = "none";
  }, 700)
}

document.addEventListener('DOMContentLoaded', await initApp());


/*************************************************
 * 🔎 BUSCA DE FILMES NO TMDB
 *************************************************/

searchForm.addEventListener('submit', e => {
  e.preventDefault();
  moviesListEl.innerHTML = ''; // Limpa resultados anteriores

  const searchTerm = searchInput.value.trim();
  if (searchTerm !== '') getMovies(searchTerm);
  searchInput.value = "";
});

async function getMovies(searchTerm) {
  const url = `${BASE_URL}&query=${encodeURIComponent(searchTerm)}`;

  try {
    const res = await fetch(url, options);
    const data = await res.json();
    showMovies(data.results, 'defaultList');
  } catch (err) {
    console.error("Erro ao buscar filmes:", err);
  }
}


/*************************************************
 * 🖼️ EXIBIR LISTA DE FILMES
 *************************************************/

function showMovies(moviesList, tab) {
  moviesList.forEach(movie => {
    const movieCard = document.createElement("div");
    const posterPath = movie.poster_path ? BASE_IMAGE_URL + movie.poster_path : '';

    movieCard.innerHTML = `
      <div class="space-y-1 overflow-hidden cursor-pointer flex flex-col">
        <div class="relative w-[185px] max-w-full aspect-[185/280] rounded-lg overflow-hidden">
          <img 
            src="${posterPath}" 
            alt="${movie.title}" 
            class="w-full h-full object-cover transition-transform duration-500 ease-out hover:scale-110"
            onerror="this.src='../img/placeholder.jpg';"
          >
          <div class="absolute top-2 right-2 p-[6px] rounded-md text-xs font-medium text-white bg-gradient-to-t from-[#194476] to-[#215DA2] flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-star-icon lucide-star">
              <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>
            </svg>
            <span class="text-[10px] font-medium">${movie.average_rating}</span>
          </div>
        </div>
        <div class="h-[10%]">
          <h3 class="text-sm font-semibold text-gray-700 line-clamp-1">${movie.title}</h3>
        </div>
      </div>
    `;

    // Define o comportamento do clique dependendo da aba
    movieCard.addEventListener('click', () => {
      tab === 'watchedList' ? openMovieModal(movie) : getMovie(movie.id);
    });

    moviesListEl.append(movieCard);
  });
}


/*************************************************
 * 🎥 BUSCAR DETALHES E ABRIR MODAL DO FILME
 *************************************************/

async function getMovie(movieId) {
  const url = `${SINGLE_MOVIE_URL}${movieId}?language=pt-BR`;

  try {
    const res = await fetch(url, options);
    const data = await res.json();
    openMovieModal(data);
  } catch (err) {
    console.error("Erro ao carregar detalhes do filme:", err);
  }
}


/*************************************************
 * 🎞️ MODAL DE DETALHES DO FILME
 *************************************************/

function openMovieModal(movie) {
  document.body.style.overflow = 'hidden';
  movie.tmdb_rating = movie.vote_average ? movie.vote_average : movie.tmdb_rating;
  // console.log(movie);

  const movieModal = createModalWrapper();
  const movieHeader = createMovieHeader(movie)

  const posterPath = movie.poster_path ? BASE_IMAGE_URL + movie.poster_path : '';

  movieModal.innerHTML = `
    <div class="relative w-full overflow-hidden">
      <img 
        src="${posterPath}" 
        alt="${movie.title}" 
        class="w-full h-full object-cover hover:scale-110 transition-transform duration-500 ease-out"
      >

      <div class="absolute bottom-0 left-0 w-full h-1/4 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
      <div class="fixed top-0 left-0 w-full h-1/5 bg-gradient-to-b from-black to-transparent pointer-events-none"></div>

      <div class="fixed top-0 left-0 w-full px-2 py-3 text-white flex justify-between">
        <button id="close-modal">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-left-icon lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
        </button>
        <button>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ellipsis-vertical-icon lucide-ellipsis-vertical"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
        </button>
      </div>
    </div>

    <div class="p-2" id="movie-info">
      <div>
        <h2 class="text-3xl font-semibold text-slate-800">${movie.title}</h2>
        <p class="text-[14px] font-light text-[#8C8C8C]">${movie.tagline}</p>
        <div class="mt-2 mb-4 text-xs text-[#5E5E5E] flex items-center gap-2">
          <div class="flex gap-2">
            ${movie.genres.map(g => `<span class="px-2 py-[2px] rounded-full font-medium bg-[#EDEDED]">${g.name}</span>`).join('')}
          </div>
          <span>·</span>
          <span>${movie.release_date.slice(0, 4)}</span>
          <span>·</span>
          <span>${formatRuntime(movie.runtime)}</span>
        </div>
      </div>
        
      <p class="text-[16px] text-[#8C8C8C] font-light leading-[20px] line-clamp-6">${movie.overview}</p>
    </div>
  `;

  const ratingList = document.createElement('div');
  ratingList.className = 'mt-4 mb-8 flex items-center gap-2'

  if (isAlreadyWatched(movie.id)) {
    const reviewerColors = {
      evandro: 'bg-[#338CD5]',
      tauane: 'bg-[#BF4345]',
      kauane: 'bg-[#6941BA]'
    };

    ratingList.innerHTML = `
      ${Object.entries(movie.ratings).map(([user, nota]) => `
        <div class="pr-2 rounded-full text-white ${reviewerColors[user]} flex items-center gap-2">
          <img src="../img/${user}.jpg" class="w-6 rounded-full">
          <span class="block text-sm font-bold">${nota}</span>
        </div>
      `).join('')}
      <div class="pr-2 rounded-full text-white bg-[#3A5A7E] flex items-center gap-2">
        <img src="../img/average.jpg" class="w-6 rounded-full">
        <span class="block text-sm font-bold">${movie.average_rating}</span>
      </div>
      <div class="pr-2 rounded-full text-white bg-[#4EBBC5] flex items-center gap-2">
        <img src="../img/tmdb.jpg" class="w-6 rounded-full">
        <span class="block text-sm font-bold">${movie.tmdb_rating.toFixed(1)}</span>
      </div>
    `;
    movieModal.querySelector('#movie-info').appendChild(ratingList);
  }else{
    ratingList.innerHTML = `
      <div class="pr-2 rounded-full text-white bg-[#4EBBC5] flex items-center gap-2">
        <img src="../img/tmdb.jpg" class="w-6 rounded-full">
        <span class="block text-sm font-bold text-gray-700 capitalize">${movie.tmdb_rating.toFixed(1)}</span>
      </div>
    `
    movieModal.querySelector('#movie-info').appendChild(ratingList);
  }

  // Se ainda não assistido → botão “Marcar como assistido”
  if (!isAlreadyWatched(movie.id)) {
    const saveMovieBtn = document.createElement('button');
    saveMovieBtn.className = 'w-full mt-2 py-2 px-3 rounded-lg text-white bg-blue-600 hover:bg-blue-700';
    saveMovieBtn.textContent = 'Marcar como assistido';
    saveMovieBtn.addEventListener('click', () => openRatingModal(movie));
    movieModal.appendChild(saveMovieBtn);
  }

  // Fecha o modal ao clicar no fundo
  movieModal.querySelector('#close-modal').addEventListener('click', (e) => {
    movieModal.remove();
    document.body.style.overflow = 'auto';
  })

  document.body.appendChild(movieModal);
}

function createModalWrapper(){
  const movieModal = document.createElement("div");
  movieModal.className = "fixed top-0 w-full h-full bg-white overflow-y-auto";
  movieModal.id = "movie-modal";

  return movieModal;
}


function createMovieHeader(movie){
  const posterPath = movie.poster_path ? BASE_IMAGE_URL + movie.poster_path : '';

  const div = document.createElement("div");
  div.className = "relative w-full overflow-hidden";

  div.innerHTML = `
    <img 
      src="${posterPath}" 
      alt="${movie.title}" 
      class="w-full h-full object-cover hover:scale-110 transition-transform duration-500 ease-out"
    >

    <div class="absolute bottom-0 left-0 w-full h-1/4 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
    <div class="fixed top-0 left-0 w-full h-1/5 bg-gradient-to-b from-black to-transparent pointer-events-none"></div>

    <div class="fixed top-0 left-0 w-full px-2 py-3 text-white flex justify-between">
      <button id="close-modal">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-left-icon lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
      </button>
      <button>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ellipsis-vertical-icon lucide-ellipsis-vertical"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
      </button>
    </div>
  `
  
  return div;
}


/*************************************************
 * ⭐ MODAL DE AVALIAÇÃO DO FILME
 *************************************************/

function openRatingModal(movie) {
  const reviewers = ["evandro", "tauane", "kauane"];
  const ratings = {};
  let currentReviewerIndex = 0;

  const movieModal = document.querySelector('#movie-modal');
  const posterPath = movie.poster_path ? BASE_IMAGE_URL + movie.poster_path : '';

  // Etapa individual de nota
  function renderStep() {
    const reviewer = reviewers[currentReviewerIndex];

    // Mapa com as cores de cada pessoa
    const reviewerColors = {
      evandro: 'border-blue-600',
      tauane: 'border-red-600',
      kauane: 'border-purple-600'
    };

    // Define a cor com base no reviewer atual
    const borderColor = reviewerColors[reviewer] || 'border-gray-400';

    movieModal.innerHTML = `
      <div class="w-36 mb-4 mx-auto aspect-[2/3] rounded-xl overflow-hidden">
        <img src="${posterPath}" alt="${movie.title}" class="w-full h-full object-cover">
      </div>

      <h2 class="text-center text-xl font-bold text-slate-900">${movie.title}</h2>

       <div class="mt-8 text-center space-y-4">
        <img 
          src="../img/${reviewer}.jpg" 
          class="mx-auto w-16 rounded-full border-2 ${borderColor}"
        >
        <p class="text-sm text-slate-600">${capitalize(reviewer)}, que nota você dá para esse filme?</p>
      </div>

      <input 
        type="number" 
        id="rating-input" 
        min="0" 
        max="10" 
        step="0.5" 
        class="w-full border-2 border-slate-200 rounded-xl p-3 text-center text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
        placeholder="0 a 10"
      >

      <button id="next-btn" class="block ml-auto mt-4 px-6 py-3 rounded-xl text-white font-medium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all">
        Próximo →
      </button>
    `;
  }

  // Tela final de resumo
  function renderSummary() {
    const ratingValues = Object.values(ratings);
    const average_rating = Number(
      (ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length).toFixed(1)
    );

    const notesList = reviewers.map(r => `
      <div class="py-3 px-2 border-b border-gray-100 flex justify-between items-center hover:bg-slate-50 transition-colors rounded-lg">
        <span class="font-semibold capitalize text-slate-700">${r}</span>
        <span class="text-lg font-bold text-blue-600">${ratings[r]}</span>
      </div>
    `).join('');

    movieModal.innerHTML = `
      <img src="${BASE_IMAGE_URL}${movie.poster_path}" alt="${movie.title}" class="rounded-xl w-full object-cover">

      <h2 class="text-xl font-bold mt-4 text-slate-800">${movie.title}</h2>

      <div class="text-left mt-6 space-y-2 bg-gray-50 rounded-xl p-4">
        ${notesList}
        <div class="py-3 px-2 flex justify-between items-center hover:bg-slate-50 transition-colors rounded-lg">
          <span class="font-semibold capitalize text-slate-700">Média:</span>
          <span class="text-lg font-bold text-blue-600">${average_rating}</span>
        </div>
      </div>


      <div class="flex justify-center gap-4 mt-6">
        <button id="cancel-btn" class="bg-gray-200 text-slate-700 px-6 py-3 rounded-lg font-medium transition-all">
          Cancelar
        </button>
        <button id="save-btn" class="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium">
          Salvar filme
        </button>
      </div>
    `;

    // Eventos dos botões
    document.querySelector('#save-btn').addEventListener('click', async () => {
      try {
        await saveMovie(movie, ratings);
        movieModal.remove();
        location.reload(); // 🔁 recarrega a página
      } catch (error) {
        console.error("Erro ao salvar o filme:", error);
      }
    });

    document.querySelector('#cancel-btn').addEventListener('click', () => {
      movieModal.remove();
    });
  }

  // Inicializa primeira etapa
  renderStep();

  // Evento "Próximo"
  movieModal.addEventListener('click', e => {
    if (e.target.id === 'next-btn') {
      const input = document.querySelector("#rating-input");
      const value = parseFloat(input.value);

      if (isNaN(value) || value < 0 || value > 10) {
        alert("Por favor, digite uma nota válida de 0 a 10.");
        return;
      }

      ratings[reviewers[currentReviewerIndex]] = value;
      currentReviewerIndex++;

      if (currentReviewerIndex < reviewers.length) renderStep();
      else renderSummary();
    }
  });
}


/*************************************************
 * 🧮 FUNÇÕES AUXILIARES
 *************************************************/

function isAlreadyWatched(movieId) {
  return watchedMoviesIds.includes(movieId);
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatRuntime(minutes) {
  if (!minutes) return "—";
  
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  
  return `${h}h ${m}m`;
}

/*************************************************
 * 💾 SALVAR FILME NO FIRESTORE
 *************************************************/

async function saveMovie(movie, ratings) {
  if (isAlreadyWatched(movie.id)) return;

  const ratingValues = Object.values(ratings);
  const average_rating = Number(
    (ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length).toFixed(1)
  );

  await addDoc(collection(db, "movies"), {
    id: movie.id,
    title: movie.title,
    original_title: movie.original_title,
    watched_at: new Date().toISOString(),
    ratings,
    average_rating,
    tmdb_rating: movie.vote_average,
    review: 'Filmaço hein!',
    created_at: new Date(),
    updated_at: new Date()
  });

  alert(`🎬 O filme "${movie.title}" foi salvo com média: ${average_rating}!`);
}

