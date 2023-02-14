import { settings, select } from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';

const app = {
  initData: function () {
    const thisApp = this;
    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.products;

    fetch(url) //надсилаємо запит на вказану адресу кінцевої точки
      .then(function (rawResponse) {
        return rawResponse.json();
      })
      .then(function (parsedResponse) {
        console.log('parsedResponse', parsedResponse);
        thisApp.data.products = parsedResponse;
        /*save parsedResponse as thisApp.data.products*/
        thisApp.initMenu();
        /*execute initMenu method*/
      })
      .catch(function (error) {
        console.error(error.message);
        //alert('You have an error!');
      });

    console.log('thisApp.data', JSON.stringify(thisApp.data));
  },

  initMenu: function () {
    const thisApp = this;
    //add ititMenu function
    for (let productData in thisApp.data.products) {
      new Product(
        thisApp.data.products[productData].id,
        thisApp.data.products[productData]
      );
    }
  },

  init: function () {
    const thisApp = this;

    thisApp.initData();
    thisApp.initCart();
  },
  initCart: function () {
    const thisApp = this;
    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);
    thisApp.productList = document.querySelector(select.containerOf.menu);
    thisApp.productList.addEventListener('add-to-cart', function (event) {
      app.cart.add(event.detail.product);
    });
  },
};

app.init();
