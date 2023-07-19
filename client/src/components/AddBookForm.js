import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const AddBookForm = ({ onServerMassage }) => {
  const navigate = useNavigate();

  const [authors, setAuthors] = useState([]);
  const [title, setTitle] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState("");
  const [pages, setPages] = useState(1);
  const [prize, setPrize] = useState(0);
  const [info, setInfo] = useState("");
  const [isFormValidated, setFormValidated] = useState(false);

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const response = await axios.get("http://localhost:5000/authors");
        setAuthors(response.data.author);
      } catch (error) {
        console.log("Error fetching authors:", error);
      }
    };

    fetchAuthors();
  }, []);
  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity()) {
      try {
        const response = await axios.post("http://localhost:5000/book/add", {
          title,
          author: selectedAuthor,
          pages,
          prize,
          info,
        });

        // Navigate to the book list page
        navigate("/books");
        onServerMassage("Add Book Successfully");
      } catch (error) {
        onServerMassage(" Book Not Added Successfully");
        console.error("Error adding book:", error);
      }
    } else {
      setFormValidated(true);
    }
  };

  return (
    <div className="w-100 h-75 d-flex justify-content-center align-items-center mt-4">
      <form
        className="mt-4 w-50 row g-3"
        id="validation"
        noValidate
        onSubmit={handleSubmit}
      >
        <div className="w-100 d-flex justify-content-between align-items-center">
          <h2>Add Book</h2>
          <Link to="/books" className="btn btn-primary btn-sm mt-1">
            <i className="fas fa-arrow-left" style={{ color: "#f5f5f5" }}></i>{" "}
            BACK
          </Link>
        </div>

        <div className={`mb-3 ${isFormValidated ? "was-validated" : ""}`}>
          <label className="form-label">Title *</label>
          <input
            type="text"
            className="form-control"
            name="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="invalid-feedback">Please fill in the title.</div>
          <div className="valid-feedback">Looks good!</div>
        </div>

        <div className={`mb-3 ${isFormValidated ? "was-validated" : ""}`}>
          <label className="form-label">Author *</label>
          <select
            className="form-select form-control"
            name="author"
            aria-label="Default select example"
            required
            value={selectedAuthor}
            onChange={(e) => setSelectedAuthor(e.target.value)}
          >
            <option value="" disabled>
              Select an author
            </option>
            {authors.map((author) => (
              <option key={author.id} value={author.id}>
                {author.name}
              </option>
            ))}
          </select>
          <div className="invalid-feedback">Please select an author.</div>
          <div className="valid-feedback">Looks good!</div>
        </div>

        <div className={`w-50 ${isFormValidated ? "was-validated" : ""}`}>
          <label className="form-label">Pages *</label>
          <input
            type="number"
            className="form-control"
            name="pages"
            min="1"
            value={pages}
            onChange={(e) => setPages(e.target.value)}
            required
          />
          <div className="invalid-feedback">
            Please enter a valid number of pages.
          </div>
          <div className="valid-feedback">Looks good!</div>
        </div>

        <div className={`w-50 ${isFormValidated ? "was-validated" : ""}`}>
          <label className="form-label">Prize *</label>
          <div className="input-group mb-3">
            <span className="input-group-text">RS</span>
            <input
              type="number"
              className="form-control"
              name="prize"
              min="0"
              value={prize}
              onChange={(e) => setPrize(e.target.value)}
              required
            />
          </div>

          <div className="invalid-feedback">Please enter a valid prize.</div>
          <div className="valid-feedback">Looks good!</div>
        </div>

        <div className={`mb-3 ${isFormValidated ? "was-validated" : ""}`}>
          <label className="form-label">Info</label>
          <textarea
            className="form-control"
            name="info"
            rows="4"
            value={info}
            onChange={(e) => setInfo(e.target.value)}
          ></textarea>
          <div className="valid-feedback">Looks good!</div>
        </div>
        <div>
          <button className="btn btn-primary mt-3" type="submit">
            Add Book
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddBookForm;
