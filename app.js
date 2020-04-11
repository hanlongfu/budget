// budget Controller module
const budgetController = (() => {
  //Expense constructor
  const Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };
  //Income constructor
  const Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  //create an empty object to store input data
  const data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    }
  };

  // all public methods
  return {
    addInputToData: (type, desc, val) => {
      //initialize ID
      let ID = null;
      let newItem = null;

      //create id for input data
      if (data.allItems[type].length > 0) {
        //  in preparation for item deletion
        //  [1, 2, 3, 4, 5], next ID = 6
        //  [1, 2, 4, 6, 8], next ID = 9 
        //  ID = last ID + 1
        // [data.allItems[type].length - 1] is the last item
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      //create new item to display based on 'inc' or 'exp' type
      if (type === 'exp') {
        // instance of expense constructor function
        newItem = new Expense(ID, desc, val);
      } else if (type === 'inc') {
        // instance of income constructor function
        newItem = new Income(ID, desc, val);
      }

      //push it into our data structure
      data.allItems[type].push(newItem);

      //return new element
      return newItem;
    },

    //testing code
    testing: () => {
      console.log(data);
    }
  };
})();


// UI Controller module
const UIController = (() => {
  //
  const DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list'
  };
  return {
    getInput: () => {
      return {
        // either inc - income; exp - expenses
        type: document.querySelector(DOMstrings.inputType).value,
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: document.querySelector(DOMstrings.inputValue).value
      };
    },

    //display data on the webpage
    displayInputList: (obj, type) => {
      const element = (type === 'inc') ? DOMstrings.incomeContainer : DOMstrings.expensesContainer;

      const html = (type === 'inc') ? '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>' : '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

      //replace the placeholder text with actual data
      let newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', obj.value);

      //insert HTML into the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

    clearFields: () => {
      // select the fields to be cleared
      const fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

      // a trick to convert a NodeList to an array
      // const fieldsArr = Array.prototype.slice.call(fields);

      // another way to convert a nodeList to an Array
      const fieldsArr2 = Array.from(fields);

      //clear input fields
      fieldsArr2.forEach((element) => element.value = "");

    },

    getDOMstrings: () => {
      return DOMstrings;
    }
  };
})();


// Global App Controller
// this tells other modules what to do
const appController = ((budgetCtrl, UICtrl) => {
  const setupEventListeners = () => {
    const DOM = UICtrl.getDOMstrings();

    // bind event listener to click event
    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

    // do the same thing with keypress event
    document.addEventListener('keypress', (e) => {
      if (e.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });
  };

  // add Item when button is clicked
  const ctrlAddItem = () => {
    // 1. Get the field input data
    const input = UICtrl.getInput();

    // 2. Add the item to the budget controller
    const newItem = budgetCtrl.addInputToData(input.type, input.description, input.value);

    // 3. Add the item to the UI
    UICtrl.displayInputList(newItem, input.type);

    //4. Clear the input fields
    UICtrl.clearFields();

    // 4. Calculate the budget
    // 5. Display the budget
  };

  return {
    init: () => {
      setupEventListeners();
    }
  };

})(budgetController, UIController); //pass the other two modules
appController.init();