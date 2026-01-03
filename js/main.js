import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";

import { 
  getFirestore, 
  collection, 
  doc,  
  addDoc, 
  getDocs, 
  deleteDoc 
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

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

let watchedMovies = [];
let watchedMoviesIds = [];
let watchedMoviesDetailed = [];

async function loadWatchedMovies(){
  const snapshot = await getDocs(collection(db, 'watchedMovies'));

  watchedMovies = snapshot.docs.map(doc => ({
    docId: doc.id,
    ...doc.data(),
  }));

  watchedMoviesIds = watchedMovies.map(movie => movie.id);
}


async function loadWatchedMoviesInfo(){ 
  await loadWatchedMovies();

  watchedMoviesDetailed = await Promise.all(
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

  watchedMoviesDetailed.sort((a, b) => b.average_rating - a.average_rating);

  return watchedMoviesDetailed;
};

let savedMovies = [];
let savedMoviesIds = [];
let savedMoviesDetailed = [];

async function loadSavedMovies(){
  const snapshot = await getDocs(collection(db, 'savedMovies'));

  savedMovies = snapshot.docs.map(doc => ({
    docId: doc.id,
    ...doc.data(),
  }));

  savedMoviesIds = savedMovies.map(movie => movie.id);
}


async function loadSavedMoviesInfo(){ 
  await loadSavedMovies();

  savedMoviesDetailed = await Promise.all(
    savedMovies.map(async movie => {
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

  savedMoviesDetailed.sort((a, b) => b.average_rating - a.average_rating);

  return savedMoviesDetailed;
};


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

let currentTab = 'watched';

document.querySelectorAll('#navigation-bar button').forEach(btn => {
  btn.addEventListener('click', async () => {
    const tab = btn.dataset.tab;
    if(tab === currentTab) return;

    currentTab = tab;
    updateTabUI();
    await loadTabContent(currentTab);
  })
})

function updateTabUI(){
  document.querySelectorAll('#navigation-bar button').forEach(btn => {
    if(btn.dataset.tab === currentTab) {
      btn.classList.remove("text-gray-400");
      btn.classList.add("text-[#0088FF]");
    } else {
      btn.classList.add("text-gray-400");
      btn.classList.remove("text-[#0088FF]");
    }
  })
}

async function loadTabContent(currentTab){
  if(currentTab === 'watched'){
    console.log('watched')
    showMovies(watchedMoviesDetailed);
  }else if(currentTab === 'saved'){
    console.log('saved')

    savedMovies = await loadSavedMoviesInfo();
    showMovies(savedMovies);
  }
}


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

    movieCard.innerHTML = createMovieCardHtml(movie, posterPath, averageRating);

    movieCard.addEventListener('click', async () => {
      const movieData = tab === 'watchedList' ? movie : await getMovie(movie.id);

      openMovieModal(movieData);
    });

    moviesListEl.append(movieCard);
  });
}

function createMovieCardHtml(movie, posterPath, averageRating){
  return `
    <div class="space-y-1 overflow-hidden cursor-pointer flex flex-col">
      <div class="relative w-[185px] max-w-full aspect-[185/280] rounded-lg overflow-hidden">
        <div class="skeleton absolute inset-0 bg-gray-300 animate-pulse"></div>
        <img 
          src="${posterPath}" 
          alt="${movie.title}"
          class="poster w-full h-full object-cover opacity-0 transition-opacity duration-300"
          onload="this.classList.add('opacity-100'); this.previousElementSibling.remove();"
          onerror="this.src='../img/placeholder.jpg'; this.classList.add('opacity-100'); this.previousElementSibling.remove();"
        >
        <div class="absolute top-2 right-2 p-[6px] rounded-md text-xs font-medium text-white bg-gradient-to-t from-[#194476] to-[#215DA2] flex items-center gap-1">
          <svg class="w-[10px] h-[10px]" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="1">
            <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>
          </svg>
          <span class="text-[10px] font-medium">${averageRating}</span>
        </div>
      </div>
      <div class="h-[10%]">
        <h3 class="text-sm font-semibold text-gray-700 line-clamp-1">${movie.title}</h3>
      </div>
    </div>
  `
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

  const overlay = createPanelOverlay();
  const panel = createMoviePanel();
  
  panel.appendChild(createMoviePoster(movie));
  panel.appendChild(createMovieInfo(movie));

  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      panel.classList.remove("translate-y-full");
    });
  });

}

function closeMoviePanel(){
  const modal = document.querySelector('#movie-modal');
  const panel = document.querySelector('#modal-panel');

  panel.classList.add('translate-y-full');

  setTimeout(() => {
    modal.remove();
    document.body.style.overflow = 'auto';
  }, 300);
}

function createPanelOverlay(){
  const overlay = document.createElement('div');
  overlay.id = "movie-modal";
  overlay.className = `
    fixed inset-0 z-50 
    bg-black/20 backdrop-blur-sm
    flex justify-center items-end
  `;

  return overlay;
}

