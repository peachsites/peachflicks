// --- 1. DOM Elements & State ---
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const genreSelect = document.getElementById('genre-select');
const yearInput = document.getElementById('year-input');
const movieGrid = document.getElementById('movie-grid');

// Pagination Elements
const prevBtn = document.getElementById('prev-page');
const nextBtn = document.getElementById('next-page');
const pageIndicator = document.getElementById('page-indicator');

// Movie Details Modal Elements
const movieModal = document.getElementById('movie-modal');
const movieModalContent = document.getElementById('movie-modal-content');
const movieModalClose = document.getElementById('movie-modal-close');

// Application State
let currentPage = 1;
let totalPages = 1;
let lastFocusedElement = null;

// --- 2. Event Listeners ---
searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    currentPage = 1;
    triggerSearch();
});

prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        triggerSearch();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

nextBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
        currentPage++;
        triggerSearch();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

movieGrid.addEventListener('click', (event) => {
    const card = event.target.closest('.movie-card');
    if (card) {
        openMovieDetails(card.dataset.movieId, card);
    }
});

movieModalClose.addEventListener('click', closeMovieModal);
movieModal.addEventListener('click', (event) => {
    if (event.target.hasAttribute('data-close-modal')) {
        closeMovieModal();
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && movieModal.classList.contains('is-open')) {
        closeMovieModal();
    }
});

function triggerSearch() {
    const searchTerm = searchInput.value.trim();
    const genreId = genreSelect.value;
    const releaseYear = yearInput.value.trim();

    if (searchTerm || genreId || releaseYear) {
        fetchMovies(searchTerm, genreId, releaseYear, currentPage);
    }
}

// --- 3. Fetch Logic ---
async function fetchMovies(query, genre, year, page) {
    movieGrid.innerHTML = '<p>Loading movies...</p>';

    try {
        const url = `/movies?q=${encodeURIComponent(query)}&genre=${genre}&year=${year}&page=${page}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Movie search failed with status ${response.status}`);
        }

        const data = await response.json();

        if (data.results && data.results.length > 0) {
            totalPages = Math.min(data.total_pages || 1, 500);
            updatePaginationUI();
            renderMovies(data.results);
        } else {
            movieGrid.innerHTML = '<p>No movies found.</p>';
            disablePagination();
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        movieGrid.innerHTML = '<p>Something went wrong. Please try again later.</p>';
        disablePagination();
    }
}

async function openMovieDetails(movieId, triggerElement) {
    if (!movieId) return;

    lastFocusedElement = triggerElement;
    movieModal.classList.add('is-open');
    movieModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    movieModalContent.innerHTML = '<p class="modal-status">Loading movie details...</p>';
    movieModalClose.focus();

    try {
        const response = await fetch(`/movie/${encodeURIComponent(movieId)}`);

        if (!response.ok) {
            throw new Error(`Movie details failed with status ${response.status}`);
        }

        const movie = await response.json();
        renderMovieDetails(movie);
    } catch (error) {
        console.error('Error fetching movie details:', error);
        movieModalContent.innerHTML = '<p class="modal-status">We could not load this movie right now. Please try again.</p>';
    }
}

function closeMovieModal() {
    movieModal.classList.remove('is-open');
    movieModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    movieModalContent.innerHTML = '<p>Loading movie details...</p>';

    if (lastFocusedElement) {
        lastFocusedElement.focus();
    }
}

// --- Pagination UI Helpers ---
function updatePaginationUI() {
    pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
}

function disablePagination() {
    pageIndicator.textContent = 'Page 1';
    prevBtn.disabled = true;
    nextBtn.disabled = true;
}

// --- 4. Render Logic ---
function renderMovies(movies) {
    if (movies.length === 0) {
        movieGrid.innerHTML = '<p>No movies found. Try another search!</p>';
        return;
    }

    movieGrid.innerHTML = movies.map((movie) => {
        const imagePath = movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : 'https://placehold.co/500x750?text=No+Image';
        const releaseYear = movie.release_date ? movie.release_date.split('-')[0] : 'Unknown Year';
        const rating = Number.isFinite(movie.vote_average) ? movie.vote_average.toFixed(1) : 'N/A';

        return `
            <button class="movie-card" type="button" data-movie-id="${movie.id}" aria-label="View details for ${escapeHtml(movie.title)}">
                <img src="${imagePath}" alt="${escapeHtml(movie.title)} poster" loading="lazy">
                <div class="movie-info">
                    <h3 class="movie-title">${escapeHtml(movie.title)}</h3>
                    <p class="movie-year">${releaseYear} • ⭐ ${rating}</p>
                    <span class="movie-card-action">View details</span>
                </div>
            </button>
        `;
    }).join('');
}

function renderMovieDetails(movie) {
    const posterPath = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : 'https://placehold.co/500x750?text=No+Image';
    const releaseDate = movie.release_date || 'Release date unavailable';
    const runtime = movie.runtime ? `${movie.runtime} minutes` : 'Runtime unavailable';
    const genres = movie.genres?.length
        ? movie.genres.map((genre) => genre.name).join(', ')
        : 'Genres unavailable';
    const rating = Number.isFinite(movie.vote_average) ? movie.vote_average.toFixed(1) : 'N/A';
    const overview = movie.overview || 'No overview is currently available for this movie.';

    movieModalContent.innerHTML = `
        <img class="movie-detail-poster" src="${posterPath}" alt="${escapeHtml(movie.title)} poster">
        <div class="movie-detail-copy">
            <p class="movie-detail-eyebrow">Movie details</p>
            <h2 id="movie-modal-title">${escapeHtml(movie.title)}</h2>
            ${movie.tagline ? `<p class="movie-detail-tagline">${escapeHtml(movie.tagline)}</p>` : ''}
            <div class="movie-detail-meta">
                <span>${escapeHtml(releaseDate)}</span>
                <span>${escapeHtml(runtime)}</span>
                <span>⭐ ${rating}/10</span>
            </div>
            <p class="movie-detail-genres">${escapeHtml(genres)}</p>
            <p class="movie-detail-overview">${escapeHtml(overview)}</p>
            ${movie.homepage ? `<a class="movie-detail-link" href="${escapeAttribute(movie.homepage)}" target="_blank" rel="noopener noreferrer">Official website</a>` : ''}
        </div>
    `;
}

function escapeHtml(value = '') {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function escapeAttribute(value = '') {
    try {
        const url = new URL(value);
        return ['http:', 'https:'].includes(url.protocol) ? escapeHtml(url.href) : '';
    } catch {
        return '';
    }
}
