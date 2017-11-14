var dataController = (function () {
    var Expenses = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    var Incomes = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    function calculateTotal(type) {
        var sum = 0;
        data.items[type].forEach(function (cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    }
    var data = {
        items: {
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
        addItem: function (type, desc, val) {
            var newItem, ID;
            // create new ID
            if (data.items[type].length > 0) {
                ID = data.items[type][data.items[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            // create new item based on "inc" or "exp"
            if (type === "exp") {
                newItem = new Expenses(ID, desc, val);
            } else {
                newItem = new Incomes(ID, desc, val);
            }
            // push new item to the our structure data
            data.items[type].push(newItem);
            return newItem;
        },
        deleteItem: function (type, id) {
            var ids, index;
            ids = data.items[type].map(function (cur) {
                return cur.id;
            });
            index = ids.indexOf(id);
            if (index !== -1) data.items[type].splice(index, 1);
        },
        calculateBudget: function () {
            // calculate total income and expenses
            calculateTotal("exp");
            calculateTotal("inc");
            // calculate the budget 
            data.budget = data.totals.inc - data.totals.exp;
            // calculate the percentage of income that we spent
            data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
        },
        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },
        testing: function () {
            return data.items;
        }

    };


})();










var UIController = (function () {


    var DOMstrings = {
        inputType: ".add_type",
        inputDescription: ".add_description",
        inputValue: ".add_value",
        inputBtn: ".add_item",
        incomeContainer: ".income_list",
        expenseContainer: ".expense_list",
        incomeValueLabel: ".budget_income_value",
        expensesValueLabel: ".budget_expenses_value",
        budgetLabel: ".budget",
        percentageLabel: ".percentage",
        bottomContainer: ".bottom",
    };

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        addListItem: function (obj, type) {
            var html, newHtml, element;

            // create a HTML string with placeholder text
            if (type === "inc") {
                element = DOMstrings.incomeContainer;
                html = "<div class='item' id='inc_%id%'> <div class='item_desc'>%description%</div> <div class='right'> <div class='item_val'>%value%</div> <div class='item_del'> <button class='item_del_btn'> <i class='fa fa-close'></i> </button> </div> </div> </div>";
            } else {
                element = DOMstrings.expenseContainer;
                html = "<div class='item' id='exp_%id%'> <div class='item_desc'>%description%</div> <div class='percentage'></div> <div class='right'> <div class='item_val'>%value%</div> <div class='item_del'> <button class='item_del_btn'> <i class='fa fa-close'></i> </button> </div> </div> </div>";
            }

            // replace the html placeholder with some actual data
            newHtml = html.replace("%id%", obj.id);
            newHtml = newHtml.replace("%description%", obj.description);
            newHtml = newHtml.replace("%value%", obj.value);

            // insert the html to the DOM
            document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
        },
        deleteListItem: function(idSelector){
            var el = document.getElementById(idSelector);
            el.parentNode.removeChild(el);
        },
        clearFields: function () {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + " ," + DOMstrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function (cur) {
                cur.value = "";
            });
            fieldsArr[0].focus();
        },
        getDOMstrings: function () {
            return DOMstrings;
        },
        displayBudget: function (obj) {
            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstrings.incomeValueLabel).textContent = obj.totalInc;
            document.querySelector(DOMstrings.expensesValueLabel).textContent = obj.totalExp;
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + "%";
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = "---";
            }
        },
        deleteItem: function () {
            document.querySelector(DOMstrings.deleteBtn).addEventLister;
        }
    };


})();










var appController = (function (dataCtrl, UICtrl) {


    var setupEventListeners = function () {
        var DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);
        document.addEventListener("keypress", function (e) {
            if (e.keyCode === 13 || e.which === 13) ctrlAddItem();
        });
        document.querySelector(DOM.bottomContainer).addEventListener("click", ctrlDeleteBtn);
    };

    var updateBudget = function () {
        var budget;
        // calculate the budget
        dataCtrl.calculateBudget();
        // return the budget
        budget = dataCtrl.getBudget();
        // display the budget
        UICtrl.displayBudget(budget);
    };

    var ctrlAddItem = function () {
        var input, newItem;
        input = UICtrl.getInput();
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            (function () {
                document.querySelector(".add_item").classList.toggle("clickBtn");
                setTimeout(function () {
                    document.querySelector(".add_item").classList.toggle("clickBtn");
                }, 300);
            })();
            newItem = dataCtrl.addItem(input.type, input.description, input.value);
            UICtrl.addListItem(newItem, input.type);
            UICtrl.clearFields();
            updateBudget();
        }
    };

    var ctrlDeleteBtn = function (event) {
        var itemID, splitID, type, ID;
        if(event.target.classList.contains("fa-close")){
            itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
            if (itemID) {
                splitID = itemID.split("_");
                type = splitID[0];
                ID = parseInt(splitID[1]);
            }
            dataCtrl.deleteItem(type, ID);
            UICtrl.deleteListItem(itemID);
            updateBudget();
        }
    };

    return {
        init: function () {
            setupEventListeners();
            UICtrl.displayBudget({ budget: 0, totalInc: 0, totalExp: 0, percentage: 0 });
        }
    };


})(dataController, UIController);

appController.init();