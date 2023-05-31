const express = require("express");
const app = express();
const port = 3000;
const mysql = require("./connection").con;
const { v4: uuidv4 } = require("uuid");
var session = require("express-session");
var flash = require("connect-flash");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { body, validationResult } = require("express-validator");
// functions
function generateUniqueId() {
  let uniqueId = uuidv4().replace(/-/g, "");
  uniqueId = uniqueId.slice(0, 6);
  return uniqueId;
}
function setAuthenticationStatus(req, res, next) {
  const token = req.cookies.token;

  if (token) {
    try {
      const decoded = jwt.verify(token, "keyboard cat");
      res.locals.isAuthenticated = true;
      res.locals.user = { email: decoded.email };
    } catch (error) {
      res.locals.isAuthenticated = false;
    }
  } else {
    res.locals.isAuthenticated = false;
  }

  next();
}

function verifyToken(req, res, next) {
  const token = req.cookies.token;
  if (token) {
    jwt.verify(token, "keyboard cat", (error, decodedToken) => {
      if (error) {
        console.error("Error verifying token:", error);
        res.redirect("/login");
      } else {
        req.user = decodedToken;
        next();
      }
    });
  } else {
    res.redirect("/login");
  }
}

// configuration
app.set("view engine", "hbs");
app.set("views", "./view");
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 60000 },
  })
);
app.use(flash());
app.use(setAuthenticationStatus);

app.get("/register", (req, res) => {
  const serverError = req.flash("server-error")[0];
  const serverSuccess = req.flash("server-success")[0];
  const emailError = req.flash("emailError")[0];

  res.render("register", { serverSuccess, serverError, emailError });
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  const id = generateUniqueId();
  const queryCheckUser = "SELECT * FROM `users` WHERE `email` = ?";
  const queryInsertUser =
    "INSERT INTO `users` (`id`, `email`, `password`) VALUES (?, ?, ?)";
  const valuesCheckUser = [email];
  const valuesInsertUser = [id, email, password];

  mysql.query(queryCheckUser, valuesCheckUser, (error, results) => {
    if (error) {
      console.error("Error checking user:", error);
      req.flash("server-error", "Failed to register user");
      res.redirect("/register");
    } else {
      if (results.length > 0) {
        req.flash("emailError", "User already exists");
        res.redirect("/register");
      } else {
        mysql.query(queryInsertUser, valuesInsertUser, (error, results) => {
          if (error) {
            console.error("Error registering user:", error);
            req.flash("server-error", "Failed to register user");
            res.redirect("/register");
          } else {
            req.flash("server-success", "User registered successfully");
            const token = jwt.sign({ email: email }, "keyboard cat");
            res.cookie("token", token);
            res.redirect("/");
          }
        });
      }
    }
  });
});

// User login
app.get("/login", (req, res) => {
  const serverError = req.flash("server-error")[0];
  const passwordError = req.flash("passwordError")[0];
  const emailError = req.flash("emailError")[0];
  const emailValue = req.flash("emailValue")[0];

  res.render("login", { serverError, passwordError, emailError, emailValue });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const query = "SELECT * FROM users WHERE email = ?";

  mysql.query(query, [email], (error, results) => {
    if (error) {
      console.error("Error executing the query:", error);
      req.flash("server-error", "Failed to log in");
      res.redirect("/login");
    } else {
      if (results.length > 0) {
        const user = results[0];
        if (password === user.password) {
          req.flash("server-success", "Login successful");
          const token = jwt.sign({ email: email }, "keyboard cat");
          res.cookie("token", token);
          res.redirect("/");
        } else {
          req.flash("passwordError", "Incorrect password");
          req.flash("emailValue", email);
          res.redirect("/login");
        }
      } else {
        req.flash("emailError", "User does not exist");
        res.redirect("/login");
      }
    }
  });
});

//logout
app.get("/logout", (req, res) => {
  res.clearCookie("token");
  req.flash("success", "You have been successfully logged out.");
  res.redirect("/login");
});

app.get("/", (req, res) => {
  const serverError = req.flash("server-error")[0];
  const serverSuccess = req.flash("server-success")[0];
  const query =
    "SELECT books.*, author.name AS authorName FROM books JOIN author ON books.author = author.id";

  mysql.query(query, (err, results) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Error executing the query" });
      return;
    }

    res.render("home", { books: results, serverSuccess, serverError });
  });
});

// books page
app.get("/books", (req, res) => {
  const serverError = req.flash("server-error")[0];
  const serverSuccess = req.flash("server-success")[0];
  const booksQuery = "SELECT * FROM books";

  mysql.query(booksQuery, (err, booksResults) => {
    if (err) {
      console.error("Error executing the books query:", err);
      res.status(500).json({ error: "Error executing the query" });
      return;
    }

    res.render("books", { books: booksResults, serverSuccess, serverError });
  });
});

