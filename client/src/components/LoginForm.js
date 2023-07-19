import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const LoginForm = ({ onServerMassage }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState("");

  const validateForm = async (event) => {
    event.preventDefault();

    if (!email) {
      setEmailError("Please enter a valid email address.");
    } else {
      setEmailError("");
    }

    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters long.");
    } else {
      setPasswordError("");
    }

    if (email && password.length >= 8) {
      setIsSubmitting(true);
      try {
        const response = await axios.post("http://localhost:5000/login", {
          email,
          password,
        });
        localStorage.setItem("token", response.data.token);
        setIsSubmitting(false);
        navigate("/");
        window.location.reload();
        onServerMassage("Login Successfully");
      } catch (error) {
        console.error(error);
        setIsSubmitting(false);
        setLoginError("Invalid email or password.");
      }
    }
  };

  return (
    <div className="container d-flex justify-content-center mt-4">
      <form
        id="loginForm"
        onSubmit={validateForm}
        className="needs-validation w-50 mt-4"
        noValidate
      >
        <h3>Login</h3>
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
        {loginError && <div className="text-danger">{loginError}</div>}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
        <div className="mt-3">
          Don't have an account? <Link to="/register">Register</Link>
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

export default LoginForm;
