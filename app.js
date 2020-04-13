/***********************************
 ***** Budget controller module
 ************************************/
const budgetController = (() => {
	//Expense constructor
	const Expense = function (id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};
	//calculate percentage for each expense
	//DO NOT Use Arrow Functions
	Expense.prototype.calcPercentage = function (totalIncome) {
		if (totalIncome > 0) {
			this.percentage = +((this.value / totalIncome) * 100).toFixed(2);
		} else {
			this.percentage = -1;
		}
	};

	Expense.prototype.getPercentage = function () {
		return this.percentage;
	};

	//Income constructor
	const Income = function (id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};

	//calculate total income and expense
	const calculateTotal = (type) => {
		//calculate totals
		let sum = 0;

		data.allItems[type].forEach((el) => (sum += el.value));

		//pass sum to existing data object
		data.totals[type] = sum;
	};

	//create an empty object to store input data
	const data = {
		allItems: {
			exp: [],
			inc: [],
		},
		totals: {
			exp: 0,
			inc: 0,
		},
		budget: 0,
		percentage: -1,
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
			if (type === "exp") {
				// instance of expense constructor function
				newItem = new Expense(ID, desc, val);
			} else if (type === "inc") {
				// instance of income constructor function
				newItem = new Income(ID, desc, val);
			}

			//push it into our data structure
			data.allItems[type].push(newItem);

			//return new element
			return newItem;
		},

		calculateBudget: () => {
			//calculate total income and expenses
			calculateTotal("exp");
			calculateTotal("inc");

			//calculate the budget: income - expenses
			data.budget = (data.totals.inc - data.totals.exp).toFixed(2);

			if (data.totals.inc > 0) {
				//calculate the percentage of income that we spent
				data.percentage = +((data.totals.exp / data.totals.inc) * 100).toFixed(
					2
				);
			} else {
				data.percentage = -1;
			}
		},

		//calculate percentage on each array element
		calculatePercentages: () => {
			data.allItems.exp.forEach((el) => el.calcPercentage(data.totals.inc));
		},

		//store the percentages in a new array
		getPercentages: () => {
			let allPercentages = data.allItems.exp.map((el) => {
				return el.getPercentage();
			});
			return allPercentages;
		},

		getBudget: () => {
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage,
			};
		},

		//deleting items from data (need type - inc/exp and unique id)
		deleteDataList: (type, id) => {
			const ids = data.allItems[type].map((curr) => curr.id);
			const index = ids.indexOf(id);

			//if index does not exist
			if (index !== -1) {
				data.allItems[type].splice(index, 1);
			}
		},
		//testing code
		testing: () => {
			console.log(data);
		},
	};
})();

/***********************************
 ***** UI controller module
 ************************************/
const UIController = (() => {
	//
	const DOMstrings = {
		inputType: ".add__type",
		inputDescription: ".add__description",
		inputValue: ".add__value",
		inputBtn: ".add__btn",
		incomeContainer: ".income__list",
		expensesContainer: ".expenses__list",
		budgetLabel: ".budget__value",
		incomeLabel: ".budget__income--value",
		expensesLabel: ".budget__expenses--value",
		percentageLabel: ".budget__expenses--percentage",
		container: ".container",
		expensesPerLabel: ".item__percentage",
		dateLabel: ".budget__title--month",
	};

	//obtain budget-related DOM elements
	const budgetDOM = {
		currBudget: document.querySelector(DOMstrings.budgetLabel),
		currIncome: document.querySelector(DOMstrings.incomeLabel),
		currExpense: document.querySelector(DOMstrings.expensesLabel),
		currPercent: document.querySelector(DOMstrings.percentageLabel),
	};

	//add a comma every three digits
	formatNumber = (num, type) => {
		num = num.toFixed(2).toString();

		//format Integers
		let formatInt = (num) => {
			const numArr = num.split("");
			for (let i = numArr.length; i > 0; i--) {
				if (i % 3 === 0 && i !== numArr.length) {
					numArr.splice(-i, 0, ",");
				}
			}
			return numArr.join("");
		};

		if (num.indexOf(".") !== -1) {
			//split into decimal and integer parts
			const numInt = num.split(".")[0];
			const numDec = num.split(".")[1];
			const numIntFormatted = formatInt(numInt);
			return (type === "exp" ? "-" : "+") + numIntFormatted + "." + numDec;
		} else {
			return (type === "exp" ? "-" : "+") + formatInt(num);
		}
	};

	//a custom forEach function for nodeList (by default nodeList doesn't have forEach)
	const nodeListForEach = (list, callback) => {
		for (let i = 0; i < list.length; i++) {
			callback(list[i], i);
		}
	};

	return {
		getInput: () => {
			return {
				// either inc - income; exp - expenses
				// .value returns a string not a number
				type: document.querySelector(DOMstrings.inputType).value,
				description: document.querySelector(DOMstrings.inputDescription).value,
				value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
			};
		},

		//display data on the webpage
		displayInputList: (obj, type) => {
			const element =
				type === "inc"
					? DOMstrings.incomeContainer
					: DOMstrings.expensesContainer;

			const html =
				type === "inc"
					? '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
					: '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

			//replace the placeholder text with actual data
			let newHtml = html.replace("%id%", obj.id);
			newHtml = newHtml.replace("%description%", obj.description);
			newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));

			//insert HTML into the DOM
			document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
		},

		// delete income or expense items from DOM UI
		deleteUIList: (selectorId) => {
			const el = document.getElementById(selectorId);
			el.parentNode.removeChild(el);
		},

		clearFields: () => {
			// select the fields to be cleared
			const fields = document.querySelectorAll(
				DOMstrings.inputDescription + ", " + DOMstrings.inputValue
			);

			// a trick to convert a NodeList to an array
			// const fieldsArr = Array.prototype.slice.call(fields);

			// another way to convert a nodeList to an Array
			const fieldsArr = Array.from(fields);

			//clear input fields
			fieldsArr.forEach((element) => (element.value = ""));

			// set the focus back to the first field
			fieldsArr[0].focus();
		},

		//display budget on UI
		displayBudget: (obj) => {
			budgetDOM.currBudget.innerText = `+ ${obj.budget}`;
			budgetDOM.currIncome.innerText = `+ ${obj.totalInc}`;
			budgetDOM.currExpense.innerText = `- ${obj.totalExp}`;
			budgetDOM.currPercent.innerText = `${obj.percentage}%`;
		},

		//
		displayPercentages: (percentages) => {
			//a nodeList of expense percentage items
			const percentageFields = document.querySelectorAll(
				DOMstrings.expensesPerLabel
			);

			//we pass a callback function into nodeListforEach
			nodeListForEach(percentageFields, (el, idx) => {
				if (percentages[idx] > 0) {
					el.textContent = `${percentages[idx]}%`;
				} else {
					el.textContent = `---`;
				}
			});
		},

		displayMonth: () => {
			let now = new Date();
			let year = now.getFullYear();
			let monthArr = [
				"January",
				"February",
				"March",
				"April",
				"May",
				"June",
				"July",
				"August",
				"September",
				"October",
				"November",
				"December",
			];
			let month = now.getMonth();
			document.querySelector(
				DOMstrings.dateLabel
			).textContent = `${monthArr[month]} ${year}`;
		},

		changedType: () => {
			let fields = document.querySelectorAll(
				DOMstrings.inputType +
					"," +
					DOMstrings.inputDescription +
					"," +
					DOMstrings.inputValue
			);

			//toggle(add/remove) red-focus class to the three elements
			nodeListForEach(fields, (el) => el.classList.toggle("red-focus"));

			document.querySelector(DOMstrings.inputBtn).classList.toggle("red");
		},

		getDOMstrings: () => {
			return DOMstrings;
		},
	};
})();

