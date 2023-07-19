import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const BookList = ({ isAuthenticated, onServerMassage }) => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/books");
        setBooks(response.data.books);
      } catch (error) {
        console.log("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleDeleteClick = async (id) => {
    const url = `http://localhost:5000/books/delete/${id}`;

    if (window.confirm("Are you sure you want to delete this Book?")) {
      try {
        await axios.delete(url);
        setBooks(books.filter((book) => book.id !== id));
        onServerMassage("Book Deleted Successfully");
      } catch (error) {
        onServerMassage("Error while deleting book");
        console.error(error);
      }
    }
  };

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
        {books.map((book) => (
          <li
            className="list-group-item w-100 d-flex align-items-center"
            key={book.id}
          >
            <div className="w-50 d-flex align-items-center">
              <div className="w-50">
                <Link
                  to={`/books/${book.id}`}
                  className="text-decoration-none text-dark"
                >
                  <h5>Title: {book.title}</h5>
                </Link>
              </div>
              <div className="w-50 d-flex fw-light">Rs: {book.prize}</div>
            </div>
            {isAuthenticated && (
              <div className="w-50 d-flex">
                <div className="w-50 d-flex"></div>
                <div className="w-50 d-flex justify-content-end">
                  <Link
                    to={`/books/update/${book.id}`}
                    className="btn btn-sm btn-primary m-1"
                  >
                    <i
                      className="fa-solid fa-pen fa-sm"
                      style={{ color: "#ffffff" }}
                    ></i>{" "}
                    Edit
                  </Link>
                  <button
                    type="button"
                    className="deleteButton btn btn-danger btn-sm m-1"
                    onClick={() => handleDeleteClick(book.id)}
                    data-id={book.id}
                  >
                    <i
                      className="fa-solid fa-trash fa-sm"
                      style={{ color: "#ffffff" }}
                    ></i>{" "}
                    Delete
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </div>
    </section>
  );
};

export default BookList;
