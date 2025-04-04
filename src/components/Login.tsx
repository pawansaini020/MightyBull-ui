import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // ✅ Redirect to dashboard if already logged in
    useEffect(() => {
        if (localStorage.getItem("token")) {
            navigate("/dashboard");
        }
    }, [navigate]);

    // ✅ Handle input changes dynamically
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // ✅ Handle form submission
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const response = await fetch(`http://localhost:8083/mightybull/v1/api/auth/login?` +
            new URLSearchParams({ username: formData.email, password: formData.password }),
            { method: "POST" }
        );

        setLoading(false);

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem("token", data.token);
            navigate("/dashboard");
        } else {
            alert("Invalid credentials! Please try again.");
        }
    };

    return (
        <div className="auth-container">
            <h2 className="auth-title">Login</h2>
            <form onSubmit={handleLogin} className="auth-form">
                <input
                    type="email"
                    name="email"
                    className="auth-input"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    name="password"
                    className="auth-input"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                <button type="submit" className="auth-button" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
            <Link to="/forgot-password" className="auth-link">
                Forgot Password?
            </Link>
            <Link to="/signup" className="auth-link">
                Don't have an account? Sign Up
            </Link>
        </div>
    );
}

export default Login;
