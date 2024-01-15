import { useState } from 'react';
import type { RenderManualFieldExtensionConfigScreenCtx } from 'datocms-plugin-sdk';
import {
  Canvas,
  Form,
  TextField,
} from 'datocms-react-ui';

type Props = {
  ctx: RenderManualFieldExtensionConfigScreenCtx
}

export default function FieldExtensionConfigScreen({ ctx }: Props) {
  const { parameters } = ctx;
  const [urlFieldKey, setUrlFieldKey] = useState<string>(parameters?.urlFieldKey as string || '');
  const onUrlFieldKeyChange = (newValue: string) => {
    setUrlFieldKey(newValue);
    ctx.setParameters({ ...parameters, urlFieldKey: newValue });
  }

  return (
    <Canvas ctx={ctx}>
      <Form>
        <TextField
            label="URL field (API key)"
            id="urlFieldKey"
            name="urlFieldKey"
            value={urlFieldKey}
            onChange={ onUrlFieldKeyChange }
        />
      </Form>
    </Canvas>
  )
}