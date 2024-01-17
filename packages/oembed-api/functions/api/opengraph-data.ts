const isValidUrl = (url: string) => {
    try {
        new URL(url);
        return true;
    } catch (error) {
        return false;
    }
};

const extractOpenGraphData = (html: string) => {
    const data = {} as { [key: string]: string };
    const ogPrefix = 'og:';
    const matches = html.match(/<meta[^>]*>/g);
    if (!matches) {
        return data;
    }
    matches.forEach(match => {
        const property = (match.match(/property="([^"]*)"/) || [])[1];
        const content = (match.match(/content="([^"]*)"/) || [])[1];
        if (property?.startsWith(ogPrefix) && content) {
            const pattern = new RegExp(`^${ogPrefix}`);
            const key = property.replace(pattern, '');
            data[key] = content;
        }
    });
    return data;
}

const jsonResponse = (data: object, status: number = 200) => {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
        },
    });
};
  
export const onRequest: PagesFunction = async ({ request }) => {
    const params = Object.fromEntries(new URL(request.url).searchParams.entries()) as { url: string, [key: string]: string };
    const { url } = params;
    if (!url) {
        return jsonResponse({ error: { code: 'MISSING_PARAMETER_URL', message: 'Missing \'url\' parameter' }}, 400);
    }
    if (!isValidUrl(url)) {
        return jsonResponse({ error: { code: 'INVALID_PARAMETER_URL', message: 'Invalid \'url\' parameter' }}, 400);
    }

    const html = await fetch(url).then(res => res.text());
    if (!html) {
        return jsonResponse({ error: { code: 'PROVIDER_ERROR', message: 'Error fetching HTML' }}, 500);
    }
    const meta = extractOpenGraphData(html);
    return jsonResponse({ meta });
}