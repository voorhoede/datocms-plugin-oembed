import { connect } from 'datocms-plugin-sdk';
import type { RenderFieldExtensionCtx, RenderManualFieldExtensionConfigScreenCtx } from 'datocms-plugin-sdk';
import { render } from './utils/render';
import ConfigScreen from './entrypoints/ConfigScreen';
import FieldExtensionConfigScreen from './entrypoints/FieldExtensionConfigScreen';
import FieldExtension from './entrypoints/FieldExtension';
import 'datocms-react-ui/styles.css';

const extensionId = 'oembedPlugin';

connect({
  renderConfigScreen(ctx) {
    return render(<ConfigScreen ctx={ctx} />);
  },
  manualFieldExtensions() {
    return [
      {
        id: extensionId,
        name: 'Embed',
        type: 'addon',
        fieldTypes: ['json'],
        configurable: true,
      },
    ]
  },
  renderManualFieldExtensionConfigScreen(
    _,
    ctx: RenderManualFieldExtensionConfigScreenCtx,
  ) {
    return render(<FieldExtensionConfigScreen ctx={ctx} />)
  },
  renderFieldExtension(_, ctx: RenderFieldExtensionCtx) {
    render(<FieldExtension ctx={ctx} />)
  },
});
