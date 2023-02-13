/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  ('use strict');

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice:
        '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      totalPriceTitle: '.cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
    db: {
      url: '//localhost:3131',
      products: 'products',
      orders: 'orders',
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(
      document.querySelector(select.templateOf.menuProduct).innerHTML
    ),
    // CODE ADDED START
    cartProduct: Handlebars.compile(
      document.querySelector(select.templateOf.cartProduct).innerHTML
    ),
    // CODE ADDED END
  };

  class Product {
    constructor(id, data) {
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      //у Product викличте цей метод безпосередньо перед викликом processOrder
      thisProduct.initAmountWidget();

      thisProduct.processOrder();
    }
    renderInMenu() {
      const thisProduct = this;
      /*generate HTML based on template*/
      const generatedHTML = templates.menuProduct(thisProduct.data);
      /*create element using utils.createElementFromHTML*/
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      /*find menu container*/
      const menuContainer = document.querySelector(select.containerOf.menu);
      /*add element to menu*/
      menuContainer.appendChild(thisProduct.element);
    }
    getElements() {
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(
        select.menuProduct.clickable
      );
      thisProduct.form = thisProduct.element.querySelector(
        select.menuProduct.form
      );
      thisProduct.formInputs = thisProduct.form.querySelectorAll(
        select.all.formInputs
      );
      thisProduct.cartButton = thisProduct.element.querySelector(
        select.menuProduct.cartButton
      );
      thisProduct.priceElem = thisProduct.element.querySelector(
        select.menuProduct.priceElem
      );
      thisProduct.imageWrapper = thisProduct.element.querySelector(
        select.menuProduct.imageWrapper
      );
      //додайте нову властивість thisProduct.amountWidgetElem. Переконайтеся, що його значення є посиланням на element з select.menuProduct.amountWidget.
      //Не забудьте шукати його в div окремого продукту(?)
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(
        select.menuProduct.amountWidget
      );
    }

    initAccordion() {
      const thisProduct = this;
      //   /* find the clickable trigger (the element that should react to clicking) */
      // const clickableTrigger = thisProduct.element.querySelector(
      //   select.menuProduct.clickable
      // );
      //   /* START: add event listener to clickable trigger on event click */
      thisProduct.accordionTrigger.addEventListener('click', function (event) {
        event.preventDefault();
        /* prevent default action for event */
        const activeProduct = document.querySelector(
          select.all.menuProductsActive
          /* find active product (product that has active class) */
        );

        if (activeProduct !== thisProduct.element && activeProduct !== null) {
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
        }
        /* if there is active product and it's not thisProduct.element, remove class active from it */
        thisProduct.element.classList.toggle(
          classNames.menuProduct.wrapperActive
        );
        /* toggle active class on thisProduct.element */
      });
    }
    initOrderForm() {
      const thisProduct = this;
      thisProduct.form.addEventListener('submit', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });

      for (let input of thisProduct.formInputs) {
        input.addEventListener('change', function () {
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }
    initAmountWidget() {
      const thisProduct = this;
      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

      thisProduct.amountWidgetElem.addEventListener('updated', function () {
        thisProduct.processOrder(); //додати просту анонімну функцію, яка подбає про запуск thisProduct.processOrder();
      });
    }

    processOrder() {
      const thisProduct = this;
      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);

      // set price to default price
      let price = thisProduct.data.price;

      // for every category (param)...
      for (let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];

        // for every option in this category
        for (let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];

          //check if formData parameter has a value and if there`s a name of an option
          const chosenOption =
            formData[paramId] && formData[paramId].includes(optionId);
          // check if the option is not a default
          if (chosenOption) {
            if (!option.default) {
              //якщо значення не дефолтна
              price += option.price;
            }
          } else {
            if (option.default) {
              //не вибрана дефолтна опція
              price -= option.price;
            }
          }

          const optionImage = thisProduct.imageWrapper.querySelector(
            '.' + paramId + '-' + optionId
          );

          if (optionImage) {
            if (chosenOption) {
              optionImage.classList.add(classNames.menuProduct.imageVisible);
            } else {
              optionImage.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        }
      }

      thisProduct.priceSingle = price;
      price *= thisProduct.amountWidget.value;
      //додайте оператор, який надає priceSingle нову властивістьthisProduct.
      // Призначте його значенням тієї ж ціни, що ми також записали в HTML
      thisProduct.priceElem.innerHTML = price;
    }

    //в Product, додайте новий initAmountWidget

    //У Product також додайте новий метод
    addToCart() {
      const thisProduct = this;
      app.cart.add(thisProduct.readyCartProduct());
      //передайте те, що повертає thisProduct.readyCartProduct
    }

    readyCartProduct() {
      const thisProduct = this;

      const productSummary = {
        id: thisProduct.id,
        name: thisProduct.data.name,
        amount: thisProduct.amountWidget.value,
        priceSingle: thisProduct.priceSingle,
        price: thisProduct.priceSingle * thisProduct.amountWidget.value,
        params: thisProduct.readyCartProductParams(),
      };
      return productSummary;
    }

    readyCartProductParams() {
      //prepareCartProductParams- така назва в інструкції
      const thisProduct = this;
      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);

      const params = {};
      //for every ctegory(param)
      for (let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        //create category param in params const eg. params = { ingredients: { name: 'Ingredients', options: {}}}
        params[paramId] = {
          label: param.label,
          options: {},
        };

        // for every option in this category
        for (let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];

          //check if formData parameter has a value and if there`s a name of an option
          const chosenOption =
            formData[paramId] && formData[paramId].includes(optionId);
          if (chosenOption) {
            params[paramId].options[optionId] = option.label;
          }
        }
      }
      return params;
    }
  }

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
      thisWidget.input = thisWidget.element.querySelector(
        select.widgets.amount.input
      );
      thisWidget.linkDecrease = thisWidget.element.querySelector(
        select.widgets.amount.linkDecrease
      );
      thisWidget.linkIncrease = thisWidget.element.querySelector(
        select.widgets.amount.linkIncrease
      );
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

  class Cart {
    constructor(element) {
      const thisCart = this;

      thisCart.products = []; // products вже існує в нашому класі кошика
      thisCart.getElements(element);
      thisCart.initActions();
      //thisCart.remove();
    }

    getElements(element) {
      const thisCart = this;
      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = element.querySelector(
        select.cart.toggleTrigger
      );
      thisCart.dom.productList = element.querySelector(select.cart.productList);
      thisCart.dom.deliveryFee = element.querySelector(select.cart.deliveryFee);
      thisCart.dom.subtotalPrice = element.querySelector(
        select.cart.subtotalPrice
      );
      thisCart.dom.totalPrice = element.querySelector(select.cart.totalPrice);
      thisCart.dom.totalNumber = element.querySelector(select.cart.totalNumber);
      thisCart.dom.totalPriceTitle = element.querySelector(
        select.cart.totalPriceTitle
      );
      thisCart.dom.cartProductRemove = element.querySelector(
        select.cartProduct.remove
      );
      thisCart.dom.cartProductEdit = element.querySelector(
        select.cartProduct.edit
      );
      thisCart.dom.form = element.querySelector(select.cart.form);
      thisCart.dom.formSubmit = element.querySelector(select.cart.formSubmit);
      thisCart.dom.phone = element.querySelector(select.cart.phone);
      thisCart.dom.address = element.querySelector(select.cart.address);
    }
    initActions() {
      const thisCart = this;
      thisCart.dom.toggleTrigger.addEventListener('click', function (event) {
        event.preventDefault(); //Обробником цього listener є перемикання класу,
        //збереженого в classNames.cart.wrapperActive для thisCart.dom.wrapper.
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
      thisCart.dom.productList.addEventListener('updated', function () {
        thisCart.update();
      });
      thisCart.dom.productList.addEventListener('remove', function (event) {
        thisCart.remove(event.detail.cartProduct);
      });
      thisCart.dom.form.addEventListener('submit', function (event) {
        event.preventDefault();
        thisCart.sendOrder();
      });
    }

    add(menuProduct) {
      //productList?
      const thisCart = this;

      /*generate HTML based on template*/
      const generatedHTML = templates.cartProduct(menuProduct);

      //Потім замініть цей код elementом DOM і збережіть його в наступній константі, generatedDOM.
      /*create element using utils.createElementFromHTML*/
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);

      /*find cart container*/
      // let cartContainer = document.querySelector(select.containerOf.cart);

      /*add element to */
      thisCart.dom.productList.appendChild(generatedDOM);
      //thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
      //передаємо ProductListб щоб потім викликати remove
      thisCart.products.push(
        new CartProduct(menuProduct, generatedDOM, thisCart.dom.productList)
      );
      thisCart.update();
    }
    update() {
      const thisCart = this;
      let deliveryFee = 0;
      let totalNumber = 0; //для загальної кількості товарів
      let subtotalPrice = 0; //загальна ціна за все
      let totalPrice = 0;

      for (let product of thisCart.products) {
        //додайте for...of,який буде проходити через thisCart.products.
        totalNumber += product.amount; //це збільшує totalNumber на кількість elementів даного продукту
        subtotalPrice += product.price; //збільшиться subtotalPrice на його загальну ціну ( price)
      }
      if (totalNumber) {
        deliveryFee = settings.cart.defaultDeliveryFee;
        totalPrice = subtotalPrice + deliveryFee;
      }
      thisCart.dom.deliveryFee.innerHTML = deliveryFee;
      thisCart.dom.totalNumber.innerHTML = totalNumber;
      thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
      thisCart.dom.totalPriceTitle.innerHTML = totalPrice;
      thisCart.dom.totalPrice.innerHTML = totalPrice;
    }
    remove(cartProduct) {
      const thisCart = this;
      let indexProduct = thisCart.products.indexOf(cartProduct);
      if (indexProduct !== -1) {
        thisCart.products.splice(
          indexProduct, //знаходимо індекс продукту серед усих продуктів
          1 //скільки елементів треба вирізати
        );
        cartProduct.dom.wrapper.remove(); //видаляємо з html
        thisCart.update(); //оновлюємо саму корзину
      }
      //звертаємось до корзини, до продуктів, вирізаємо(splice) продукт()
    }
    sendOrder() {
      const thisCart = this;
      const url = settings.db.url + '/' + settings.db.orders;
      const payload = {
        address: thisCart.dom.address.value,
        phone: thisCart.dom.phone.value,
        totalPrice: thisCart.totalPrice,
        subtotalPrice: thisCart.subtotalPrice,
        totalNumber: thisCart.totalNumber,
        deliveryFee: settings.cart.defaultDeliveryFee,
        products: [],
      };
      console.log('payload', payload);
      for (let prod of thisCart.products) {
        payload.products.push(prod.getData());
      }

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      };

      fetch(url, options)
        .then(function (response) {
          return response.json();
        })
        .then(function (parsedResponse) {
          console.log('parsedResponse', parsedResponse);
        });
    }
  }

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
      thisCartProduct.dom.price = element.querySelector(
        select.cartProduct.price
      );
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
      thisApp.cart = new Cart(cartElem); //за межами app ми можемо викликати його за допомогою app.cart
    },
  };

  app.init();
}
