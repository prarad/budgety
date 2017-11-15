var dataController = (function () {


    var Expenses = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expenses.prototype.calcPercentage = function (totalInc) {
        if (totalInc > 0) {
            this.percentage = Math.round((this.value / totalInc) * 100);
        }else{
            this.percentage = -1;
        }
    };

    Expenses.prototype.getPercentage = function () {
        return this.percentage;
    };

    var Incomes = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.items[type].forEach(function (cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

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
            if (data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }else{
                data.percentage = -1;
            }
        },
        calculatePercentages: function () {
            data.items.exp.forEach(function (cur) {
                cur.calcPercentage(data.totals.inc);
            });
        },
        getPercentages: function () {
            var allPerc = data.items.exp.map(function (cur) {
                return cur.getPercentage();
            });
            return allPerc;
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
        expensesPercLabel: ".item_percentage",
        bottomContainer: ".bottom",
        dateLabel: ".budget_title_date"
    };

    var formatNumber = function (num, type) {
        // num = -2222.3345
        var int, numSplit, dec;
        num = Math.abs(num);  // num -> 2222.3345
        num = num.toFixed(2); // num -> 2222.33
        numSplit = num.split("."); // numSplit -> ["2222", "33"]
        int = numSplit[0]; // int -> "2222"
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3); // int -> "2,222"
        }
        dec = numSplit[1]; // dec -> "33"
        return (type === "inc" ? "+" : "-") + " " + int + "." + dec; // return "(+ or -) 2,222.33"
    };

    var nodeListForEach = function (list, callback) {
        for (let i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
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
                html = "<div class='item' id='exp_%id%'> <div class='item_desc'>%description%</div> <div class='right'> <div class='item_val'>%value%</div><div class='item_percentage'></div> <div class='item_del'> <button class='item_del_btn'> <i class='fa fa-close'></i> </button> </div> </div> </div>";
            }
            // replace the html placeholder with some actual data
            newHtml = html.replace("%id%", obj.id);
            newHtml = newHtml.replace("%description%", obj.description);
            newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));
            // insert the html to the DOM
            document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
        },
        deleteListItem: function (idSelector) {
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
            var type;
            obj.budget > 0 ? type = "inc" : type = "exp";
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeValueLabel).textContent = formatNumber(obj.totalInc, "inc");
            document.querySelector(DOMstrings.expensesValueLabel).textContent = formatNumber(obj.totalExp, "exp");
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + "%";
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = "---";
            }
        },
        displayPercentages: function (percentages) {
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            nodeListForEach(fields, function (current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + "%";
                } else {
                    current.textContent = "---";
                }

            });
        },
        displayDate: function(){
            var now, year, month, months;
            now = new Date();
            year = now.getFullYear();
            month = now.getMonth(); // the getMonth method return a zero based number of month
            months = ["January", "Februray", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + " " + year;
        },
        deleteItem: function () {
            document.querySelector(DOMstrings.deleteBtn).addEventLister;
        },
        changedType: function () {
            var fields = document.querySelectorAll(
                DOMstrings.inputType + "," +
                DOMstrings.inputDescription + "," +
                DOMstrings.inputValue);
                nodeListForEach(fields, function(cur){
                    cur.classList.toggle("red_focus");
                });
                document.querySelector(DOMstrings.inputBtn).classList.toggle("red");
                document.querySelector(DOMstrings.inputBtn).addEventListener("click", this.click);
        },
        click : function(){
                var type = this.getInput().type;
                document.querySelector(DOMstrings.inputBtn).classList.toggle("click_" + type);
                setTimeout(function () {
                document.querySelector(DOMstrings.inputBtn).classList.toggle("click_" + type);
                }, 300);
        }
    };


})();




var appController = (function (dataCtrl, UICtrl) {

    var DOM = UICtrl.getDOMstrings();

    var setupEventListeners = function () {
        document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);
        document.addEventListener("keypress", function (e) {
            if (e.keyCode === 13 || e.which === 13) ctrlAddItem();
        });
        document.querySelector(DOM.bottomContainer).addEventListener("click", ctrlDeleteBtn);
        document.querySelector(DOM.inputType).addEventListener("change", UICtrl.changedType);
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

    var updatePercentages = function () {
        dataCtrl.calculatePercentages();
        var percentages = dataCtrl.getPercentages();
        UICtrl.displayPercentages(percentages);
    };

    var ctrlAddItem = function () {
        var input, newItem;
        input = UICtrl.getInput();
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            UICtrl.click();
            newItem = dataCtrl.addItem(input.type, input.description, input.value);
            UICtrl.addListItem(newItem, input.type);
            UICtrl.clearFields();
            updateBudget();
            updatePercentages();
        }
    };

    var ctrlDeleteBtn = function (event) {
        var itemID, splitID, type, ID;
        if (event.target.classList.contains("fa-close")) {
            itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
            if (itemID) {
                splitID = itemID.split("_");
                type = splitID[0];
                ID = parseInt(splitID[1]);
            }
            dataCtrl.deleteItem(type, ID);
            UICtrl.deleteListItem(itemID);
            updateBudget();
            updatePercentages();
        }
    };

    return {
        init: function () {
            console.log("application has started.");
            UIController.displayDate();
            setupEventListeners();
            UICtrl.displayBudget({ budget: 0, totalInc: 0, totalExp: 0, percentage: 0 });
        }
    };


})(dataController, UIController);

appController.init();