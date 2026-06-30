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

// Application State
let currentPage = 1;
let totalPages = 1; 

// --- 2. Event Listeners ---
// Main Search Submission
searchForm.addEventListener('submit', (e) => {
    e.preventDefault(); 
    currentPage = 1; // Always reset to page 1 on a brand new search
    triggerSearch();
});

// Pagination Buttons
prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        triggerSearch();
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll back up
    }
});

nextBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
        currentPage++;
        triggerSearch();
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll back up
    }
});

// Helper function to keep our logic clean
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
        // Send the query, filters, and page variable to our backend
        const url = `/movies?q=${encodeURIComponent(query)}&genre=${genre}&year=${year}&page=${page}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            totalPages = data.total_pages; // Capture max pages from TMDB
            updatePaginationUI();          // Turn buttons on/off
            renderMovies(data.results);
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

// --- Pagination UI Helpers ---
function updatePaginationUI() {
    pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
    // Disable "Previous" if we are on page 1
    prevBtn.disabled = currentPage === 1;
    // Disable "Next" if we hit the end
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

    const htmlString = movies.map(movie => {
        const imagePath = movie.poster_path 
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
            : 'https://via.placeholder.com/500x750?text=No+Image';
            
        const releaseYear = movie.release_date ? movie.release_date.split('-')[0] : 'Unknown Year';

        return `
            <div class="movie-card">
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