import OEmbedProviders from 'oembed-providers';

type OEmbedEndpoint = {
    url: string;
    schemes: string[];
    discovery: boolean;
}
type OEmbedProvider = {
    provider_name: string;
    provider_url: string;
    endpoints: OEmbedEndpoint[];
}

export function getOEmbedProvider(url: string): OEmbedProvider | null {
    for (const provider of OEmbedProviders as OEmbedProvider[]) {
        for (const endpoint of provider.endpoints) {
            if (endpoint.schemes) {
                for (const scheme of endpoint.schemes) {
                    const regex = new RegExp(scheme.replace(/\*/g, '.*'));
                    if (regex.test(url)) {
                        return provider;
                    }
                }
            } else {
                const baseUrl = new URL(url).origin;
                if (provider.provider_url === baseUrl) {
                    return provider;
                }
            }
        }
    }
    return null;
}

export function getOEmbedUrl(url: string, format = 'json'): string | null {
    for (const provider of OEmbedProviders as OEmbedProvider[]) {
        for (const endpoint of provider.endpoints) {
            if (endpoint.schemes) {
                for (const scheme of endpoint.schemes) {
                    const regex = new RegExp(scheme.replace(/\*/g, '.*'));
                    if (regex.test(url)) {
                        return endpoint.url.replaceAll('{format}', format);
                    }
                }
            } else {
                const baseUrl = new URL(url).origin;
                if (provider.provider_url === baseUrl) {
                    return endpoint.url.replaceAll('{format}', format);
                }
            }
        }
    }
    return null;
}

function decodeHtmlEntities(input: string): string {
    return input.replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&apos;/g, "'");
}

/**
 * OEmbed XML responses have a straightforward structure,
 * which doesn't require a full XML parser libary,
 * so this function uses a regex to parse the XML instead.
 * 
 * Example in:
 * <oembed>
 *   <type>photo</type>
 *   <flickr_type>photo</flickr_type>
 *   <title>Fantasy Island</title>
 *   <provider_name>Flickr</provider_name>
 *   <html>...</html>
 * </ombed>
 * 
 * Example out:
 * {
 *   type: 'photo',
 *   flickr_type: 'photo',
 *   title: 'Fantasy Island',
 *   provider_name: 'Flickr',
 *   html: '...'
 * }
 */
function naiveXmlToJSON(xml: string): any {
    const result: any = {};
    const regex = /<(\w+)>(.*?)<\/\1>/g;
    let match;
    while ((match = regex.exec(xml)) !== null) {
        const [, tag, value] = match;
        result[tag] = isNaN(Number(value)) ? value : Number(value);
    }
    if (result.html) {
        result.html = decodeHtmlEntities(result.html);
    }
    return result;
}

export async function fetchOEmbedData (url: string /*, searchParams?: URLSearchParams */) {
    const oEmbedBaseUrl = getOEmbedUrl(url);
    if (!oEmbedBaseUrl) {
        return null;
    }
    const searchParams = new URLSearchParams({});
    searchParams.append('url', url);
    const oEmbedUrl = new URL(oEmbedBaseUrl + '?' + searchParams.toString());
    const response = await fetch(oEmbedUrl, {
        headers: {
            'Accept': 'application/json, text/xml'
        }
    });

    if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType.includes('text/xml')) {
            const xml = await response.text();
            return naiveXmlToJSON(xml);
        }
        try {
            return await response.json();
        } catch(err) {
            console.log('fetchOEmbedData error', err);
            return null;
        }
    }
    return null;
}
