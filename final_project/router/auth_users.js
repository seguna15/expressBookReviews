const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ 
  let userssamename = users.filter(user => {
    return user.username === username;
  });
  if(userssamename.length > 0){
    return true;
  }else{
    return false;
  }
}

const authenticatedUser = (username,password)=>{ 
   let validusers = users.filter(user => {
    return (user.username === username && user.password === password);
   });
   if(validusers.length > 0){
    return true;
   }else{
    return false;
   }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if(!username || !password){
    return res.status(404).json({message: "Error logging in"});
  }

  if(authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      {
        data: password,
      },
      "access",
      { expiresIn: 60 * 60 }
    );
    req.session.authorization = {
      accessToken,username
    }
    return res.status(200).send('User successfully logged in');
  }else {
    return res.status(200).json({message: "Invalid Login. Check username and password"})
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  let sess = req.session.authorization.username;
  let isbn = req.params.isbn;
  let reviewText = req.body.review;

  if(isbn){
    const reviews = books[isbn].reviews;
    reviews[sess] = reviewText;
    res.status(200).send(reviews);
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => { 
  let username = req.session.authorization.username;
  let isbn = req.params.isbn;
  if(isbn){
    delete books[isbn].reviews[username];
  }
  res.send(`User ${username} review on book with ISBN ${isbn} successfully deleted.`);
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