// Add Book
app.get("/books/add", verifyToken, (req, res) => {
  const query = "SELECT * FROM author";
  mysql.query(query, (err, results) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Error executing the query" });
      return;
    }
    const author = results;
    res.render("addBook", {
      author: results,
      isAuthenticated: req.isAuthenticated,
    });
  });
});

app.post("/book/add", (req, res) => {
  const { title, author, pages, prize, info } = req.body;
  const id = generateUniqueId();

  const queryCheckDuplicate =
    "SELECT COUNT(*) AS count FROM books WHERE title = ? AND author = ?";
  const valuesCheckDuplicate = [title, author];
  mysql.query(queryCheckDuplicate, valuesCheckDuplicate, (err, result) => {
    if (err) {
      const errorMessage = "Error executing the query";
      console.error("Error executing the query:", err);
      req.flash("server-error", errorMessage);
      res.redirect("/books/add");
    } else {
      const count = result[0].count;
      if (count > 0) {
        const errorMessage = "This book already exists in the database";
        req.flash("server-error", errorMessage);
        res.redirect("/books/add");
      } else {
        const query =
          "INSERT INTO books (title, author, pages, prize, info, id) VALUES (?, ?, ?, ?, ?, ?)";
        const values = [title, author, pages, prize, info, id];
        mysql.query(query, values, (err, result) => {
          if (err) {
            const errorMessage = "Error executing the query";
            console.error("Error executing the query:", err);
            req.flash("server-error", errorMessage);
            res.redirect("/books/add");
          } else {
            req.flash("server-success", "Book added successfully");
            res.redirect("/books");
          }
        });
      }
    }
  });
});

// render book
app.get("/books/:id", (req, res) => {
  const id = req.params.id;
  const query = "SELECT * FROM books WHERE id = ?";

  mysql.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).send("Error executing the query");
      return;
    }

    const book = result[0];

    const authorId = result[0].author;
    const authorQuery = "SELECT * FROM author WHERE id = ?";

    mysql.query(authorQuery, [authorId], (err, authorResults) => {
      if (err) {
        console.error("Error executing the author query:", err);
        res.status(500).json({ error: "Error executing the query" });
        return;
      }

      const authorName = authorResults.length > 0 ? authorResults[0].name : "";
      res.render("book", { book, authorName });
    });
  });
});

// book update request
app.get("/books/update/:id", verifyToken, (req, res) => {
  const id = req.params.id;
  const bookQuery = "SELECT * FROM books WHERE id = ?";
  const authorQuery = "SELECT * FROM author"; // Query to get all authors

  mysql.query(bookQuery, [id], (err, result) => {
    if (err) {
      const errorMessage = "Error executing the book query";
      console.error("Error executing the book query:", err);
      req.flash("server-error", errorMessage);
      res.redirect("/books");
    }
    const book = result[0];

    mysql.query(authorQuery, (err, authorResult) => {
      if (err) {
        const errorMessage = "Error executing the author query";
        console.error("Error executing the author query:", err);
        req.flash("server-error", errorMessage);
        res.redirect("/books");
      }
      const authors = authorResult;

      const authorId = result[0].author;
      const authorQuery = "SELECT * FROM author WHERE id = ?";

      mysql.query(authorQuery, [authorId], (err, authorResults) => {
        if (err) {
          console.error("Error executing the author query:", err);
          res.status(500).json({ error: "Error executing the query" });
          return;
        }

        const author = authorResults[0];
        console.log(author);
        res.render("updateBook", { book, authors, author });
      });
    });
  });
});
// update book
app.post("/books/update", (req, res) => {
  const { title, author, pages, prize, id, info } = req.body;
  const queryCheckDuplicate =
    "SELECT COUNT(*) AS count FROM books WHERE title = ? AND author = ?";
  const valuesCheckDuplicate = [title, author];
  mysql.query(queryCheckDuplicate, valuesCheckDuplicate, (err, result) => {
    if (err) {
      const errorMessage = "Error executing the query";
      console.error("Error executing the query:", err);
      as;
      req.flash("server-error", errorMessage);
      res.redirect("/books");
    } else {
      const query =
        "UPDATE books SET title = ?, author = ?, pages = ?, prize = ?, info = ? WHERE id = ?";
      const values = [title, author, pages, prize, info, id];
      mysql.query(query, values, (err, result) => {
        if (err) {
          console.error("Error executing the query:", err);
          req.flash("server-error", "Error executing the query");
          res.redirect("/books");
        } else {
          req.flash("server-success", "Book Updated successfully");
          res.redirect("/books");
        }
      });
    }
  });
});
// delete book
app.delete("/books/delete/:id", verifyToken, (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM books WHERE id = ?";
  mysql.query(sql, [id], (error, results) => {
    if (error) {
      console.error("Error executing DELETE query:", error);
      req.flash("server-error", "Error executing the query");
      return res.status(500).send({ error: "Error executing the query" });
    }

    if (results.affectedRows === 0) {
      req.flash("server-error", "Item not found");
      return res.status(404).send({ error: "Item not found" });
    }

    const query = "SELECT * FROM books";

    mysql.query(query, (err, bookResults) => {
      if (err) {
        console.error("Error executing the query:", err);
        req.flash("server-error", "Error executing the query");
        return res.status(500).send({ error: "Error executing the query" });
      }

      req.flash("server-success", "Book deleted successfully");
      res.status(200).json({ redirectUrl: "/books" });
      // res.redirect("/books");
    });
  });
});

