// BUDGET CONTROLLER
var budgetController = (function () {

    /**
     * Function constructor to store the expense data
     */
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calculatePercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };

    /**
     * Function constructor to store the income data
     */
    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    /**
     * Data Structure to store the complete budget data
     */
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        /**
         * Function to add a new item to the data structure
         */
        addItem: function (type, des, val) {
            var newItem, ID;

            // Create a new ID (it should be one greater than the last id in the respective array)
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }


            // Create a new item based on 'inc' or 'exp' type
            if (type == 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type == 'inc') {
                newItem = new Income(ID, des, val);
            }

            // Push it into our data structure
            data.allItems[type].push(newItem);
            // Return the new element
            return newItem;
        },
        /**
         * Function to delete an item from the data structure
         */
        deleteItem: function (type, id) {
            var ids, index;

            ids = data.allItems[type].map(function (current) {
                return current.id;
            });

            index = ids.indexOf(id);
            // above steps to find the actual index of the id in the array

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },
        calculateBudget: function () {

            // Caluclate total income and expenses
            calculateTotal('inc');
            calculateTotal('exp');

            // calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },
        /**
         * Function to calculate the Percentage for all expenses
         */
        calculatePercentages: function () {
            data.allItems.exp.forEach(function (cur) {
                cur.calculatePercentage(data.totals.inc);
            });
        },
        /**
         * Function to return all the percentages (for all expenses) as a array
         */
        getPercentages: function () {
            var allPerc = data.allItems.exp.map(function (cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },
        /**
         * Function to retrieve Budget Values
         */
        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        testing: function () {
            console.log(data);
        }
    };

})();





// UI CONTROLLER
var UIController = (function () {

    /**
     * An object for storing all DOM references
     */
    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    /**
     * Function to format a number and return the stylized number based on 3 rules - (1.Commas, 2. plus/minus, 3. decimal places)
     */
    var formatNumber = function (num, type) {
        var numSplit, int, dec;
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //input 2310 -> output 2,310
        }
        dec = numSplit[1];

        type === 'exp' ? sign = '-' : sign = '+';

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };

    var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };
    return {
        /**
         * Function to get inputs from the input fields
         */
        getInput: function () {
            return {
                type: document.querySelector(DOMStrings.inputType).value,  // Will be either inc or exp
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },

        addListItem: function (obj, type) {
            var html, newHTML, element;

            // Create a HTML String with some placeholder text
            if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button ></div ></div ></div >';
            } else if (type === 'exp') {
                element = DOMStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div> <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div ></div >';
            }

            // Replace the placeholder text with some actual data
            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);

        },
        /**
         * Function to update UI when an item is deleted 
         */
        deleteListItem: function (selectorID) {
            var el = document.getElementById(selectorID);
            // In Js, we cannot directly delete an element(HTML), we can only remove a child
            el.parentNode.removeChild(el);
        },
        /**
         * Function to clear the input fields
         */
        clearFields: function () {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMStrings.inputDescription + ',' + DOMStrings.inputValue); // method to select multiple fields simultaineously
            fieldsArr = Array.prototype.slice.call(fields); // convert the returned list(from querySelector) to array using slice function
            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
            }); // a callback func is passed so as to perform the process on each element in array, the args of the call back fun would be current element, index and the complete array
            fieldsArr[0].focus();
        },
        /**
         * Function to update the UI with the new Budget Values
         */
        displayBudget: function (obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
        },
        /**
         * Function to update the percentages for each element in UI
         */
        displayPercentages: function (percentages) {
            var fields = document.querySelectorAll(DOMStrings.expensesPercLabel); // this returns a nodeList rather than an Array

            

            nodeListForEach(fields, function (current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },
        /**
         * Function to display the present month in the required field
         */
        displayMonth: function () {
            var now, month, months, year;

            now = new Date(); // for current date
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth(); // to extract the current month from the date object
            year = now.getFullYear(); // to extract the current year from the date object

            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;

        },
        /**
         * UI Function to highlight the input boxes as green when + is selected and red when - is selected
         */
        changedType: function () {
            var fields;
            fields = document.querySelectorAll(
                DOMStrings.inputType + ',' +
                DOMStrings.inputDescription + ',' +
                DOMStrings.inputValue
            );
            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            });
            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
        },
        /**
         * Function to access DOM strings outside of this module.
         */
        getDOMStrings: function () {
            return DOMStrings;
        }
    };

})();





// GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {

    /**
     * Initilization function for all Event Listeners 
     */
    var setupEventListeners = function () {
        // Object contains the DOM references
        var DOM = UICtrl.getDOMStrings();
        // Event listener for Add Button
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        // Event Listener for Enter KeyPress
        document.addEventListener('keypress', function (event) {
            if (event.keyCode == 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };



    /**
     * Function to Update the Budget 
     */
    var updateBudget = function () {

        // 1. Calculate the Budget
        budgetCtrl.calculateBudget();

        // 2. Return the Budget
        var budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    };

    /**
     * Function to update the percentages
     */
    var updatePercentages = function () {

        // 1. Calculate Percentages
        budgetCtrl.calculatePercentages();

        // 2. Read the percentage from Budget Controller
        var percentages = budgetCtrl.getPercentages();

        // 3. Update the UI with new percentages
        UICtrl.displayPercentages(percentages);
    };
    /**
     * Function to add a new item 
     */
    var ctrlAddItem = function () {

        var input, newItem;

        // 1. Get the field input data
        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            // 2. Add the item to the budget controller
            newItem = budgetController.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the fields
            UICtrl.clearFields();

            // 5. Calculate and Update the Budget
            updateBudget();

            // 6. Calculate and update the percentages
            updatePercentages();
        }
    };

    /**
     * Function to delete an item 
     */
    var ctrlDeleteItem = function (event) {
        var itemID, splitID;
        // to traverse the parents of the delete button and retrieve the id of the particular item(income/expense)
        itemID = (event.target.parentNode.parentNode.parentNode.parentNode.id);

        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. Delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);

            // 2. Delete the item from UI
            UICtrl.deleteListItem(itemID);

            // 3. Update and show the new Budget
            updateBudget();

            // 6. Calculate and update the percentages
            updatePercentages();
        }

    };

    return {
        /**
         * Init function to call the Initialization function from outside scope of @controller module
         */
        init: function () {
            console.log('Application has started');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };

})(budgetController, UIController);

// Calling the init function
controller.init();