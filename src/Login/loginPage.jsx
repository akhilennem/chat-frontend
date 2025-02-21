import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./LoginPage.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  // const url='https://m4vx17k1-5000.inc1.devtunnels.ms/'
  const url='http://localhost:5000/'
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      axios
        .post(url+"user/login", {
          email: email,
          password: password,
        })
        .then((response) => {
          if (response.data.success === true) {
            setSuccessMessage("Login Successful! 🎉");
  
            // Save user info
            const { name, email } = response.data.data;  // Assuming response contains user data
            localStorage.setItem("userName", name);
            localStorage.setItem("userEmail", email);
  
            setTimeout(() => {
              navigate("/chatHome"); // Redirect to /chat after successful login
            }, 1000);
          } else {
            setSuccessMessage('Invalid Username or Password..');
          }
        })
        .catch((error) => console.log(error.message));
    } catch (err) {
      console.log(err.message);
    }
  };
  

  const handleSignupClick = () => {
    navigate("/signup"); // Redirect to signup page on button click
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
        {successMessage && <p className="success-message">{successMessage}</p>}
        <button onClick={handleSignupClick}>Signup</button> {/* Signup Button */}
      </div>
    </div>
  );
}
