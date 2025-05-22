import { html } from 'lit';
import '../repeating-image-transition.js';

export default {
  title: 'GridItem',
  component: 'grid-item',
};

const Template = ({ imgUrl, title, description }) => html`
  <grid-item
    .imgUrl=${imgUrl}
    .title=${title}
    .description=${description}
  ></grid-item>
`;

export const Default = Template.bind({});
Default.args = {
  imgUrl: 'assets/img1.webp',
  title: 'Drift — A04',
  description: 'Model: Amelia Hart',
};