// author
app.get("/authors", (req, res) => {
  const serverError = req.flash("server-error")[0];
  const serverSuccess = req.flash("server-success")[0];
  const query = "SELECT * FROM author";
  mysql.query(query, (err, results) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Error executing the query" });
      return;
    }
    res.render("authors", { author: results, serverSuccess, serverError });
  });
});

app.get("/author/:id", (req, res) => {
  const authorId = req.params.id;
  const authorQuery = "SELECT * FROM author WHERE id = ?";
  const booksQuery = "SELECT * FROM books WHERE author = ?";

  mysql.query(authorQuery, [authorId], (err, authorResult) => {
    if (err) {
      console.error("Error executing the author query:", err);
      res.status(500).send("Error executing the query");
      return;
    }

    const author = authorResult[0];

    mysql.query(booksQuery, [authorId], (err, booksResult) => {
      if (err) {
        console.error("Error executing the books query:", err);
        res.status(500).send("Error executing the query");
        return;
      }

      const books = booksResult;
      console.log(author, books);
      res.render("author", { author, books });
    });
  });
});
// Add author
app.get("/authors/add", verifyToken, (req, res) => {
  res.render("addAuthor", {
    serverError: req.flash("server-error")[0],
    serverSuccess: req.flash("server-success")[0],
  });
});

app.post("/author/add", (req, res) => {
  const name = req.body.name;
  const id = generateUniqueId();

  const query = "INSERT INTO author (id, name) VALUES (?, ?)";
  const values = [id, name];
  mysql.query(query, values, (err, result) => {
    if (err) {
      const errorMessage = "Error executing the query";
      console.error("Error executing the query:", err);
      req.flash("server-error", errorMessage);
      res.redirect("/authors/add");
    } else {
      req.flash("server-success", "Author added successfully");
      res.redirect("/authors");
    }
  });
});

//update author
app.get("/authors/update/:id", verifyToken, (req, res) => {
  const id = req.params.id;
  const query = "SELECT * FROM author WHERE id = ?";

  mysql.query(query, [id], (err, result) => {
    if (err) {
      const errorMessage = "Error executing the query";
      console.error("Error executing the query:", err);
      req.flash("server-error", errorMessage);
      res.redirect("/books");
    } else {
      const author = result[0];
      res.render("updateAuthor", { author });
    }
  });
});

app.post("/author/update", (req, res) => {
  const { id, name } = req.body;
  const query = "UPDATE author SET name = ? WHERE id = ?";
  const values = [name, id];
  mysql.query(query, values, (err, result) => {
    if (err) {
      console.error("Error executing the query:", err);
      req.flash("server-error", "Error executing the query");
      res.redirect("/author");
    } else {
      req.flash("server-success", "Author Updated successfully");
      res.redirect("/authors");
    }
  });
});

app.get("/authors/update/addBook/:id", (req, res) => {
  const id = req.params.id;
  const query = "SELECT * FROM author WHERE id = ?";

  mysql.query(query, [id], (err, result) => {
    if (err) {
      const errorMessage = "Error executing the query";
      console.error("Error executing the query:", err);
      req.flash("server-error", errorMessage);
      res.redirect("/books");
    } else {
      const author = result[0];
      res.render("authorUpdateAddBook", { author });
    }
  });
});

// delete author
app.delete("/authors/delete/:id", verifyToken, (req, res) => {
  const id = req.params.id;
  console.log(id);
  const sql = "DELETE FROM author WHERE id = ?";
  mysql.query(sql, [id], (error, results) => {
    if (error) {
      console.error("Error executing DELETE query:", error);
      req.flash("server-error", "Error executing the query");
      return res.status(500).send({ error: "Error executing the query" });
    }

    if (results.affectedRows === 0) {
      req.flash("server-error", "Item not found");
      return res.status(404).send({ error: "Item not found" });
    }

    req.flash("server-success", "Author deleted successfully");
    res.redirect("/authors");
  });
});

// starting the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
