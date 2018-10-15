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

function restart(){
    start();
}

function start(){
    // first displays the products
    var query = "SELECT products.id, products.product_name, products.price FROM products";
    connection.query(query, function (err, res) {
        if (err) throw err;
        var final = [];
        for (var i = 0; i<res.length; i++){
            final.push(res[i]);
        }
        console.table(final);
        inquirer.prompt([{
            name: "product_id",
            type: "text",
            message: "Please select the products id you would like to purchase from: ",
            validate: function (value) {
                if (value <= res.length) return true;
            }
        }]).then(function (results) {
            var id = results.product_id;
            var price = res[id-1].price;
            product_quantity(id, price);
        })
    });
};

function product_quantity(id, price) {
    inquirer.prompt([{
        name: "product_quantity",
        type: "text",
        message: "How many units would like to purchase? "
    }]).then(function (results) {
        connection.query("SELECT products.id, products.stock_quantity FROM products", function (err, res) {
            if (err) throw err;
            var product = res[id - 1].id;
            var quantity = res[id-1].stock_quantity;            
            if (results.product_quantity <= quantity && id == product){
                console.log("Great, we have that in stock!");
                var newQuan = quantity - results.product_quantity;
                var spent = (results.product_quantity * price);
                console.log("You spent $" + spent);
                updateStore(product, newQuan);
            } else if (quantity == 0){
                console.log("We appologize for the inconvience but that item is currently out of stock.");
                keepShopping();
            } else{
                console.log("Insufficient quantity!");
                product_quantity(id, price);
            }
        });
    });
};

function updateStore(id, quantity){
    connection.query("UPDATE products SET stock_quantity = ? WHERE id = ?;", [quantity, id], function(err, res){
        if (err) throw err;
        console.log("store updated, thank you for your purchase!");
        keepShopping();
    })
};

function keepShopping(){
    inquirer.prompt([
        {
            name: "keepGoing",
            type: "confirm",
            message: "Would you like to keep shopping at Bamazon?",
        }
    ]).then(function(input){
        if (input.keepGoing != true){     // yes, continue shopping
            leave();
        } else {
            restart();
        }
    })
};

function leave(){
    console.log("Thank you for shopping at Bamazon, have a nice day!");
    connection.end();
};
