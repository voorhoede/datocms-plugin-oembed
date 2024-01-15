import { useState } from 'react'
import type { RenderFieldExtensionCtx } from 'datocms-plugin-sdk';
import { Canvas } from 'datocms-react-ui';
import _get from 'lodash/get';
import { getOEmbedProvider } from '../utils/oembed';

type Props = {
  ctx: RenderFieldExtensionCtx
}
type OEmbedData = {
    [key: string]: any
}

export default function FieldExtension({ ctx }: Props) {
    const urlFieldPath = ctx.fieldPath.replace(new RegExp(`${ctx.field.attributes.api_key}$`), ctx.parameters.urlFieldKey as string);
    const urlFieldValue = (_get(ctx.formValues, urlFieldPath) as string || '').trim();
    // const dataFieldValue = _get(ctx.formValues, ctx.fieldPath) as OEmbedData || "{}";
    // console.log({ urlFieldValue, dataFieldValue });
    const provider = urlFieldValue ? getOEmbedProvider(urlFieldValue) : null;
    const [data, setData] = useState<OEmbedData | null>(null);
    // const [error, setError] = useState<string | null>(null);
    if (provider) {
        const url = new URL('https://datocms-plugin-oembed.pages.dev/api/oembed');
        url.searchParams.set('url', urlFieldValue);
        fetch(url.toString())
            .then(res => res.json())
            .then(res => {
                if (res.data) {
                    setData(res.data)
                    ctx.setFieldValue(ctx.fieldPath, JSON.stringify(res.data, null, 2));
                }
            });
    }

    return (
        <Canvas ctx={ctx}>
            {
                provider && data && (<>
                    <details open>
                        <summary>{ provider.provider_name } preview</summary>
                        <div
                            dangerouslySetInnerHTML={{ __html: data.html }}
                            style={{
                                maxWidth: data.width ? `${data.width}px` : '100%',
                                minHeight: data.height ? `${data.height}px` : undefined,
                            }}
                        />
                    </details>
                    <details>
                        <summary>{ provider.provider_name } OEmbed data</summary>
                        <pre><code>{ JSON.stringify(data, null, 2) }</code></pre>
                    </details>
                </>)
            }
        </Canvas>
    )
}