export async function onRequest(context) {
    // 1. Get the search query the user typed in the frontend
    const url = new URL(context.request.url);
    const searchQuery = url.searchParams.get('q');

    if (!searchQuery) {
        return new Response(JSON.stringify({ error: "No search query provided" }), { 
            status: 400,
            headers: { "Content-Type": "application/json" }
        });
    }

    // 2. Grab your hidden API key from the Cloudflare Environment Variables
    const API_KEY = context.env.TMDB_KEY;

    // 3. Build the secure URL to talk to TMDB
    const tmdbUrl = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(searchQuery)}&include_adult=false`;

    try {
        // 4. Ask TMDB for the movies
        const response = await fetch(tmdbUrl);
        const data = await response.json();

        // 5. Send the data safely back to our frontend app.js
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