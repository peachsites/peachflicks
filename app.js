// --- 1. DOM Elements ---
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const genreSelect = document.getElementById('genre-select'); 
const yearInput = document.getElementById('year-input');     
const movieGrid = document.getElementById('movie-grid');

// --- 2. Event Listeners ---
searchForm.addEventListener('submit', (e) => {
    e.preventDefault(); 
    
    // Grab the values from all three inputs
    const searchTerm = searchInput.value.trim();
    const genreId = genreSelect.value;
    const releaseYear = yearInput.value.trim();
    
    // As long as at least ONE field has something in it, run the search
    if (searchTerm || genreId || releaseYear) {
        fetchMovies(searchTerm, genreId, releaseYear);
    }
});

// --- 3. Fetch Logic ---
async function fetchMovies(query, genre, year) {
    movieGrid.innerHTML = '<p>Loading movies...</p>';
    
    try {
        // Construct the URL to pass ALL variables to our backend
        const url = `/movies?q=${encodeURIComponent(query)}&genre=${genre}&year=${year}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.results) {
            renderMovies(data.results);
        } else {
            movieGrid.innerHTML = '<p>No movies found.</p>';
        }
        
    } catch (error) {
        console.error("Error fetching data:", error);
        movieGrid.innerHTML = '<p>Something went wrong. Please try again later.</p>';
    }
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