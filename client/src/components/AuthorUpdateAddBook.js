import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const AuthorUpdateAddBookForm = () => {
  let navigate = useNavigate();
  const { id } = useParams();
  const [author, setAuthor] = useState({ name: "" });
  const [title, setTitle] = useState("");
  const [pages, setPages] = useState(1);
  const [prize, setPrize] = useState(0);
  const [info, setInfo] = useState("");

  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/authors/update/addBook/${id}`
        );
        const { author } = response.data;
        setAuthor(author);
      } catch (error) {
        console.error("Error fetching author:", error);
      }
    };

    fetchAuthor();
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity()) {
      try {
        const response = await axios.post(`http://localhost:5000/book/add`, {
          author: author.id,
          title,
          pages,
          prize,
          info,
        });
        navigate("/authors");
      } catch (error) {
        console.error("Error adding book:", error);
      }
    }
    form.classList.add("was-validated");
  };

  return (
    <div className="w-100 h-75 d-flex justify-content-center align-items-center mt-4">
      <form
        action={`/authors/update/addBook/${id}`}
        method="POST"
        className="mt-4 w-50 row g-3"
        id="validation"
        noValidate
        onSubmit={handleSubmit}
      >
        <div className="w-100 d-flex justify-content-between align-items-center">
          <h2>Add Book</h2>
          <a
            href={`/authors/update/${id}`}
            className="btn btn-primary btn-sm mt-1"
          >
            <i className="fas fa-arrow-left" style={{ color: "#f5f5f5" }}></i>{" "}
            BACK
          </a>
        </div>

        <div className="mb-3">
          <label className="form-label">Title *</label>
          <input
            type="text"
            className="form-control"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <div className="invalid-feedback">Please fill in the title.</div>
          <div className="valid-feedback">Looks good!</div>
        </div>

        <div className="mb-3">
          <label className="form-label">Author *</label>
          <input
            type="text"
            className="form-control"
            name="author"
            value={author.name}
            readOnly
            required
          />
          <div className="invalid-feedback">
            Please enter a valid author name without numbers.
          </div>
          <div className="valid-feedback">Looks good!</div>
        </div>

        <div className="w-50">
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
            Please provide the number of pages.
          </div>
          <div className="valid-feedback">Looks good!</div>
        </div>

        <div className="w-50">
          <label className="form-label">Prize *</label>
          <div className="input-group">
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
                aria-label="Prize"
                aria-describedby="basic-addon1"
              />
            </div>

            <div className="invalid-feedback">Please provide the prize.</div>
            <div className="valid-feedback">Looks good!</div>
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Info</label>
          <textarea
            className="form-control"
            name="info"
            value={info}
            onChange={(e) => setInfo(e.target.value)}
          ></textarea>
        </div>

        <div className="col-12">
          <button className="btn btn-primary" type="submit">
            Add Book
          </button>
        </div>
      </form>
    </div>
  );
};

export default AuthorUpdateAddBookForm;
