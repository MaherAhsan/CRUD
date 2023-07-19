import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import React from "react";

const Home = ({ isAuthenticated }) => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/");
        setBooks(response.data.books);
      } catch (error) {
        console.log("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <section className="container w-75 d-flex flex-wrap justify-content-center">
      {isAuthenticated && (
        <div className="w-100 mt-4 d-flex justify-content-center">
          <Link to="/books/add" className="btn btn-primary btn-sm">
            <i
              className="fa-sharp fa-solid fa-plus fa-sm"
              style={{ color: "#ffffff" }}
            ></i>{" "}
            Add Book
          </Link>
        </div>
      )}
      <div className="list-group w-100 mt-4">
        {books &&
          books.map((book) => (
            <li
              className="list-group-item w-100 d-flex align-items-center"
              key={book.id}
            >
              <div className="w-100 d-flex align-items-center">
                <div className="w-50">
                  <h5>
                    <Link
                      to={`/books/${book.id}`}
                      className="text-decoration-none text-dark"
                    >
                      Title: {book.title}
                    </Link>
                  </h5>
                </div>
                <div className="w-50 d-flex fw-light">
                  Author: {book.authorName}
                </div>
              </div>
            </li>
          ))}
      </div>
    </section>
  );
};

export default Home;
