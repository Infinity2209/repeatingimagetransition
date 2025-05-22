import { html } from 'lit';
import '../repeating-image-transition.js';

export default {
  title: 'RepeatingImageTransition',
  component: 'repeating-image-transition',
};

const Template = ({ isProductPage }) => html`
  <repeating-image-transition ?isProductPage=${isProductPage}></repeating-image-transition>
`;

export const Home = Template.bind({});
Home.args = {
  isProductPage: false,
};

export const Product = Template.bind({});
Product.args = {
  isProductPage: true,
};
