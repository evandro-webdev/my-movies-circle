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
watchedMovies.sort((a, b) => b.average_rating - a.average_rating);
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
        runtime: dadosTMDB.runtime,
        tmdb_rating: dadosTMDB.vote_average.toFixed(1)
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

const reviewerColors = {
  evandro: 'bg-[#338CD5]',
  tauane: 'bg-[#BF4345]',
  kauane: 'bg-[#6941BA]'
};


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

searchForm.addEventListener('submit', async e => {
  e.preventDefault();
  moviesListEl.innerHTML = '';

  const searchTerm = searchInput.value.trim();

  if (searchTerm !== ''){
    const movies = await getMovies(searchTerm);
    showMovies(movies.results, 'discoverList');
  } 
  searchInput.value = "";
});

async function getMovies(searchTerm) {
  const url = `${BASE_URL}&query=${encodeURIComponent(searchTerm)}`;

  try {
    const res = await fetch(url, options);
    return await res.json();
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
    const averageRating = tab === 'discoverList' || tab === 'savedList' ? movie.vote_average.toFixed(1) : movie.average_rating;

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
            <span class="text-[10px] font-medium">${averageRating}</span>
          </div>
        </div>
        <div class="h-[10%]">
          <h3 class="text-sm font-semibold text-gray-700 line-clamp-1">${movie.title}</h3>
        </div>
      </div>
    `;

    // Define o comportamento do clique dependendo da aba
    movieCard.addEventListener('click', async () => {
      const movieData = tab === 'watchedList' ? movie : await getMovie(movie.id);

      openMovieModal(movieData);
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
    return await res.json();
  } catch (err) {
    console.error("Erro ao carregar detalhes do filme:", err);
  }
}

/*************************************************
 * 🎞️ MODAL DE DETALHES DO FILME
 *************************************************/

function openMovieModal(movie) {
  document.body.style.overflow = 'hidden';
  
  const movieModal = createModalWrapper();
  movieModal.appendChild(createMovieHeader(movie));
  movieModal.appendChild(createMovieInfo(movie));
  
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

function createMovieInfo(movie){
  const div = document.createElement("div");
  div.className = 'pt-2 pb-4 px-4';
  div.id = 'movie-info';

  div.innerHTML = `
    <div>
      <div id="movie-header">
        <h2 class="text-3xl font-semibold text-slate-800">${movie.title}</h2>
        <p class="text-[14px] font-light text-[#8C8C8C]">${movie.tagline}</p>
      </div>

      <div id="movie-footer">
        <div class="mt-2 mb-4 text-xs text-[#5E5E5E] flex items-center gap-2">
          <div class="flex gap-2">
            ${movie.genres.map(g => `<span class="px-2 py-[2px] rounded-full font-medium bg-[#EDEDED]">${g.name}</span>`).join('')}
          </div>
          <span>·</span>
          <span>${movie.release_date.slice(0, 4)}</span>
          <span>·</span>
          <span>${formatRuntime(movie.runtime)}</span>
        </div>

        <p class="text-[16px] text-[#8C8C8C] font-light leading-[20px] line-clamp-6">${movie.overview}</p>
      </div>
    </div>
  `
  div.querySelector('#movie-footer').appendChild(createMovieRatingList(movie));
  div.appendChild(createMovieActionButtons(movie));

  return div;
}

function createMovieRatingList(movie){
  const div = document.createElement('div');
  div.className = 'mt-4 flex items-center gap-2'

  if (isAlreadyWatched(movie.id)) {
    div.innerHTML = `
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
        <span class="block text-sm font-bold">${movie.tmdb_rating}</span>
      </div>
    `;
  }else{
    div.innerHTML = `
      <div class="pr-2 rounded-full text-white bg-[#4EBBC5] flex items-center gap-2">
        <img src="../img/tmdb.jpg" class="w-6 rounded-full">
        <span class="block text-sm font-bold">${movie.vote_average.toFixed(1)}</span>
      </div>
    `
  }

  return div;
}

function createMovieActionButtons(movie){
  const div = document.createElement('div');
  div.id = "movie-action-buttons";
  div.className = 'mt-6 flex items-center gap-4';

  if (!isAlreadyWatched(movie.id)) {
    div.innerHTML = `
      <button class="py-2 px-3 rounded-lg hover:bg-gray-100 flex justify-center items-center gap-2">
        <svg class="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke="currentColor">
          <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
        </svg>
        <span class="text-gray-500 font-medium">Salvar</span>
      </button>
      <button id="rate-movie-btn" class="w-full py-2 px-3 rounded-lg text-white bg-[#0088FF] hover:bg-blue-600 flex justify-center items-center gap-2">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke="currentColor">
          <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
        <span class="font-medium">Marcar como assistido</span>
      </button>
    `
    
    div.querySelector('#rate-movie-btn').addEventListener('click', () => openRatingModal(movie));
  } else {
    div.innerHTML = `
      <button class="py-2 px-3 rounded-lg hover:bg-gray-100 flex justify-center items-center gap-2">
        <svg class="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke="currentColor">
          <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
        </svg>
        <span class="text-gray-500 font-medium">Remover</span>
      </button>
      <button id="rate-movie-btn" class="w-full py-2 px-3 rounded-lg text-white bg-[#0088FF] hover:bg-blue-600 flex justify-center items-center gap-2">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke="currentColor">
          <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/>
        </svg>
        <span class="font-medium">Editar avaliação</span>
      </button>
    `
  }

  return div;
}

/*************************************************
 * ⭐ MODAL DE AVALIAÇÃO DO FILME
 *************************************************/

const sliderButton = document.getElementById('sliderButton');
const progressBar = document.getElementById('progressBar');
const valueDisplay = document.getElementById('valueDisplay');
const sliderValue = document.getElementById('sliderValue');
const container = sliderButton.parentElement;

let isDragging = false;
const minValue = 0;
const maxValue = 10;

function updateSlider(clientX) {
    const rect = container.getBoundingClientRect();
    let percentage = (clientX - rect.left) / rect.width;
    percentage = Math.max(0, Math.min(1, percentage));
    
    const value = Math.round(percentage * maxValue * 2) / 2;
    const adjustedPercentage = value / maxValue;
    
    sliderButton.style.left = `${adjustedPercentage * 100}%`;
    progressBar.style.width = `${adjustedPercentage * 100}%`;
    valueDisplay.textContent = value;
    sliderValue.value = value;
    
    // Dispara evento de mudança
    sliderValue.dispatchEvent(new Event('change', { bubbles: true }));
}

sliderButton.addEventListener('mousedown', (e) => {
    isDragging = true;
    sliderButton.classList.add('scale-110');
});

document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        updateSlider(e.clientX);
    }
});

document.addEventListener('mouseup', () => {
    isDragging = false;
    sliderButton.classList.remove('scale-110');
});

// Suporte para touch em dispositivos móveis
sliderButton.addEventListener('touchstart', (e) => {
    isDragging = true;
    sliderButton.classList.add('scale-110');
});

document.addEventListener('touchmove', (e) => {
    if (isDragging) {
        updateSlider(e.touches[0].clientX);
    }
});

document.addEventListener('touchend', () => {
    isDragging = false;
    sliderButton.classList.remove('scale-110');
});

// Clique na trilha para mover o slider
container.addEventListener('click', (e) => {
    if (e.target !== sliderButton && !sliderButton.contains(e.target)) {
        updateSlider(e.clientX);
    }
});

function openRatingModal(movie) {
  document.querySelector('#movie-action-buttons').remove();

  const reviewers = ["evandro", "tauane", "kauane"];
  const ratings = {};
  let currentReviewerIndex = 0;

  const movieHeader = document.querySelector('#movie-header');
  const movieFooter = document.querySelector('#movie-footer');
  
  function renderStep() {
    const reviewer = reviewers[currentReviewerIndex];
    movieHeader.querySelector('p').innerHTML = capitalize(reviewer) + ' que nota você da para esse filme?'

    movieFooter.innerHTML = `
      <div>
        <div class="mt-8 flex items-center gap-2">
          <img 
            src="../img/${reviewer}.jpg" 
            class="w-14 rounded-full"
          >

          <div class="w-full relative">
            <!-- Input oculto para capturar o valor -->
            <input type="hidden" id="sliderValue" name="sliderValue" value="5">
            
            <!-- Container do slider -->
            <div class="relative pt-8">
                <!-- Trilha do slider -->
                <div class="absolute top-1/2 w-full h-2 bg-gray-300 rounded-full -translate-y-1/2"></div>
                
                <!-- Barra de progresso -->
                <div id="progressBar" class="absolute top-1/2 h-2 bg-blue-500 rounded-full -translate-y-1/2 transition-all duration-150" style="width: 50%"></div>
                
                <!-- Botão do slider -->
                <div id="sliderButton" class="absolute top-1/2 w-12 h-12 bg-blue-500 rounded-full shadow-lg cursor-pointer flex items-center justify-center text-white font-bold -translate-y-1/2 -translate-x-1/2 transition-all duration-150 hover:scale-110" style="left: 50%">
                    <span id="valueDisplay">5</span>
                </div>
            </div>
            
            <!-- Labels min e max -->
            <div class="flex justify-between mt-4 text-sm text-gray-600">
                <span>0</span>
                <span>10</span>
            </div>
          </div>
        </div>
      </div>

      <button id="next-btn" class="block ml-auto mt-4 py-2 px-3 rounded-lg text-white font-medium bg-[#0088FF] hover:bg-blue-600 transition-all">
        Próximo →
      </button>
    `;
  }

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

    movieFooter.innerHTML = `
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

    document.querySelector('#save-btn').addEventListener('click', async () => {
      try {
        await saveMovie(movie, ratings);
        movieFooter.remove();
        location.reload();
      } catch (error) {
        console.error("Erro ao salvar o filme:", error);
      }
    });

    document.querySelector('#cancel-btn').addEventListener('click', () => {
      movieFooter.remove();
    });
  }

  // Inicializa primeira etapa
  renderStep();

  // Evento "Próximo"
  movieFooter.addEventListener('click', e => {
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
    // tmdb_rating: movie.vote_average.toFixed(),
    review: 'Filmaço hein!',
    created_at: new Date(),
    updated_at: new Date()
  });

  alert(`🎬 O filme "${movie.title}" foi salvo com média: ${average_rating}!`);
}

