import { templates } from '../settings.js';
import utils from '../utils.js';

class Home {
  constructor(element, thisApp) {
    // додаємо thisApp другим аргументом
    const thisHome = this;

    thisHome.render(element, thisApp); // додаємо thisApp другим аргументом
  }
  render(wrapper, thisApp) {
    const thisHome = this;
    thisHome.dom = {};
    thisHome.dom.wrapper = wrapper;
    const generatedHTML = templates.homeWidget();
    const element = utils.createDOMFromHTML(generatedHTML);
    thisHome.dom.wrapper.appendChild(element);

    const order = thisHome.dom.wrapper.querySelector('a[href="#order"]');

    order.addEventListener('click', function () {
      thisApp.activatePage('order');
    });

    const booking = thisHome.dom.wrapper.querySelector('a[href="#booking"]');

    booking.addEventListener('click', function () {
      thisApp.activatePage('booking');
    });
  }
}

export default Home;
