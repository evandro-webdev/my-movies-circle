/*************************************************
 * 🔥 FIREBASE INITIALIZATION
 *************************************************/

// Importa os módulos necessários do Firebase
import { 
  initializeApp 
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";

import { 
  getFirestore, collection, addDoc, getDocs 
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// Configuração do seu projeto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBpSXsr8ZC_BmCnaySCp42NexSrTFTzHtg",
  authDomain: "my-movie-circle.firebaseapp.com",
  projectId: "my-movie-circle",
  storageBucket: "my-movie-circle.firebasestorage.app",
  messagingSenderId: "509365004119",
  appId: "1:509365004119:web:cac637bcf57aaaef1c4012"
};

// Inicializa o Firebase e o Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


/*************************************************
 * 🎞️ FIRESTORE: BUSCA DE FILMES ASSISTIDOS
 *************************************************/

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

const watchedMoviesInfo = await Promise.all(
  watchedMovies.map(async movie => {
    const dadosTMDB = await getSingleMovie(movie.id);
    return { 
      ...movie,
      poster_path: dadosTMDB.poster_path,
      genres: dadosTMDB.genres,
      overview: dadosTMDB.overview,
      release_date: dadosTMDB.release_date
    };
  })
);


/*************************************************
 * 🧩 ELEMENTOS DO DOM
 *************************************************/

const moviesListEl = document.querySelector('#movies-list');
const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-input');


/*************************************************
 * 🚀 EXIBIÇÃO INICIAL DOS FILMES ASSISTIDOS
 *************************************************/

document.addEventListener('DOMContentLoaded', showMovies(watchedMoviesInfo, 'watchedList'));


/*************************************************
 * 🔎 BUSCA DE FILMES NO TMDB
 *************************************************/

searchForm.addEventListener('submit', e => {
  e.preventDefault();
  moviesListEl.innerHTML = ''; // Limpa resultados anteriores

  const searchTerm = searchInput.value.trim();
  if (searchTerm !== '') getMovies(searchTerm);
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
      <div class="w-full aspect-[2/3] space-y-2 overflow-hidden cursor-pointer flex flex-col">
        <div class="relative w-full h-[90%] rounded-lg overflow-hidden">
          <img 
            src="${posterPath}" 
            alt="${movie.title}" 
            class="w-full h-full object-cover transition-transform duration-500 ease-out hover:scale-110"
            onerror="this.src='../img/placeholder.jpg';"
          >
          <span class="absolute bottom-2 right-2 py-1 px-2 rounded-md text-xs font-medium text-white bg-blue-600">
            ${movie.release_date?.slice(0, 4) || '—'}
          </span>
        </div>
        <div class="h-[10%]">
          <h3 class="text-sm font-semibold text-slate-800 line-clamp-1">${movie.title}</h3>
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
  movie.tmdb_rating = movie.vote_average ? movie.vote_average : movie.tmdb_rating;
  console.log(movie);

  const movieModal = document.createElement("div");
  movieModal.className = 'fixed inset-0 w-full h-full p-6 bg-black/40 flex justify-center items-center z-50 overflow-auto';
  movieModal.id = 'movie-modal';

  const modalContent = document.createElement("div");
  modalContent.className = 'w-md p-4 space-y-2 rounded-lg bg-gray-200';
  modalContent.id = 'modal-content';

  const posterPath = movie.poster_path ? BASE_IMAGE_URL + movie.poster_path : '';

  modalContent.innerHTML = `
    <div class="relative w-full h-[90%] rounded-lg overflow-hidden">
      <img 
        src="${posterPath}" 
        alt="${movie.title}" 
        class="w-full h-full object-cover hover:scale-110 transition-transform duration-500 ease-out"
      >
      <span class="absolute bottom-2 right-2 py-2 px-3 rounded-md text-white bg-blue-600">${movie.release_date}</span>
    </div>

    <div>
      <h2 class="text-lg font-bold text-slate-900">${movie.title}</h2>
      <p class="text-sm text-slate-700 line-clamp-6">${movie.overview}</p>
    </div>

    <div class="my-4 flex flex-wrap gap-2">
      ${movie.genres.map(g => `<span class="text-xs bg-gray-300 px-2 py-1 rounded">${g.name}</span>`).join('')}
    </div>

    <span class="text-sm text-slate-600">Nota do TMDB: ${movie.tmdb_rating}</span>
  `;

  // Se já assistido → mostra notas
  if (isAlreadyWatched(movie.id)) {
    const ratingList = document.createElement('div');
    ratingList.innerHTML = `
      ${Object.entries(movie.ratings).map(([user, nota]) => `
        <div class="py-2 border-b border-gray-200 flex gap-2">
          <img src="../img/${user}.jpg" class="w-6 rounded-full">
          <span class="text-sm font-medium text-gray-700 capitalize">${user}: ${nota}</span>
        </div>
      `).join('')}
    `;
    modalContent.appendChild(ratingList);
  }

  // Se ainda não assistido → botão “Marcar como assistido”
  if (!isAlreadyWatched(movie.id)) {
    const saveMovieBtn = document.createElement('button');
    saveMovieBtn.className = 'w-full mt-6 py-2 px-3 rounded-lg text-white bg-blue-600 hover:bg-blue-700';
    saveMovieBtn.textContent = 'Marcar como assistido';
    saveMovieBtn.addEventListener('click', () => openRatingModal(movie));
    modalContent.appendChild(saveMovieBtn);
  }

  movieModal.appendChild(modalContent);

  // Fecha o modal ao clicar no fundo
  movieModal.addEventListener('click', (e) => {
    if (e.target === movieModal) movieModal.remove();
  });

  document.body.appendChild(movieModal);
}


/*************************************************
 * ⭐ MODAL DE AVALIAÇÃO DO FILME
 *************************************************/

function openRatingModal(movie) {
  const reviewers = ["evandro", "tauane", "kauane"];
  const ratings = {};
  let currentReviewerIndex = 0;

  const movieModal = document.querySelector('#movie-modal');
  const modalContent = document.querySelector('#modal-content');
  const posterPath = movie.poster_path ? BASE_IMAGE_URL + movie.poster_path : '';

  // Etapa individual de nota
  function renderStep() {
    const reviewer = reviewers[currentReviewerIndex];

    modalContent.innerHTML = `
      <div class="p-4 space-y-2 rounded-lg bg-gray-200 text-center">
        <div class="w-32 mb-4 mx-auto aspect-[2/3] rounded-lg overflow-hidden">
          <img src="${posterPath}" alt="${movie.title}" class="w-full h-full object-cover">
        </div>

        <h2 class="text-lg font-bold text-slate-900">${movie.title}</h2>
        <p class="text-sm text-slate-700">${capitalize(reviewer)}, que nota você dá?</p>

        <input 
          type="number" 
          id="rating-input" 
          min="0" 
          max="10" 
          step="0.5" 
          class="w-full border border-gray-300 rounded-lg p-2 text-center focus:ring-2 focus:ring-blue-500" 
          placeholder="Digite uma nota de 0 a 10"
        >

        <button id="next-btn" class="mt-4 px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700">
          Próximo →
        </button>
      </div>
    `;
  }

  // Tela final de resumo
  function renderSummary() {
    const ratingValues = Object.values(ratings);
    const average_rating = Number(
      (ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length).toFixed(1)
    );

    const notesList = reviewers.map(r => `
      <div class="py-2 border-b border-gray-200 flex justify-between">
        <span class="font-medium capitalize">${r}</span>
        <span>${ratings[r]}</span>
      </div>
    `).join('');

    modalContent.innerHTML = `
      <img src="${BASE_IMAGE_URL}${movie.poster_path}" alt="${movie.title}" class="rounded-lg w-full h-64 object-cover shadow-md">

      <h2 class="text-xl font-semibold mt-2">${movie.title}</h2>

      <div class="text-left mt-4 space-y-1">${notesList}</div>

      <p class="mt-3 text-lg font-bold text-blue-600">Média: ${average_rating}</p>

      <div class="flex justify-center gap-3 mt-4">
        <button id="cancel-btn" class="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400">
          Cancelar
        </button>
        <button id="save-btn" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
          Salvar filme
        </button>
      </div>
    `;

    // Eventos dos botões
    document.querySelector('#save-btn').addEventListener('click', () => {
      saveMovie(movie, ratings);
      movieModal.remove();
    });

    document.querySelector('#cancel-btn').addEventListener('click', () => {
      movieModal.remove();
    });
  }

  // Inicializa primeira etapa
  renderStep();

  // Evento "Próximo"
  modalContent.addEventListener('click', e => {
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
