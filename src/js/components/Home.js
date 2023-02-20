import { templates } from '../settings.js';
import utils from '../utils.js';

class Home {
  constructor(element) {
    const thisHome = this;
    thisHome.render(element);
  }
  render(wrapper) {
    const thisHome = this;
    thisHome.dom = {};
    thisHome.dom.wrapper = wrapper;

    const generatedHTML = templates.homeWidget();
    const element = utils.createDOMFromHTML(generatedHTML);
    thisHome.dom.wrapper.appendChild(element);
  }
}
export default Home;
