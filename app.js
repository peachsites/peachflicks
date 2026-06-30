// --- 1. DOM Elements ---
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const movieGrid = document.getElementById('movie-grid');

// Your TMDB API Key (We will secure this later)
const API_KEY = 96d1eab5f82aff93f784687d5552dcb8;
const BASE_URL = 'https://api.themoviedb.org/3';

// --- 2. Event Listeners ---
// Listen for the form submission (clicking the button or hitting Enter)
searchForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevents the page from refreshing
    const searchTerm = searchInput.value.trim();
    
    if (searchTerm) {
        fetchMovies(searchTerm);
    }
});

// --- 3. Fetch Logic ---
// Async function to grab data from TMDB
async function fetchMovies(query) {
    // Clear the grid and show a loading state
    movieGrid.innerHTML = '<p>Loading movies...</p>';
    
    try {
        // Construct the URL for the Search API
        const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&include_adult=false`;
        
        // Make the request and wait for the response
        const response = await fetch(url);
        const data = await response.json();
        
        // Pass the results to our rendering function
        renderMovies(data.results);
        
    } catch (error) {
        console.error("Error fetching data:", error);
        movieGrid.innerHTML = '<p>Something went wrong. Please try again later.</p>';
    }
}

// --- 4. Render Logic ---
// Function to build the HTML for each movie card
function renderMovies(movies) {
    // If no movies come back, show a friendly message
    if (movies.length === 0) {
        movieGrid.innerHTML = '<p>No movies found. Try another search!</p>';
        return;
    }

    // Map through the array of movies and create an HTML string for each
    const htmlString = movies.map(movie => {
        // Handle movies that might not have a poster image
        const imagePath = movie.poster_path 
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
            : 'https://via.placeholder.com/500x750?text=No+Image';
            
        // Extract just the year from the release_date (e.g., "2023-10-24" -> "2023")
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
    }).join(''); // Join the array of strings into one big block of HTML

    // Inject the final HTML into the grid
    movieGrid.innerHTML = htmlString;
}