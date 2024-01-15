// import { useState, useCallback, useEffect } from 'react'
import type { RenderFieldExtensionCtx } from 'datocms-plugin-sdk';
import { Canvas } from 'datocms-react-ui';
import _get from 'lodash/get';
import { getOEmbedProvider } from '../utils/oembed';

type Props = {
  ctx: RenderFieldExtensionCtx
}
type OEmbedData = {
    url: string;
}

export default function FieldExtension({ ctx }: Props) {
    const urlFieldPath = ctx.fieldPath.replace(new RegExp(`${ctx.field.attributes.api_key}$`), ctx.parameters.urlFieldKey as string);
    const urlFieldValue = (_get(ctx.formValues, urlFieldPath) as string || '').trim();
    const dataFieldValue = _get(ctx.formValues, ctx.fieldPath) as OEmbedData || {};
    console.log({ urlFieldValue, dataFieldValue });
    if (urlFieldValue !== dataFieldValue.url) {
        const provider = getOEmbedProvider(urlFieldValue);
        console.log('provider?', provider);
    }
    return (
        <Canvas ctx={ctx}>
            <p>Field extension: { ctx.parameters.urlFieldKey as string }</p> 
        </Canvas>
    )
}