function createMoviePanel(){
  const panel = document.createElement('div');
  panel.id = 'modal-panel';
  panel.className = `
    w-full h-[100%] bg-white rounded-t-2xl overflow-y-auto
    transform translate-y-full transition-transform duration-300
  `;

  return panel;
}

function createMoviePoster(movie){
  const posterPath = movie.poster_path ? BASE_IMAGE_URL + movie.poster_path : '';

  const div = document.createElement("div");
  div.className = "relative w-full overflow-hidden"; 

  div.innerHTML = `
    <div>
      <div class="skeleton absolute inset-0 bg-gray-300 animate-pulse"></div>
      <img 
        src="${posterPath}" 
        alt="${movie.title}"
        class="poster w-full h-full object-cover opacity-0 transition-opacity duration-300"
        onload="this.classList.add('opacity-100'); this.previousElementSibling.remove();"
        onerror="this.src='../img/placeholder.jpg'; this.classList.add('opacity-100'); this.previousElementSibling.remove();"
      >
    </div>

    <div class="absolute bottom-0 left-0 w-full h-1/4 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
    <div class="fixed top-0 left-0 w-full h-1/5 bg-gradient-to-b from-black to-transparent pointer-events-none"></div>

    <div class="fixed top-0 left-0 w-full px-2 py-3 text-white flex justify-between">
      <button id="close-modal">
        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
        </svg>
      </button>
      <button>
        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/>
          <circle cx="12" cy="19" r="1"/>
        </svg>
      </button>
    </div>
  `

  div.querySelector('#close-modal').addEventListener('click', (e) => {
    closeMoviePanel();
  })
  
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
      <button id="save-movie" class="py-2 px-3 rounded-lg hover:bg-gray-100 flex justify-center items-center gap-2">
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

    div.querySelector('#save-movie').addEventListener('click', async () => {
      try {
        await saveToWatchMovie(movie.id);
      } catch (error) {
        console.error("Erro ao salvar o filme:", error);
      }
    })
    div.querySelector('#rate-movie-btn').addEventListener('click', () => openRatingModal(movie));
  } else {
    div.innerHTML = `
      <button id="delete-watched-movie" class="py-2 px-3 rounded-lg hover:bg-gray-100 flex justify-center items-center gap-2">
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
    `;

    div.querySelector('#delete-watched-movie').addEventListener('click', async () => {
      await deleteWatchedMovie(movie.docId);
      location.reload();
    });
  }

  return div;
}

/*************************************************
 * ⭐ MODAL DE AVALIAÇÃO DO FILME
 *************************************************/

function openRatingModal(movie) {
  document.querySelector('#movie-action-buttons').remove();

  const reviewers = ["evandro", "tauane", "kauane"];
  const ratings = {};
  let currentReviewerIndex = 0;

  const movieHeader = document.querySelector('#movie-header');
  const movieFooter = document.querySelector('#movie-footer');

  const movieSubtitle = movieHeader.querySelector('p');
  movieSubtitle.className = 'text-[16px] font-light text-[#8C8C8C]'
  
  renderStep();

  function renderStep() {
    const reviewer = reviewers[currentReviewerIndex];
    movieSubtitle.innerHTML = capitalize(reviewer) + ' que nota você da para esse filme?'

    movieFooter.innerHTML = createStepHTML(reviewer);

    const nextBtn = movieFooter.querySelector('#next-btn');
  
    nextBtn.addEventListener('click', () => {
      const input = document.querySelector("#rating-input");
      const value = parseFloat(input.value);

      if (isNaN(value) || value < 0 || value > 10) {
        alert("Por favor, digite uma nota válida de 0 a 10.");
        return;
      }

      ratings[reviewers[currentReviewerIndex]] = value;
      currentReviewerIndex++;

      currentReviewerIndex < reviewers.length ? renderStep() : renderSummary();
    });

    initializeSlider();
  }

  function renderSummary() {
    movieHeader.className = 'text-center'
    movieSubtitle.innerHTML = 'Confira o resumo das notas:';

    const notesList = reviewers.map(r => `
      <div class="flex items-center relative">
        <img 
          src="../img/${r}.jpg" 
          class="w-12 rounded-full absolute -left-2 top-1/2 -translate-y-1/2 z-10"
        >
        <div class="w-full py-2 px-14 rounded-lg ${reviewerColors[r]}">
          <span class="text-[14px] font-bold capitalize text-white">${r}: ${ratings[r]}</span>
        </div>
      </div>
    `).join('');

    movieFooter.innerHTML = `
      <div class="max-w-50 my-8 mx-auto space-y-4">
        ${notesList}
      </div>

      <div class="flex justify-center gap-4 mt-6">
        <button id="cancel-btn" class="py-2 px-3 rounded-lg hover:bg-gray-100 flex justify-center items-center gap-2">
          <svg class="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke="currentColor">
            <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
          </svg>
          <span class="text-gray-500 font-medium">Cancelar</span>
        </button>
        <button id="save-btn" class="w-full py-2 px-3 rounded-lg text-white bg-[#0088FF] hover:bg-blue-600 disabled:opacity-50 flex justify-center items-center gap-2">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/>
            <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/><path d="M7 3v4a1 1 0 0 0 1 1h7"/>
          </svg>
          <span class="font-medium">Salvar avaliação</span>
        </button>
      </div>
    `;
    
    const saveBtn = document.querySelector('#save-btn')

    saveBtn.addEventListener('click', async () => {
      saveBtn.disabled = true; 

      try {
        await saveWatchedMovie(movie, ratings);
        location.reload();
      } catch (error) {
        console.error("Erro ao salvar o filme:", error);
      }
    });

    document.querySelector('#cancel-btn').addEventListener('click', () => {
      closeMoviePanel();
    });
  }
}

