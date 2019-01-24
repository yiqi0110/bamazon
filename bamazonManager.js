var mysql = require("mysql");
var inquirer = require("inquirer");
const cTable = require('console.table');

// create the connection information for the sql database
var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "01fiREfiGhTer!10",
    database: "bamazondb"
});


connection.connect(function (err) {
    if (err) throw err;
    start();
});

// Start thingy
function start() {
    inquirer.prompt({
        type: "list",
        name: "what2do",
        message: "Please select your manage option.",
        choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Leave"]
    }).then(function (res) {
        if (res.what2do === "View Products for Sale") {
            products();
        } else if (res.what2do === "View Low Inventory") {
            lowInventory();
        } else if (res.what2do === "Add to Inventory") {
            addInventory();
        } else if (res.what2do === "Add New Product") {
            addProduct();
        } else if (res.what2do === "Leave") {
            leave();
        } else {
            console.log("error occured.")
        }
    });
};

function products() {
    connection.query("SELECT products.id, products.product_name, products.price, products.stock_quantity FROM products", function (err, res) {
        if (err) throw err;
        var final = [];
        for (var i = 0; i < res.length; i++) {
            final.push(res[i]);
        }
        console.table(final);
        start();
    });
}; // done

function lowInventory() {
    connection.query("SELECT products.id, products.product_name, products.price, products.stock_quantity FROM products", function (err, res) {
        if (err) throw err;
        var inStock = [];
        var danger =[];
        for (var i = 0; i < res.length; i++) {
            if (res[i].stock_quantity > 5) {
                inStock.push(res[i]);
            } else {
                danger.push(res[i]);
            }
        };
        console.log("We have enough!\n");
        console.table(inStock);
        console.log("In danger of running out of stock!\n");
        console.table(danger);
        start();
    });
}; // done

function addInventory() {
    inquirer.prompt([{
        type: "confirm",
        name: "what2do",
        message: "Would you like to add to your current inventory?"
    }]).then(function (input) {
        if (input.what2do == true) {
            // add inventory
            connection.query("SELECT products.id, products.product_name, products.stock_quantity FROM products", function (err, res) {
                if (err) throw err;
                var list = [];
                for (var i = 0; i < res.length; i++) {
                    list.push({
                        name: res[i].product_name + "(STOCK:" + res[i].stock_quantity + ")",
                        value: res[i].id
                    });
                };
                inquirer.prompt({
                    type: "list",
                    name: "item2increase",
                    message: "Please select the item you would like to increase",
                    choices: list
                }).then(function (input) {
                    // console.log(input.item2increase);   // the id
                    howMuch(input.item2increase, res[input.item2increase - 1].stock_quantity, res[input.item2increase - 1].product_name);
                });
            });
        } else {
            start();
        }
    })
}; // done

function howMuch(id, originalStock, name) { // param is the id of the product wished for increased amount
    inquirer.prompt({
        type: "text",
        name: "howmuch",
        message: "How much would you like to increase the inventory by? ",
        validate: function (value) {
            if (isNaN(value)) {
                return false;
            } else {
                return true;
            }
        }
    }).then(function (input) {
        var finalAmount = parseInt(input.howmuch) + parseInt(originalStock);
        var query = "UPDATE products SET stock_quantity = " + finalAmount + " WHERE (id = " + id + ");";
        connection.query(query, function (err, res) {
            if (err) throw err;
            console.log("\nproduct: " + name + " successfully updated by " + input.howmuch + "\nThen new inverntory amount is " + finalAmount);
        });
        start();
    });
}; // done

function addProduct() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        var productsInStoreCurrently = [];
        for (var i = 0; i < res.length; i++) {
            productsInStoreCurrently.push(res[i].product_name);
        };
        console.log(productsInStoreCurrently.length);
        inquirer.prompt([{
                type: "text",
                name: "productName",
                message: "Please input the name of the new product: ",
                validate: function(value){
                    value = value.toLowerCase();
                    if (!productsInStoreCurrently.includes(value)){
                        return true;
                    } else{
                        return false;
                    }
                }
            },
            {
                type: "text",
                name: "productDepartment",
                message: "Please input the department for the new product to be catagorized as: ",
            },
            {
                type: "text",
                name: "productPrice",
                message: "Please input the price of one of the new products: ",
            },
            {
                type: "text",
                name: "productStock",
                message: "Please input the amount of the new product your bringing into the store: ",
            },
        ]).then(function (input) {
            var name = input.productName;
            var dep = input.productDepartment;
            var price = input.productPrice;
            var stock = input.productStock;
            connection.query("INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES (?, ?, ?, ?)", [name, dep, price, stock], function (err, res) {
                if (err) throw err;
                console.log("\nYou have successfully created a new item in our database\nItem "+name+" in the "+dep+" department, with "+stock+" units and at "+price+" per item");
            });
            start();
        });
    });
};

// end thingy
function leave() {
    console.log("Thanks for what ever 'hacky' things ya did. bye now.")
    connection.end();
}
