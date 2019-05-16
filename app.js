let budgetController = (function () {

    let Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function (totalIncome) {

        if (totalIncome > 0) this.percentage = Math.round((this.value / totalIncome) * 100);

    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }

    let Income = function (id, description, value) {
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

        addItem: function (type, des, val) {
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

        deleteItem: function (type, id) {

            let ids, index;

            ids = data.allItems[type].map(function (current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1)
            };

        },

        calculateBudget: function () {
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

        calculatePercentages: function () {

            data.allItems.exp.forEach(function (cur) {
                cur.calcPercentage(data.totals.inc);
            });

        },

        getPercentages: function () {
            let allPerc = data.allItems.exp.map(function (cur) {
                return cur.getPercentage();
            });

            return allPerc;
        },

        getBudget: function () {
            return {
                budget: data.totals.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentSpent: data.totals.percentSpent
            }
        },

        testing: function () {
            console.log(data)
        }
    }

})();


let UIController = (function () {

    let DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetContainer: '.budget__value',
        totIncContainer: '.budget__income--value',
        totExpContainer: '.budget__expenses--value',
        budgetPercent: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'

    }

    formatNumber = function (num, type) {
        let numSplit, int, dec;
        /* + or - before number
        exactly 2 decimal points
        comma separating the thousands
        */

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        dec = numSplit[1]

        return (type === 'exp' ? sign = '- ' : sign = '+ ') + int + '.' + dec;
    }


    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem: function (obj, type) {

            let html, newHtml, element;

            // create html string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"><div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'

            } else if (type === 'exp') {
                element = DOMstrings.expenseContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // insert html into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml)

        },

        deleteListItem: function (selectorID) {

            let element = document.getElementById(selectorID);

            element.parentNode.removeChild(element);
        },

        clearFields: function () {

            let fields, fieldsArray;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            fieldsArray = Array.prototype.slice.call(fields);

            fieldsArray.forEach(function (current, index, array) {
                current.value = "";
            });

            fieldsArray[0].focus();

        },

        getDOMstrings: function () {
            return DOMstrings;
        },

        displayBudget: function (obj) {
            let type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            // displaying the budget
            if (obj.budget == 0) {
                document.querySelector(DOMstrings.budgetContainer).textContent = formatNumber(obj.budget, type);
            } else if (obj.budget > 0) {
                document.querySelector(DOMstrings.budgetContainer).textContent = formatNumber(obj.budget, type);
            } else {
                document.querySelector(DOMstrings.budgetContainer).textContent = formatNumber(obj.budget, type);
            }
            // displaying the income
            document.querySelector(DOMstrings.totIncContainer).textContent = formatNumber(obj.totalInc, 'inc');
            // displaying the expenses
            // console.log(obj.exp);
            if (isNaN(obj.totalExp)) {
                document.querySelector(DOMstrings.totExpContainer).textContent = formatNumber(0, 'exp');
            } else {
                document.querySelector(DOMstrings.totExpContainer).textContent = formatNumber(obj.totalExp, 'exp');
            }
            // displaying the percentage spent

            if (obj.percentSpent > 0) {
                document.querySelector(DOMstrings.budgetPercent).textContent = obj.percentSpent + '%'
            } else {
                document.querySelector(DOMstrings.budgetPercent).textContent = '---'
            }

        },

        displayPercentages: function (percentages) {

            let fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            let nodeListForEach = function (list, callback) {
                for (let i = 0; i < list.length; i++) {
                    callback(list[i], i);
                }
            }
            nodeListForEach(fields, function (current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---'
                }
            });

        },

        displayMonth: function () {
            let now, year, month;

            now = new Date();

            year = now.getFullYear();

            document.querySelector(DOMstrings.dateLabel).textContent = year;

            month = now.getMonth();

            console.log(now, year, month);

        }
    }

})();


let controller = (function (budgetCtrl, UICtrl) {

    let setupEventListeners = function () {

        let DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {

            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            };
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    };

    let updateBudget = function () {

        // 1. calculate the budget
        budgetCtrl.calculateBudget();
        // 2. return the budget
        let budget = budgetCtrl.getBudget();
        console.log(budget);
        // 3. display the budget in the UI
        UICtrl.displayBudget(budget);
    };

    let updatePercentages = function () {
        // 1. calculate percentages
        budgetCtrl.calculatePercentages();
        // 2. read percentages from the budget controller
        let percentages = budgetCtrl.getPercentages();
        // 3. update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
    };

    let ctrlAddItem = function () {
        let input, newItem;

        // 1, get the field input data
        input = UICtrl.getInput();

        if (input.description != "" && !isNaN(input.value) && input.value > 0) {

            // 2. add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            // 3. add the new item to the UI
            UICtrl.addListItem(newItem, input.type);
            // 4. clear the fields
            UICtrl.clearFields();
            // 5. calculate and update budget
            updateBudget();
            // calculate and update percentages
            updatePercentages();
        }
    };

    let ctrlDeleteItem = function (event) {
        let itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {

            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);
            // 2. delete the item from the UI
            UICtrl.deleteListItem(itemID);
            // 3. update and show the budget
            updateBudget();

            updatePercentages();

        }

    }

    return {
        init: function () {
            UICtrl.displayBudget(budgetController.getBudget())
            setupEventListeners();
            UICtrl.displayMonth();
        }
    };

})(budgetController, UIController);

controller.init();