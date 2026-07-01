// --- 1. DOM Elements & State ---
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const genreSelect = document.getElementById('genre-select'); 
const yearInput = document.getElementById('year-input');     
const movieGrid = document.getElementById('movie-grid');

const prevBtn = document.getElementById('prev-page');
const nextBtn = document.getElementById('next-page');
const pageIndicator = document.getElementById('page-indicator');

let currentPage = 1;
let totalPages = 1; 
let currentMoviesList = []; 

// --- 2. Event Listeners ---
searchForm.addEventListener('submit', (e) => {
    e.preventDefault(); 
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
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            totalPages = data.total_pages; 
            currentMoviesList = data.results; 
            updatePaginationUI();          
            renderMovies(currentMoviesList);
        } else {
            movieGrid.innerHTML = '<p>No movies found.</p>';
            disablePagination();
        }
        
    } catch (error) {
        console.error("Error fetching data:", error);
        movieGrid.innerHTML = '<p>Something went wrong. Please try again later.</p>';
        disablePagination();
    }
}

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

    const htmlString = movies.map((movie, index) => {
        const imagePath = movie.poster_path 
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
            : 'https://via.placeholder.com/500x750?text=No+Image';
            
        const releaseYear = movie.release_date ? movie.release_date.split('-')[0] : 'Unknown Year';

        return `
            <div class="movie-card" onclick="openModal(${index})">
                <img src="${imagePath}" alt="${movie.title} Poster">
                <div class="movie-info">
                    <h3 class="movie-title">${movie.title}</h3>
                    <p class="movie-year">${releaseYear} • ⭐ ${movie.vote_average.toFixed(1)}</p>
                </div>
            </div>
        `;
    }).join(''); 

    movieGrid.innerHTML = htmlString;
}

// --- 5. Modal Logic ---
const modal = document.getElementById('movie-modal');
const closeModalBtn = document.getElementById('close-modal');
const modalImg = document.getElementById('modal-img');
const modalTitle = document.getElementById('modal-title');
const modalMeta = document.getElementById('modal-meta');
const modalOverview = document.getElementById('modal-overview');

// Global function to open the modal
window.openModal = function(index) {
    const movie = currentMoviesList[index];
    if (!movie) return; 
    
    modalImg.src = movie.poster_path 
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
        : 'https://via.placeholder.com/500x750?text=No+Image';
        
    modalTitle.textContent = movie.title || "Title Unknown";
    
    const releaseYear = movie.release_date ? movie.release_date.split('-')[0] : 'Unknown Year';
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
    modalMeta.textContent = `${releaseYear} • ⭐ ${rating}`;
    
    modalOverview.textContent = movie.overview || "No plot overview available for this movie.";
    
    modal.classList.remove('hidden');
};

closeModalBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.add('hidden');
    }
});