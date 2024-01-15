import { RenderConfigScreenCtx } from 'datocms-plugin-sdk';
import { Canvas, ContextInspector } from 'datocms-react-ui';
import OEmbedProviders from 'oembed-providers';
import s from './styles.module.css';

type Props = {
  ctx: RenderConfigScreenCtx;
};

export default function ConfigScreen({ ctx }: Props) {
  return (
    <Canvas ctx={ctx}>
      <p>Providers:</p>
      <ul>
        {OEmbedProviders.map((provider ) => (
          <li>
            <a href={ provider.provider_url } rel="noopener noreferrer" target="_blank">
              { provider.provider_name }
            </a>
          </li>
        ))}
      </ul>
      <div className={s.inspector}>
        <ContextInspector />
      </div>
    </Canvas>
  );
}
