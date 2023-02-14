import { select, templates, classNames } from '../settings.js';
import AmountWidget from './AmountWidget.js';
import utils from '../utils.js';

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

  addToCart() {
    const thisProduct = this;
    //app.cart.add(thisProduct.readyCartProduct());
    //передайте те, що повертає thisProduct.readyCartProduct
    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct.readyCartProduct(),
      },
    });
    thisProduct.element.dispatchEvent(event);
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

export default Product;
