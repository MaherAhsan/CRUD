const express = require("express");
const app = express();
const cors = require("cors");
const port = 5000;
const mysql = require("./connection").con;
const { v4: uuidv4 } = require("uuid");
var session = require("express-session");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

// functions
function generateUniqueId() {
  let uniqueId = uuidv4().replace(/-/g, "");
  uniqueId = uniqueId.slice(0, 6);
  return uniqueId;
}
function verifyToken(req, res, next) {
  const token = req.headers["access-token"];
  if (token) {
    jwt.verify(token, "keyboard cat", (error, decodedToken) => {
      if (error) {
        console.error("Error verifying token:", error);
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
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use(cors());
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

app.get("/check-auth", verifyToken, (req, res) => {
  const user = req.user.email;
  res.send({ isAuthenticated: true, user });
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
      res.redirect("/register");
    } else {
      if (results.length > 0) {
        res.redirect("/register");
      } else {
        mysql.query(queryInsertUser, valuesInsertUser, (error, results) => {
          if (error) {
            console.error("Error registering user:", error);
            res.redirect("/register");
          } else {
            const token = jwt.sign({ email: email }, "keyboard cat");
            return res.json({ Login: true, token });
          }
        });
      }
    }
  });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const query = "SELECT * FROM users WHERE email = ?";

  mysql.query(query, [email], (error, results) => {
    if (error) {
      console.error("Error executing the query:", error);
      res.redirect("/login");
    } else {
      if (results.length > 0) {
        const user = results[0];
        if (password === user.password) {
          const token = jwt.sign({ email: email }, "keyboard cat");
          return res.json({ Login: true, token });
        } else {
          res.redirect("/login");
        }
      } else {
        res.redirect("/login");
      }
    }
  });
});

//logout
app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});

app.get("/", (req, res) => {
  const queryGetBooks =
    "SELECT books.*, author.name AS authorName FROM books JOIN author ON books.author = author.id";

  mysql.query(queryGetBooks, (error, results) => {
    if (error) {
      console.error("Error retrieving books:", error);
      res.send({
        error: "Failed to retrieve books",
      });
    } else {
      res.send({ books: results });
    }
  });
});
// books page
app.get("/books", (req, res) => {
  const booksQuery = "SELECT * FROM books";

  mysql.query(booksQuery, (err, booksResults) => {
    if (err) {
      console.error("Error executing the books query:", err);
      res.status(500).json({ error: "Error executing the query" });
      return;
    }

    res.send({ books: booksResults });
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
    console.log(results);
    res.send({ author: results });
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
      res.redirect("/books/add");
    } else {
      const count = result[0].count;
      if (count > 0) {
        const errorMessage = "This book already exists in the database";
        res.redirect("/books/add");
      } else {
        const query =
          "INSERT INTO books (title, author, pages, prize, info, id) VALUES (?, ?, ?, ?, ?, ?)";
        const values = [title, author, pages, prize, info, id];
        mysql.query(query, values, (err, result) => {
          if (err) {
            const errorMessage = "Error executing the query";
            console.error("Error executing the query:", err);
            res.redirect("/books/add");
          } else {
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
      res.send({ book, authorName });
    });
  });
});

// book update request
app.get("/books/update/:id", (req, res) => {
  const id = req.params.id;
  const bookQuery = "SELECT * FROM books WHERE id = ?";
  const authorQuery = "SELECT * FROM author"; // Query to get all authors

  mysql.query(bookQuery, [id], (err, result) => {
    if (err) {
      const errorMessage = "Error executing the book query";
      console.error("Error executing the book query:", err);
      res.redirect("/books");
      return;
    }

    if (result.length === 0) {
      const errorMessage = "Book not found";
      console.error("Book not found");
      res.redirect("/books");
      return;
    }

    const book = result[0];

    mysql.query(authorQuery, (err, authorResult) => {
      if (err) {
        const errorMessage = "Error executing the author query";
        console.error("Error executing the author query:", err);
        res.redirect("/books");
        return;
      }

      const authors = authorResult;

      const authorId = book.author;
      const authorQuery = "SELECT * FROM author WHERE id = ?";

      mysql.query(authorQuery, [authorId], (err, authorResults) => {
        if (err) {
          console.error("Error executing the author query:", err);
          res.status(500).json({ error: "Error executing the query" });
          return;
        }

        const author = authorResults[0];
        res.send({ book, authors, author });
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
      res.redirect("/books");
    } else {
      const query =
        "UPDATE books SET title = ?, author = ?, pages = ?, prize = ?, info = ? WHERE id = ?";
      const values = [title, author, pages, prize, info, id];
      mysql.query(query, values, (err, result) => {
        if (err) {
          console.error("Error executing the query:", err);
          res.redirect("/books");
        } else {
          res.redirect("/books");
        }
      });
    }
  });
});
// delete book
app.delete("/books/delete/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM books WHERE id = ?";
  mysql.query(sql, [id], (error, results) => {
    if (error) {
      console.error("Error executing DELETE query:", error);
      return res.status(500).send({ error: "Error executing the query" });
    }

    if (results.affectedRows === 0) {
      return res.status(404).send({ error: "Item not found" });
    }

    const query = "SELECT * FROM books";

    mysql.query(query, (err, bookResults) => {
      if (err) {
        console.error("Error executing the query:", err);
        return res.status(500).send({ error: "Error executing the query" });
      }

      res.status(200).json({ redirectUrl: "/books" });
      // res.redirect("/books");
    });
  });
});

// author
app.get("/authors", (req, res) => {
  const query = "SELECT * FROM author";
  mysql.query(query, (err, results) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Error executing the query" });
      return;
    }
    res.send({ author: results });
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
      res.send({ author, books }); // Send the response with author and books data
    });
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
      res.redirect("/authors/add");
    } else {
      res.redirect("/authors");
    }
  });
});

//update author
app.get("/authors/update/:id", (req, res) => {
  const id = req.params.id;
  const query = "SELECT * FROM author WHERE id = ?";

  mysql.query(query, [id], (err, result) => {
    if (err) {
      const errorMessage = "Error executing the query";
      console.error("Error executing the query:", err);
      res.redirect("/books");
    } else {
      const author = result[0];
      res.send({ author });
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
      res.redirect("/author");
    } else {
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
      res.redirect("/books");
    } else {
      const author = result[0];
      res.send({ author });
    }
  });
});

// delete author
app.delete("/authors/delete/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM author WHERE id = ?";
  mysql.query(sql, [id], (error, results) => {
    if (error) {
      console.error("Error executing DELETE query:", error);
      return res.status(500).send({ error: "Error executing the query" });
    }

    if (results.affectedRows === 0) {
      return res.status(404).send({ error: "Item not found" });
    }
    res.status(200).json({ redirectUrl: "/authors" });
  });
});

// starting the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
