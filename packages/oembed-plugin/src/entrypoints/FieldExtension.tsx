import { useEffect, useState } from 'react'
import type { RenderFieldExtensionCtx } from 'datocms-plugin-sdk';
import { Canvas } from 'datocms-react-ui';
import _get from 'lodash/get';
import { getOEmbedProvider } from '../utils/oembed';
import type { OEmbedProvider } from '../utils/oembed';

type Props = {
  ctx: RenderFieldExtensionCtx
}
type OEmbedData = {
    [key: string]: any
}

const apiUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:8788/api/oembed-data' 
    : 'https://datocms-plugin-oembed.pages.dev/api/oembed-data';

export default function FieldExtension({ ctx }: Props) {
    const urlFieldPath = ctx.fieldPath.replace(new RegExp(`${ctx.field.attributes.api_key}$`), ctx.parameters.urlFieldKey as string);
    const urlFieldValue = (_get(ctx.formValues, urlFieldPath) as string || '').trim();
    const [data, setData] = useState<OEmbedData | null>(null);
    const [provider, setProvider] = useState<OEmbedProvider | null>(null);

    useEffect(() => {
        setProvider(urlFieldValue ? getOEmbedProvider(urlFieldValue) : null);
        if (provider) {
            const url = new URL(apiUrl);
            url.searchParams.set('url', urlFieldValue);
            fetch(url.toString())
                .then(res => res.json())
                .then(res => {
                    if (res.data) {
                        // ensure every data object has a provider name and url
                        const data = {
                            provider_name: provider?.provider_name,
                            url: urlFieldValue,
                            ...res.data,
                        }
                        setData(data)
                        ctx.setFieldValue(ctx.fieldPath, JSON.stringify(data, null, 2));
                    }
                });
        }
    }, [ctx, provider, urlFieldValue]);

    return (
        <Canvas ctx={ctx}>
            {
                provider && (<>
                    <details open>
                        <summary>{ provider.provider_name } embed preview</summary>
                        { data && (
                            <div
                                dangerouslySetInnerHTML={{ __html: data.html }}
                                style={{
                                    maxWidth: data.width ? `${data.width}px` : '100%',
                                    minHeight: data.height ? `${data.height}px` : undefined,
                                }}
                            />
                        )}
                    </details>
                    <details>
                        <summary>{ provider.provider_name } embed data</summary>
                        { data && (
                            <pre><code>{ JSON.stringify(data, null, 2) }</code></pre>
                        )}
                    </details>
                </>)
            }
        </Canvas>
    )
}