import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import React from "react";
import axios from "axios";

const EditBookForm = ({ onServerMassage }) => {
  let navigate = useNavigate();
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [authors, setAuthors] = useState(null);
  const [title, setTitle] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState("");
  const [pages, setPages] = useState(1);
  const [price, setPrice] = useState(0);
  const [info, setInfo] = useState("");

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/books/update/${id}`
        );
        const bookData = response.data;
        setAuthors(bookData.authors);
        setBook(bookData);
        setTitle(bookData.book.title);
        setSelectedAuthor(bookData.author.id);
        setPages(bookData.book.pages);
        setPrice(bookData.book.prize);
        setInfo(bookData.book.info);
      } catch (error) {
        console.error("Error fetching book:", error);
      }
    };

    fetchBook();
  }, [id]);
  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity()) {
      try {
        const response = await axios.post(
          "http://localhost:5000/books/update",
          {
            id: book.book.id,
            title,
            author: selectedAuthor,
            pages,
            prize: price,
            info,
          }
        );
        navigate("/books");
        onServerMassage("Book updated successfully");
      } catch (error) {
        onServerMassage("Error occur when updating book");
        console.error("Error updating book:", error);
      }
    }
    form.classList.add("was-validated");
  };

  if (!book) {
    return <div>Loading...</div>;
  }
  return (
    <div className="w-100 h-75 d-flex justify-content-center">
      <form
        action="/books/update"
        method="POST"
        className="mt-4 w-50 row g-3"
        id="validation"
        noValidate
        onSubmit={handleSubmit}
      >
        <div className="w-100 d-flex justify-content-between align-items-center">
          <h2>Edit Book</h2>
          <a href="/books" className="btn btn-primary btn-sm mt-1">
            <i className="fas fa-arrow-left" style={{ color: "#f5f5f5" }}></i>{" "}
            BACK
          </a>
        </div>
        <div>
          <h5 className="mt-2">ID: {book.id}</h5>

          <div className="mb-3 mt-2">
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
            <label className="form-label">Price *</label>
            <input
              type="number"
              className="form-control"
              name="price"
              min="0"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              required
            />
            <div className="invalid-feedback">Please provide the price.</div>
            <div className="valid-feedback">Looks good!</div>
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

          <input type="hidden" name="id" value={book.id} />

          <div className="col-12">
            <button className="btn btn-primary" type="submit">
              Update Book
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditBookForm;
