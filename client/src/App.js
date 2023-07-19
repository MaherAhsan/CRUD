import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import axios from "axios";
import AddAuthorForm from "./components/AddAuthorForm";
import AddBookForm from "./components/AddBookForm";
import AuthorDetails from "./components/AuthorDetails";
import AuthorList from "./components/AuthorList";
import AuthorUpdateAddBook from "./components/AuthorUpdateAddBook";
import BookCard from "./components/BookCard";
import BookList from "./components/BookList";
import EditAuthorForm from "./components/EditAuthorForm";
import EditBookForm from "./components/EditBookForm";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import ToastContainer from "./components/ToastContainer";

const App = () => {
  const [authors, setAuthors] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [serverMassage, setServerMassage] = useState(null);
  const [user, setUser] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { "access-token": ` ${token}` };
        const response = await axios.get("http://localhost:5000/check-auth", {
          headers,
        });
        const { isAuthenticated, user } = response.data;
        setIsAuthenticated(isAuthenticated);
        setUser(user);
      } catch (error) {
        console.error("Error checking authentication:", error);
      }
    };

    checkAuth();
  }, []);

  const handleServerMassage = (message) => {
    setServerMassage(message);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setServerMassage("Logout successfully");
  };

  const handleAuthorDelete = (authorId) => {
    axios
      .delete(`/api/authors/${authorId}`)
      .then((response) => {
        // Remove the deleted author from the authors state
        setAuthors((prevAuthors) =>
          prevAuthors.filter((author) => author.id !== authorId)
        );
        setServerMassage("Author Deleted Successfully");
      })
      .catch((error) => {
        setServerMassage("Error while deleting author");
        // Handle the error, show an error toast message, or perform any other action
        console.log(error);
      });
  };

  return (
    <Router>
      <Navbar
        isAuthenticated={isAuthenticated}
        handleLogout={handleLogout}
        user={user}
      />
      <Routes>
        <Route path="/" element={<Home isAuthenticated={isAuthenticated} />} />
        <Route
          path="/authors"
          element={
            <AuthorList
              authors={authors}
              isAuthenticated={isAuthenticated}
              handleAuthorDelete={handleAuthorDelete}
            />
          }
        />
        <Route
          path="/authors/add"
          element={<AddAuthorForm onServerMassage={handleServerMassage} />}
        />
        <Route
          path="/authors/update/:id"
          element={<EditAuthorForm onServerMassage={handleServerMassage} />}
        />
        <Route
          path="/author/:id"
          element={<AuthorDetails isAuthenticated={isAuthenticated} />}
        />
        <Route
          path="/books/:id"
          element={<BookCard isAuthenticated={isAuthenticated} />}
        />
        <Route
          path="/books/update/:id"
          element={
            <EditBookForm
              authors={authors}
              onServerMassage={handleServerMassage}
            />
          }
        />
        <Route
          path="/books"
          element={
            <BookList
              isAuthenticated={isAuthenticated}
              onServerMassage={handleServerMassage}
            />
          }
        />
        <Route
          path="/books/add"
          element={
            <AddBookForm
              authors={authors}
              onServerMassage={handleServerMassage}
            />
          }
        />
        <Route
          exact
          path="/authors/update/addBook/:id"
          element={<AuthorUpdateAddBook />}
        />
        <Route
          path="/login"
          element={<LoginForm onServerMassage={handleServerMassage} />}
        />
        <Route
          path="/register"
          element={<RegisterForm onServerMassage={handleServerMassage} />}
        />
      </Routes>
      <ToastContainer serverMassage={serverMassage} />
    </Router>
  );
};

export default App;