/***********************************
 ***** Global controller module
 ************************************/
const appController = ((budgetCtrl, UICtrl) => {
	// grouping all the event listeners
	const setupEventListeners = () => {
		const DOM = UICtrl.getDOMstrings();

		// bind event listener to click event
		document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);

		// do the same thing with keypress event
		document.addEventListener("keypress", (e) => {
			if (e.keyCode === 13 || event.which === 13) {
				ctrlAddItem();
			}
		});

		// we bind a delete function to the parent event of all income and
		// expense items using event delegation
		document
			.querySelector(DOM.container)
			.addEventListener("click", ctrlDeleteItem);

		document
			.querySelector(DOM.inputType)
			.addEventListener("change", UICtrl.changedType);
	};

	//update the budget
	const updateBudget = () => {
		// 1. Calculate the budget
		budgetCtrl.calculateBudget();

		// 2. Return the budget
		const budget = budgetCtrl.getBudget();

		// 3. Display the budget on the UI
		UICtrl.displayBudget(budget);
	};

	//update the percentages
	const updatePercentages = () => {
		// 1. calculate percentages
		budgetCtrl.calculatePercentages();

		// 2. Read percentages from the budget controller
		const percentages = budgetCtrl.getPercentages();

		// 3. Update the UI with the new percentages
		UICtrl.displayPercentages(percentages);
	};

	// add Item when button is clicked
	const ctrlAddItem = () => {
		// 1. Get the field input data
		const input = UICtrl.getInput();

		// check the input fieldd - no empty fields and value field must be numeric
		if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
			// 2. Add the item to the budget controller
			const newItem = budgetCtrl.addInputToData(
				input.type,
				input.description,
				input.value
			);

			// 3. Add the item to the UI
			UICtrl.displayInputList(newItem, input.type);

			//4. Clear the input fields
			UICtrl.clearFields();

			//5. Calculate and update budget
			updateBudget();

			//6. Calculate and update percentages
			updatePercentages();
		}
	};

	// delete item when button is clicked
	const ctrlDeleteItem = (e) => {
		let itemId = e.target.parentNode.parentNode.parentNode.parentNode.id;

		if (itemId) {
			// inc-1 splitted into ["inc", "-"]
			const splitId = itemId.split("-");
			const type = splitId[0];
			const Id = parseInt(splitId[1]);

			//1. delete the item from the data structure
			budgetCtrl.deleteDataList(type, Id);

			//2. delte the item from the UI
			UICtrl.deleteUIList(itemId);

			//3. update and show the new budget
			updateBudget();

			//4. Calculate and update percentages
			updatePercentages();
		}
	};

	return {
		init: () => {
			console.log("Application has started");

			UICtrl.displayMonth();
			//initialize to zero
			UICtrl.displayBudget({
				budget: 0,
				totalInc: 0,
				totalExp: 0,
				percentage: 0,
			});
			setupEventListeners();
		},
	};
})(budgetController, UIController); //pass the other two modules

appController.init();
