import { select, templates } from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element) {
    //отримує посилання на контейнер, наданий у app.initBooking, як аргумент
    const thisBooking = this;
    thisBooking.renderBooking(element);
    thisBooking.initWidgets();
  }
  renderBooking(element) {
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();
    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;

    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmount = document.querySelector(
      select.booking.peopleAmount
    );
    thisBooking.dom.hoursAmount = document.querySelector(
      select.booking.hoursAmount
    );
    thisBooking.dom.datePicker = document.querySelector(
      select.widgets.datePicker.wrapper
    );
    thisBooking.dom.hourPicker = document.querySelector(
      select.widgets.hourPicker.wrapper
    );
  }
  initWidgets() {
    const thisBooking = this;
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.dom.peopleAmount.addEventListener('update', function () {});

    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.dom.hoursAmount.addEventListener('update', function () {});

    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
    // thisBooking.dom.hourPicker.addEventListener('update', function () {});

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    //thisBooking.dom.datePicker.addEventListener('update', function () {});
  }
}
export default Booking;
