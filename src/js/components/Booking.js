import { select, templates } from '../settings.js';
import AmountWidget from './AmountWidget.js';
import utils from '../utils.js';

class Booking {
  constructor(bookingWidget) {
    //отримує посилання на контейнер, наданий у app.initBooking, як аргумент
    const thisBooking = this;
    thisBooking.bookingWidget = bookingWidget;

    thisBooking.renderBooking();
    thisBooking.initWidgets();
  }
  renderBooking() {
    const thisBooking = this;
    const bookingWidget = document.querySelector(select.containerOf.booking);
    console.log('bookingWidget', bookingWidget);
    const generatedHTML = templates.bookingWidget(thisBooking.bookingWidget);
    console.log('generatedHTML', generatedHTML);
    thisBooking.dom = {};
    thisBooking.dom.wrapper = bookingWidget;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
  }
  initWidgets() {}
}
export default Booking;
