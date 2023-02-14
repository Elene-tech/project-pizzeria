import { settings, select } from '../settings.js';

class AmountWidget {
  constructor(element) {
    const thisWidget = this;

    thisWidget.getElements(element);
    thisWidget.initActions();
    //викликати цей метод в конструкторі під час виклику getElements
    thisWidget.setValue(settings.amountWidget.defaultValue);
  }
  getElements(element) {
    const thisWidget = this;

    thisWidget.element = element;
    thisWidget.input = thisWidget.element.querySelector('input.amount');
    thisWidget.linkDecrease =
      thisWidget.element.querySelector('a[href="#less"]');
    thisWidget.linkIncrease =
      thisWidget.element.querySelector('a[href="#more"]');
    thisWidget.setValue(thisWidget.input.value);
  }

  setValue(value) {
    const thisWidget = this;
    const newValue = parseInt(value); //змінює строку на число, "10"стає 10
    /*TODO: Add validation*/

    const {
      amountWidget: { defaultMax, defaultMin },
    } = settings;
    if (
      newValue > defaultMax ||
      newValue < defaultMin ||
      thisWidget.value === newValue ||
      isNaN(newValue)
    ) {
      thisWidget.input.value = thisWidget.value;

      return;
    }

    thisWidget.value = newValue;
    thisWidget.input.value = thisWidget.value;
    thisWidget.announce();
  }
  announce() {
    const thisWidget = this;
    const event = new CustomEvent('updated', { bubbles: true });
    thisWidget.element.dispatchEvent(event);
  }

  initActions() {
    const thisWidget = this;
    //використовуємо пусту функцію, щоб додати в аргумент функцію
    thisWidget.input.addEventListener('change', function () {
      thisWidget.setValue(thisWidget.input.value);
    });
    //додати Listener click, для якого обробник зупинить дію за замовчуванням для цієї події
    thisWidget.linkDecrease.addEventListener('click', function (event) {
      event.preventDefault();
      //і використовуватиме setValue з аргументом thisWidget.value мінус 1
      thisWidget.setValue(thisWidget.value - 1);
    });
    thisWidget.linkIncrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });
  }
}
export default AmountWidget;
