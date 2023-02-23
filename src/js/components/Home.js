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

function initPage() {
  const order = document.querySelector('a[href="#order"]');
  console.log('order', order);
  const linkBooking = document.querySelector('.link_order');

  order.addEventListener('click', function () {
    order.classList.toggle('active');
  });

  const booking = document.querySelector('a[href="#booking"]');
  console.log('booking', booking);

  booking.addEventListener('click', function () {
    order.classList.toggle('active');
  });
}

initPage();

export default Home;
