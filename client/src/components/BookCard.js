import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
const BookCard = ({ isAuthenticated }) => {
  let navigate = useNavigate();
  const { id } = useParams();
  const [book, setBook] = useState([]);
  const [authorName, setAuthorName] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/books/${id}`);
        setBook(response.data.book);
        setAuthorName(response.data.authorName);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [id]);

  const handleDeleteClick = async () => {
    const url = `http://localhost:5000/books/delete/${id}`;

    if (window.confirm("Are you sure you want to delete this Book?")) {
      try {
        await axios.delete(url);
        navigate("/books");
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className="container d-flex justify-content-center w-50">
      <div className="w-50 card books m-4">
        <div className="card-body">
          <h2 className="card-title">Title: {book.title}</h2>
          <p className="card-text">Author: {authorName}</p>
          <p className="card-text">Pages: {book.pages}</p>
          <p className="card-text">Prize: {book.prize}</p>
          <p className="card-text">Id: {book.id}</p>
          <p className="card-text">{book.info}</p>
        </div>
        {isAuthenticated && (
          <div className="m-2 d-flex">
            <Link to={`/books/update/${book.id}`} className="m-1">
              <button type="button" className="btn btn-primary btn-sm">
                <i
                  className="fa-solid fa-pen fa-sm"
                  style={{ color: "#ffffff" }}
                ></i>{" "}
                Edit
              </button>
            </Link>
            <div className="m-1">
              <button
                type="button"
                className="deleteButton btn btn-danger btn-sm"
                onClick={handleDeleteClick}
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
      </div>
    </div>
  );
};

export default BookCard;
