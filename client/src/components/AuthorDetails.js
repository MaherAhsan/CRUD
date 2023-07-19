import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";

const AuthorDetails = ({ isAuthenticated }) => {
  let navigate = useNavigate();
  const { id } = useParams();
  const [books, setBooks] = useState([]);
  const [author, setAuthor] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/author/${id}`);
        setBooks(response.data.books);
        setAuthor(response.data.author);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [id]);

  const handleBookDelete = async (id) => {
    const url = `http://localhost:5000/books/delete/${id}`;

    if (window.confirm("Are you sure you want to delete this Book?")) {
      try {
        await axios.delete(url);
        setBooks(books.filter((book) => book.id !== id));
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleAuthorDelete = async (id) => {
    const url = `http://localhost:5000/authors/delete/${id}`;

    if (window.confirm("Are you sure you want to delete this Author?")) {
      try {
        await axios.delete(url);
        navigate("/authors");
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <section className="container w-75 d-flex flex-wrap justify-content-center">
      <h3 className="mt-4">Name: {author.name}</h3>
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
              <div className="w-50 d-flex fw-light"> Rs: {book.prize}</div>
            </div>
            <div className="w-50 d-flex">
              <div className="w-50 d-flex"></div>
              <div className="w-50 d-flex justify-content-end">
                {isAuthenticated && (
                  <>
                    <Link to={`/books/update/${book.id}`}>
                      <button
                        type="button"
                        className="btn btn-sm btn-primary m-1"
                      >
                        <i
                          className="fa-solid fa-pen fa-sm"
                          style={{ color: "#ffffff" }}
                        ></i>{" "}
                        Edit
                      </button>
                    </Link>
                    <button
                      type=""
                      className="m-1 deleteButton btn btn-danger btn-sm"
                      data-id={book.id}
                      onClick={() => handleBookDelete(book.id)}
                    >
                      <i
                        className="fa-solid fa-trash fa-sm"
                        style={{ color: "#ffffff" }}
                      ></i>{" "}
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </li>
        ))}
      </div>
      {isAuthenticated && (
        <div>
          <Link
            to={`/authors/update/${author.id}`}
            className="btn btn-primary btn-sm m-1 mt-3"
          >
            <i
              className="fa-solid fa-pen fa-sm"
              style={{ color: "#ffffff" }}
            ></i>{" "}
            Edit
          </Link>
          <button
            type="button"
            className="btn btn-danger btn-sm m-1 mt-3"
            onClick={() => handleAuthorDelete(author.id)}
          >
            <i
              className="fa-solid fa-trash fa-sm"
              style={{ color: "#ffffff" }}
            ></i>{" "}
            Delete
          </button>
        </div>
      )}
    </section>
  );
};

export default AuthorDetails;
