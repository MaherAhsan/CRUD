import { useState } from "react";
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const AddAuthorForm = ({ onServerMassage }) => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [isFormValidated, setFormValidated] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const form = event.currentTarget;
    if (form.checkValidity()) {
      try {
        const response = await axios.post("http://localhost:5000/author/add", {
          name: name,
        });
        navigate("/authors");
        onServerMassage("Author Added Successfully");
      } catch (error) {
        onServerMassage("Error occur when adding author");
        console.error("Error adding author:", error);
      }
    }
    setFormValidated(true);
  };

  return (
    <div className="w-100 h-75 d-flex justify-content-center align-items-center mt-4">
      <form
        onSubmit={handleSubmit}
        action="/author/add"
        method="POST"
        className={`mt-4 w-50 row g-3 ${
          isFormValidated ? "was-validated" : ""
        }`}
        id="validation"
        noValidate
      >
        <div className="w-100 d-flex justify-content-between align-items-center">
          <h2>Add Author</h2>
          <Link to="/authors" className="btn btn-primary btn-sm mt-1">
            <i className="fas fa-arrow-left" style={{ color: "#f5f5f5" }}></i>{" "}
            BACK
          </Link>
        </div>

        <div className="mb-3">
          <label className="form-label">Author Name *</label>
          <input
            type="text"
            className="form-control"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            pattern="[A-Za-z\s]+"
            required
          />
          <div className="invalid-feedback">
            Please enter a valid author name without numbers.
          </div>
          <div className="valid-feedback">Looks good!</div>
        </div>

        <div className="col-12">
          <button className="btn btn-primary" type="submit">
            Add Author
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAuthorForm;
