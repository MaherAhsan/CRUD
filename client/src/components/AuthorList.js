import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
const AuthorList = ({ isAuthenticated }) => {
  const [authors, setAuthors] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/authors");
        setAuthors(response.data.author);
      } catch (error) {
        console.log("Error fetching data :", error);
      }
    };
    fetchData();
  }, []);

  const handleDeleteClick = async (id) => {
    const url = `http://localhost:5000/authors/delete/${id}`;

    if (window.confirm("Are you sure you want to delete this Author?")) {
      try {
        await axios.delete(url);
        setAuthors(authors.filter((author) => author.id !== id));
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <section className="container w-75 d-flex flex-wrap justify-content-center">
      {isAuthenticated && (
        <div className="w-100 mt-4 d-flex justify-content-center">
          <Link to="/authors/add" className="btn btn-primary btn-sm">
            <i
              className="fa-sharp fa-solid fa-plus fa-sm"
              style={{ color: "#ffffff" }}
            ></i>{" "}
            Add Author
          </Link>
        </div>
      )}
      <div className="list-group w-100 mt-4">
        {authors.map((author) => (
          <li
            className="list-group-item w-100 d-flex align-items-center"
            key={author.id}
          >
            <div className="w-50 d-flex align-items-center">
              <div className="w-50">
                <Link
                  to={`/author/${author.id}`}
                  className="text-decoration-none text-dark"
                >
                  <h5>Name: {author.name}</h5>
                </Link>
              </div>
            </div>
            <div className="w-50 d-flex align-items-center">
              <div className="w-50 d-flex"></div>
              <div className="w-50 d-flex justify-content-end align-items-center">
                {isAuthenticated && (
                  <>
                    <div className="mx-1">
                      <Link
                        to={`/authors/update/${author.id}`}
                        className="btn btn-primary btn-sm mt-1"
                      >
                        <i
                          className="fa-solid fa-pen fa-sm"
                          style={{ color: "#ffffff" }}
                        ></i>{" "}
                        Edit
                      </Link>
                    </div>
                    <div className="mx-1">
                      <button
                        type="button"
                        className="btn btn-danger btn-sm mt-1"
                        onClick={() => handleDeleteClick(author.id)}
                      >
                        <i
                          className="fa-solid fa-trash fa-sm"
                          style={{ color: "#ffffff" }}
                        ></i>{" "}
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </li>
        ))}
      </div>
    </section>
  );
};

export default AuthorList;
