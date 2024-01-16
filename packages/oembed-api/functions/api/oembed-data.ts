import { fetchOEmbedData, getOEmbedProvider } from '../../lib/oembed';

const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

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
	if (!getOEmbedProvider(url)) {
	  	return jsonResponse({ error: { code: 'UNSUPPORTED_PROVIDER', message: 'No OEmbed provider available for given \'url\'' }}, 404);
	}
	const data = await fetchOEmbedData(url);
	if (!data) {
	  	return jsonResponse({ error: { code: 'PROVIDER_ERROR', message: 'Error fetching OEmbed data' }}, 500);
	}
	return jsonResponse({ data });
}