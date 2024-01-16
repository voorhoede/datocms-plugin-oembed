import { fetchOEmbedData, getOEmbedProvider } from '../../lib/oembed';

const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

const htmlResponse = ({ title, data }, status: number = 200) => {
  return new Response(/* html */`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="utf-8">
        <title>${ title }</title>
    </head>
    <body>
        <div style="max-width:${ data.width ? data.width + 'px' : 'auto' }; min-height:${ data.height ? data.height + 'px' : 'auto' }">
            ${data.html}
        </div>
    </body>
    </html>
  `, {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'text/html',
    },
  });
};

export const onRequest: PagesFunction = async ({ request }) => {
	const params = Object.fromEntries(new URL(request.url).searchParams.entries()) as { url: string, [key: string]: string };
	const { url } = params;
	if (!url) {
        return htmlResponse({ title: 'Error: missing parameter', data: { html: 'Missing \'url\' parameter' }}, 400);
	}
	if (!isValidUrl(url)) {
        return htmlResponse({ title: 'Error: invalid parameter', data: { html: 'Invalid \'url\' parameter' }}, 400);
	}
    const provider = getOEmbedProvider(url);
	if (!provider) {
	  	return htmlResponse({ title: 'Error: unsupported provider', data: { html: 'No OEmbed provider available for given \'url\'' }}, 404);
	}
	const data = await fetchOEmbedData(url);
	if (!data) {
	  	return htmlResponse({ title: 'Error: provider error', data: { html: 'Error fetching OEmbed data' }}, 500);
	}
	return htmlResponse({ title: `Embed HTML for ${provider.provider_name}`, data });
}