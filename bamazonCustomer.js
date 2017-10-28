var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  // Your username
  user: "root",
  // Your password
  password: "",
  database: "bamazon"
});


connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);
  listAllProducts();
});



function listAllProducts() {
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    for (var i = 0; i < res.length; i++) {
      console.log("Product ID: " + res[i].id + " | Product Name: " + res[i].product_name + " | Price: " + res[i].price + " | Quantity: " + res[i].stock_quantity);
    }
    
    userSelection(res);

  });

}


function userSelection (res){
  var questions = [
        {
          type: 'input',
          name: 'product_id',
          message: 'Please enter the product ID you are interested in: ',
          validate: function (value) {
            var valid = !isNaN(parseFloat(value));
            if (value > res.length || value <= 0)
            {
              return "Invalid product number, please try again!"
            }
            return valid || 'Please enter a number';
          },
          filter: Number
        },
        {
          type: 'input',
          name: 'quantity',
          message: 'How many would you like to buy?',
          validate: function (value) {
            var valid = !isNaN(parseFloat(value));
            if (value <= 0)
            {
              return "Quantity must be greater than zero, please try again..."
            }
            return valid || 'Please enter a number';
          },
          filter: Number
        },
    ];

    inquirer.prompt(questions).then(function (answer) {

      var quantity = parseInt(answer.quantity);
      var product_id = parseInt(answer.product_id) - 1;


      if (quantity > res[product_id].stock_quantity){
        console.log("---------------------------------------------------------------")
        console.log("Insufficient quantity!")
        console.log("Order was not processed, we do not have that many " + res[product_id].product_name + ".")
        console.log("---------------------------------------------------------------")
        actionChoice();
      }
      else {
        var newStockQuantity = res[product_id].stock_quantity  - quantity;
        console.log("---------------------------------------------------------------")
        console.log ("Filling the order...")
        console.log("Your order cost: $" + quantity * res[product_id].price)   
        console.log("---------------------------------------------------------------") 

        connection.query(
            "UPDATE products SET ? WHERE ?",
            [
              {
                stock_quantity: newStockQuantity
              },
              {
                id: product_id+1
              }
            ],
            function(error) {
              if (error) console.log("WTF!");
              console.log("Order was processed successfully!");
              console.log("---------------------------------------------------------------")
              actionChoice();
            }
        );
      }
    });
}


function actionChoice(){

  var actionQuestion = [
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do next?',
      choices: ['Exit', 'Continue Shopping'],
      filter: function (val) {
        return val.toLowerCase();
      }
    }
  ]

  inquirer.prompt(actionQuestion).then(function (answer) {
    if (answer.action == "exit"){
      console.log("---------------------------------------------------------------")
      console.log("Thanks for shopping at Bamazon, see you next time!");
      connection.end();
    }
    else if (answer.action == "continue shopping"){
      console.log("---------------------------------------------------------------")
      listAllProducts();
    }
    else{
      console.log("Invalid selection!")
    }
  });
}

