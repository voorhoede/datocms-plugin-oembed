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

export async function fetchOEmbedData (url: string /*, searchParams?: URLSearchParams */) {
    const oEmbedBaseUrl = getOEmbedUrl(url);
    if (!oEmbedBaseUrl) {
        return null;
    }
    const searchParams = new URLSearchParams({});
    searchParams.append('url', url);
    const oEmbedUrl = new URL(oEmbedBaseUrl + '?' + searchParams.toString());
    const response = await fetch(oEmbedUrl);
    if (response.ok) {
        // const contentType = response.headers.get('content-type');
        // if (contentType.includes('text/xml')) {
        //     const xml = await response.text();
        //     // @todo:  xml to json
        // }
        try {
            return await response.json();
        } catch(err) {
            console.log('fetchOEmbedData error', err);
            return null;
        }
    }
    return null;
}
