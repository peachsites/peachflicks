export async function onRequest(context) {
    const url = new URL(context.request.url);
    const searchQuery = url.searchParams.get('q');

    if (!searchQuery) {
        return new Response(JSON.stringify({ error: "No search query provided" }), { 
            status: 400,
            headers: { "Content-Type": "application/json" }
        });
    }

    const API_KEY = context.env.TMDB_KEY;
    const tmdbUrl = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(searchQuery)}&include_adult=false`;

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
