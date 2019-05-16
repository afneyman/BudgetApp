let budgetController = (function() {

    let Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    let Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    let data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0,
            budget: 0,
            percentSpent: 0
        }
    };

    return {

        addItem: function(type, des, val) {
            let newItem, ID;


            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1; // getting the id of the last item and adding one
            } else ID = 0;
            
            // creating a new item based on type 'inc' or 'exp'

            if (type === 'exp') {

                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            
            // adding the new item to the data data structure
            data.allItems[type].push(newItem);

            return newItem;
        },

        calculateBudget: function() {
            data.totals['exp'] = 0;
            data.totals['inc'] = 0;

            // calculate total income and expenses
            data.allItems['exp'].forEach(element => {
                data.totals['exp'] += element.value;
            })

            data.allItems['inc'].forEach(element => {
                data.totals['inc'] += element.value;
            })

            // calculate the budget: income - expenses
            data.totals.budget = data.totals['inc'] - data.totals['exp'];

            // calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.totals.percentSpent = Math.round(data.totals.exp / data.totals.inc * 100);
            } else data.totals.percentSpent = -1;

        },

        getBudget: function() {
            return {
                budget: data.totals.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentSpent: data.totals.percentSpent
            }
        },

        testing: function() { console.log(data) }
    }

})();


let UIController = (function() {

    let DOMstrings = {
        inputType:'.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetContainer: '.budget__value',
        totIncContainer: '.budget__income--value',
        totExpContainer: '.budget__expenses--value',
        budgetPercent: '.budget__expenses--percentage'
    }

    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem: function(obj, type) {

            let html, newHtml, element;

            // create html string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="income-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"><div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'

            } else if (type === 'exp'){
                element = DOMstrings.expenseContainer;

                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);

            // insert html into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml)

        },

        clearFields: function() {

            let fields, fieldsArray;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            fieldsArray = Array.prototype.slice.call(fields);

            fieldsArray.forEach(function(current, index, array) {
                current.value = "";
            });

            fieldsArray[0].focus();

        },

        getDOMstrings: function() {
            return DOMstrings;
        },

        displayBudget: function(obj) {

            // displaying the budget
            if (obj.budget == 0) {
            document.querySelector(DOMstrings.budgetContainer).textContent = 0;
            }
            else if (obj.budget > 0) {
                document.querySelector(DOMstrings.budgetContainer).textContent = '+ $' + obj.budget;
            } else {
                document.querySelector(DOMstrings.budgetContainer).textContent = '- $' + Math.abs(obj.budget);
            }
            // displaying the income
            document.querySelector(DOMstrings.totIncContainer).textContent = obj.totalInc;
            // displaying the expenses
            // console.log(obj.exp);
            if (isNaN(obj.totalExp)) {
                document.querySelector(DOMstrings.totExpContainer).textContent = 0;
            }
            else {
                document.querySelector(DOMstrings.totExpContainer).textContent = obj.totalExp;
            }
            // displaying the percentage spent

            if (obj.percentSpent > 0) {
                document.querySelector(DOMstrings.budgetPercent).textContent = obj.percentSpent + '%'
            } else {
            document.querySelector(DOMstrings.budgetPercent).textContent = '---'
            }

        }
    }

})();


let controller = (function(budgetCtrl, UICtrl){

    let setupEventListeners = function() {

        let DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click',  ctrlAddItem);

        document.addEventListener('keypress', function(event) {
    
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            };
        });
    };

    let updateBudget = function() {

        // 1. calculate the budget
        budgetCtrl.calculateBudget();
        // 2. return the budget
        let budget = budgetCtrl.getBudget();
        console.log(budget);
        // 3. display the budget in the UI
        UICtrl.displayBudget(budget);
    };

    let ctrlAddItem = function () {
        let input, newItem;

        // 1, get the field input data
        input = UICtrl.getInput();

        if (input.description != "" && !isNaN(input.value) && input.value > 0)  {
        
            // 2. add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            // 3. add the new item to the UI
            UICtrl.addListItem(newItem, input.type);
            // 4. clear the fields
            UICtrl.clearFields();

            updateBudget();
        }
    };

    return {
        init: function() {
            UICtrl.displayBudget(budgetController.getBudget())
            setupEventListeners();
        }
    };

})(budgetController, UIController);

controller.init();