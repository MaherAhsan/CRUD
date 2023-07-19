import React from "react";
import axios from "axios";
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

const EditAuthorForm = ({ onServerMassage }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [author, setAuthor] = useState(null);

  useEffect(() => {
    const fetchAuthor = async (id) => {
      try {
        const response = await axios.get(
          `http://localhost:5000/authors/update/${id}`
        );
        setAuthor(response.data.author);
      } catch (error) {
        console.error("Error fetching author:", error);
      }
    };

    fetchAuthor(id);
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity()) {
      try {
        const response = await axios.post(
          `http://localhost:5000/author/update`,
          {
            id: author.id,
            name: author.name,
          }
        );
        navigate("/authors");
        onServerMassage("Update Author Successfully");
      } catch (error) {
        onServerMassage("Error occur when updating author");
        console.error("Error updating author:", error);
        // Handle error (e.g., show error message)
      }
    }
    form.classList.add("was-validated");
  };

  if (!author) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-100 h-75 d-flex justify-content-center align-items-center mt-4">
      <form
        action="/author/update"
        method="POST"
        className="mt-4 w-50 row g-3"
        id="validation"
        noValidate
        onSubmit={handleSubmit}
      >
        <div className="w-100 d-flex justify-content-between align-items-center">
          <h2>Edit Author</h2>
          <a href="/authors" className="btn btn-primary btn-sm mt-1">
            <i className="fas fa-arrow-left" style={{ color: "#f5f5f5" }}></i>{" "}
            BACK
          </a>
        </div>

        <div className="mb-3">
          <label className="form-label">Author Name *</label>
          <input
            type="text"
            className="form-control"
            value={author.name}
            name="name"
            pattern="[A-Za-z\s]+"
            required
            onChange={(e) => setAuthor({ ...author, name: e.target.value })}
          />
          <div className="invalid-feedback">
            Please enter a valid author name without numbers.
          </div>
          <div className="valid-feedback">Looks good!</div>
        </div>

        <input type="hidden" name="id" value={author.id} />

        <div className="w-100 mt-4 d-flex justify-content-center">
          <Link
            to={`/authors/update/addBook/${author.id}`}
            className="btn btn-primary btn-sm mt-1"
          >
            <i
              className="fa-sharp fa-solid fa-plus fa-sm"
              style={{ color: "#ffffff" }}
            ></i>{" "}
            Add Book
          </Link>
        </div>

        <div className="col-12">
          <button className="btn btn-primary" type="submit">
            Update Author
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditAuthorForm;
