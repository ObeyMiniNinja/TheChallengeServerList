// https://stackoverflow.com/questions/3452546/how-do-i-get-the-youtube-video-id-from-a-url
export function getYoutubeIdFromUrl(url) {
    return url.match(
        /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/,
    )?.[1] ?? '';
}

/**
 * Medal clip pages can be embedded by adding the embed query parameter.
 * Keep the existing query string (for example, an invite parameter) intact.
 */
export function getMedalEmbedUrl(video) {
    try {
        const url = new URL(video);
        if (url.hostname !== 'medal.tv' && !url.hostname.endsWith('.medal.tv')) {
            return null;
        }

        url.searchParams.set('embed', '1');
        return url.toString();
    } catch {
        return null;
    }
}

export function embed(video) {
    const medalUrl = getMedalEmbedUrl(video);
    if (medalUrl) return medalUrl;

    return `https://www.youtube.com/embed/${getYoutubeIdFromUrl(video)}`;
}

export function localize(num) {
    return num.toLocaleString(undefined, { minimumFractionDigits: 3 });
}

export function getThumbnailFromId(id) {
    return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
}

// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-an-array
export function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the last element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex],
            array[currentIndex],
        ];
    }

    return array;
}
