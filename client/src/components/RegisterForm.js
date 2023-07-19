import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const RegisterForm = ({ onServerMassage }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [registrationError, setRegistrationError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    // Perform form validation
    if (!email) {
      setEmailError("Email is required");
      return;
    } else {
      setEmailError("");
    }

    if (!password) {
      setPasswordError("Password is required");
      return;
    } else if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return;
    } else {
      setPasswordError("");
    }

    // Send the registration request
    try {
      const response = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        setEmail("");
        setPassword("");
        setRegistrationError("");
        const data = await response.json();
        localStorage.setItem("token", data.token); // Store the token in local storage
        navigate("/");
        window.location.reload();
        onServerMassage("Registered Successfully");
      } else {
        const errorData = await response.json();
        setRegistrationError(errorData.message);
      }
    } catch (error) {
      console.error(error);
      setRegistrationError("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="container d-flex justify-content-center mt-4">
      <form
        id="registerForm"
        onSubmit={handleRegister}
        className="needs-validation w-50 mt-4"
        noValidate
      >
        <h3>Register</h3>
        <div className="mb-3 mt-4">
          <label htmlFor="exampleInputEmail1" className="form-label">
            Email address
          </label>
          <input
            type="email"
            className={`form-control ${emailError ? "is-invalid" : ""}`}
            id="exampleInputEmail1"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {emailError && <div className="invalid-feedback">{emailError}</div>}
        </div>
        <div className="mb-3">
          <label htmlFor="exampleInputPassword1" className="form-label">
            Password
          </label>
          <input
            type="password"
            className={`form-control ${passwordError ? "is-invalid" : ""}`}
            id="exampleInputPassword1"
            minLength="8"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {passwordError && (
            <div className="invalid-feedback">{passwordError}</div>
          )}
        </div>
        {registrationError && (
          <div className="alert alert-danger" role="alert">
            {registrationError}
          </div>
        )}
        <button type="submit" className="btn btn-primary">
          Register
        </button>
        <div className="mt-3">
          Already have an account? <Link to="/login">Log In</Link>
        </div>
        <div className="mt-3">
          <Link to="/" className="btn btn-secondary">
            Go Back
          </Link>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