function createStepHTML(reviewer) {
  return `
    <div class="space-y-2">
      <div class="mt-8 flex items-center gap-4">
        <img 
          src="../img/${reviewer}.jpg" 
          class="w-13 rounded-full"
        >
        <div class="w-full relative">
          ${createSliderHTML()}
        </div>
      </div>

      <textarea class="w-full p-3 rounded-md border text-[14px] border-[#DEE9F8]" rows="3" placeholder="Algum comentário?"></textarea>
    </div>

    <button id="next-btn" class="block ml-auto mt-4 py-2 px-3 rounded-lg text-white bg-[#0088FF] hover:bg-blue-600 transition-all flex items-center gap-2">
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
      </svg>
      <span class="font-medium">Próximo</span>
    </button>
  `;
}

function createSliderHTML() {
  return `
    <input type="hidden" id="rating-input" name="rating-input" value="5">
    
    <div class="relative pt-8">
      <div class="absolute top-1/2 w-full h-[10px] bg-[#DEE9F8] rounded-full -translate-y-1/2"></div>
      
      <div id="progressBar" class="absolute top-1/2 h-[10px] bg-[#338CD5] rounded-l-full -translate-y-1/2 transition-all duration-150" style="width: 50%"></div>
      
      <div
        id="sliderButton"
        class="select-none cursor-pointer absolute top-1/2 w-[4px] h-[30px] text-white font-bold rounded-sm bg-[#338CD5] 
              flex items-center justify-center -translate-y-1/2 -translate-x-1/2 transition-all duration-150" 
        style="left: 50%; box-shadow: -4px 0 0 0 white, 4px 0 0 0 white;"
      >
        <span id="valueDisplay" class="absolute -top-8 py-1 px-2 rounded-md text-[14px] bg-[#338CD5]">5</span>
      </div>
    </div>
  `;
}

function initializeSlider() {
  const sliderButton = document.getElementById('sliderButton');
  const progressBar = document.getElementById('progressBar');
  const valueDisplay = document.getElementById('valueDisplay');
  const ratingInput = document.getElementById('rating-input');
  const container = sliderButton.parentElement;
  
  let isDragging = false;
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
    ratingInput.value = value;
    
    ratingInput.dispatchEvent(new Event('change', { bubbles: true }));
  }
  
  const handleMouseDown = () => isDragging = true;
  const handleMouseUp = () => isDragging = false;
  const handleMouseMove = (e) => isDragging && updateSlider(e.clientX);
  const handleTouchMove = (e) => isDragging && updateSlider(e.touches[0].clientX);
  const handleContainerClick = (e) => {
    if (e.target !== sliderButton && !sliderButton.contains(e.target)) {
      updateSlider(e.clientX);
    }
  };
  
  sliderButton.addEventListener('mousedown', handleMouseDown);
  sliderButton.addEventListener('touchstart', handleMouseDown);
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('touchmove', handleTouchMove);
  document.addEventListener('mouseup', handleMouseUp);
  document.addEventListener('touchend', handleMouseUp);
  container.addEventListener('click', handleContainerClick);
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

async function saveWatchedMovie(movie, ratings) {
  if (isAlreadyWatched(movie.id)) return;

  const ratingValues = Object.values(ratings);
  const average_rating = Number(
    (ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length).toFixed(1)
  );

  await addDoc(collection(db, "watchedMovies"), {
    id: movie.id,
    title: movie.title,
    original_title: movie.original_title,
    watched_at: new Date().toISOString(),
    ratings,
    average_rating,
    review: 'Filmaço hein!',
    created_at: new Date(),
    updated_at: new Date()
  });

  //mudar para toast notification
  alert(`🎬 O filme "${movie.title}" foi salvo com média: ${average_rating}!`); 
}

async function deleteWatchedMovie(id) {
  try {
    await deleteDoc(doc(db, "watchedMovies", id));
  } catch (err) {
    console.log(err);
  }
}

async function saveToWatchMovie(id){
  await addDoc(collection(db, "savedMovies"), {
    id: id
  });
}