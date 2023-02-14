import { select } from '../settings.js';
import AmountWidget from './AmountWidget.js';
class CartProduct {
  //додаємо третій аргуумент, з якого видаляємо item
  constructor(menuProduct, element, productList) {
    //конструктор повинен приймати два аргументи: menuProduct і element
    const thisCartProduct = this;
    //зберегти в (thisCartProduct)) ньому всі властивості з menuProduct.
    thisCartProduct.id = menuProduct.id;
    thisCartProduct.productList = productList;
    thisCartProduct.name = menuProduct.name;
    thisCartProduct.amount = menuProduct.amount;
    thisCartProduct.priceSingle = menuProduct.priceSingle;
    thisCartProduct.price = menuProduct.price;
    thisCartProduct.params = menuProduct.params; //додали параметри продукту
    thisCartProduct.remove = this.remove; // посилається на функцію remove  from class CartProduct
    thisCartProduct.edit = menuProduct.edit;
    thisCartProduct.getElements(element);
    thisCartProduct.initAmountWidget();
    thisCartProduct.initActions();
  }
  getElements(element) {
    const thisCartProduct = this;
    thisCartProduct.dom = {};
    thisCartProduct.dom.wrapper = element; //посилання до вихідного elementа DOM
    thisCartProduct.dom.amountWidget = element.querySelector(
      select.cartProduct.amountWidget
    );
    thisCartProduct.dom.price = element.querySelector(select.cartProduct.price);
    thisCartProduct.dom.edit = element.querySelector(select.cartProduct.edit);
    thisCartProduct.dom.remove = element.querySelector(
      select.cartProduct.remove
    );
  }
  initAmountWidget() {
    const thisCartProduct = this;
    thisCartProduct.amountWidget = new AmountWidget(
      thisCartProduct.dom.amountWidget
    );
    // повторно встановити значення для двох властивостей, які були спочатку встановлені в конструкторі
    //s – thisCartProduct.amount і thisCartProduct.price.
    thisCartProduct.dom.amountWidget.addEventListener('updated', function () {
      thisCartProduct.amount = thisCartProduct.amountWidget.value;
      thisCartProduct.price =
        thisCartProduct.amount * thisCartProduct.priceSingle;
      thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
    });
  }

  remove() {
    const thisCartProduct = this;

    const event = new CustomEvent('remove', {
      bubbles: true,
      detail: { cartProduct: thisCartProduct },
    });
    thisCartProduct.productList.dispatchEvent(event); //для передачі remove (тригер ремув) в класс Cart
  }
  initActions() {
    const thisCartProduct = this;

    thisCartProduct.dom.edit.addEventListener('click', function (event) {
      event.preventDefault();
    });

    thisCartProduct.dom.remove.addEventListener('click', function (event) {
      event.preventDefault();
      thisCartProduct.remove(); //виклакаємо функцію
    });
  }
  getData() {
    const thisCartProduct = this;
    const getDataForServer = {
      id: thisCartProduct.id,
      amount: thisCartProduct.amount,
      price: thisCartProduct.price,
      priceSingle: thisCartProduct.priceSingle,
      name: thisCartProduct.name,
      params: thisCartProduct.params, //(?)
    };
    console.log('getDataForServer', getDataForServer);
    return getDataForServer;
  }
}

export default CartProduct;
