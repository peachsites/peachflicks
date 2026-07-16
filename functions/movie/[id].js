export async function onRequest(context) {
    const movieId = context.params.id;
    const API_KEY = context.env.TMDB_KEY;

    if (!movieId || !/^\d+$/.test(String(movieId))) {
        return jsonResponse({ error: 'A valid movie ID is required.' }, 400);
    }

    if (!API_KEY) {
        return jsonResponse({ error: 'TMDB_KEY is not configured.' }, 500);
    }

    const tmdbUrl = new URL(`https://api.themoviedb.org/3/movie/${movieId}`);
    tmdbUrl.searchParams.set('api_key', API_KEY);
    tmdbUrl.searchParams.set('language', 'en-US');

    try {
        const response = await fetch(tmdbUrl.toString());
        const data = await response.json();

        if (!response.ok) {
            return jsonResponse(
                { error: data.status_message || 'Movie details could not be loaded.' },
                response.status
            );
        }

        return jsonResponse(data, 200, {
            'Cache-Control': 'public, max-age=3600'
        });
    } catch (error) {
        console.error('TMDB movie details request failed:', error);
        return jsonResponse({ error: 'Failed to fetch movie details from TMDB.' }, 500);
    }
}

function jsonResponse(data, status = 200, extraHeaders = {}) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json',
            ...extraHeaders
        }
    });
}
