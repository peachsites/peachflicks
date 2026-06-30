export async function onRequest(context) {
    // 1. Grab all possible parameters from the frontend
    const url = new URL(context.request.url);
    const query = url.searchParams.get('q') || '';
    const genre = url.searchParams.get('genre') || '';
    const year = url.searchParams.get('year') || '';

    // 2. If the user clicked search with completely empty fields, stop here
    if (!query && !genre && !year) {
        return new Response(JSON.stringify({ error: "No search parameters provided" }), { 
            status: 400,
            headers: { "Content-Type": "application/json" }
        });
    }

    const API_KEY = context.env.TMDB_KEY;
    let tmdbUrl = '';

    // 3. THE TRAFFIC COP LOGIC
    if (query) {
        // If they typed a title, we MUST use the Search endpoint. 
        tmdbUrl = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&include_adult=false`;
        if (year) {
            tmdbUrl += `&primary_release_year=${year}`;
        }
    } else {
        // If they left the title blank and used dropdowns, use the Discover endpoint.
        tmdbUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&include_adult=false&sort_by=popularity.desc`;
        if (genre) {
            tmdbUrl += `&with_genres=${genre}`;
        }
        if (year) {
            tmdbUrl += `&primary_release_year=${year}`;
        }
    }

    // 4. Fetch the data and return it safely
    try {
        const response = await fetch(tmdbUrl);
        const data = await response.json();

        return new Response(JSON.stringify(data), {
            headers: { "Content-Type": "application/json" }
        });
        
    } catch (error) {
        return new Response(JSON.stringify({ error: "Failed to fetch from TMDB" }), { 
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}