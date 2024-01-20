const isValidUrl = (url: string) => {
    try {
        new URL(url);
        return true;
    } catch (error) {
        return false;
    }
};

const extractOpenGraphData = (html: string) => {
    const ogPrefix = 'og:';
    const twitterPrefix = 'twitter:';

    const matches = html.match(/<meta[^>]*>/g) || [];
    const metaTags = matches.map(match => ({
        name: (match.match(/name="([^"]*)"/) || [])[1],
        property: (match.match(/property="([^"]*)"/) || [])[1],
        content: (match.match(/content="([^"]*)"/) || [])[1],
    }));

    const data = {
        title: (html.match(/<title[^>]*>([^<]*)<\/title>/) || [])[1],
        description: metaTags.find(tag => tag.name === 'description')?.content,
    } as { [key: string]: string };

    metaTags.forEach(({ name, content }) => {
        if (name?.startsWith(twitterPrefix) && content) {
            const pattern = new RegExp(`^${twitterPrefix}`);
            const key = name.replace(pattern, '');
            data[key] = content;
        }
    });

    metaTags.forEach(({ property, content }) => {
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