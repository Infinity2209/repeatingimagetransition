import { html } from 'lit';
import '../repeating-image-transition.js';

export default {
  title: 'PreviewPanel',
  component: 'preview-panel',
};

const Template = ({ imgUrl, title, description, open, panelRight }) => html`
  <preview-panel
    .imgUrl=${imgUrl}
    .title=${title}
    .description=${description}
    ?open=${open}
    ?panelRight=${panelRight}
  ></preview-panel>
`;

export const Default = Template.bind({});
Default.args = {
  imgUrl: 'assets/img1.webp',
  title: 'Drift — A04',
  description: 'Model: Amelia Hart',
  open: true,
  panelRight: false,
};
