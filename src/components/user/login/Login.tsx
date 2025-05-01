import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Login.module.scss";
import Headers from '../../layout/header/Header.tsx';
import {Routers} from "../../../constants/AppConstants.ts"

function Login() {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Redirect to dashboard if already logged in
    useEffect(() => {
        if (localStorage.getItem("token")) {
            navigate(Routers.Dashboard);
        }
    }, [navigate]);

    // Handle input changes dynamically
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle form submission
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const response = await fetch(`${import.meta.env.VITE_MIGHTYBULL_BASE_URL}/v1/api/auth/login?` +
            new URLSearchParams({ username: formData.email, password: formData.password }),
            { method: "POST" }
        );

        setLoading(false);

        if (response.ok) {
            const data = (await response.json()).data;
            localStorage.setItem("token", data.token);
            localStorage.setItem("name", data.name);
            console.log(data);
            navigate(Routers.Dashboard);
        } else {
            alert("Invalid credentials! Please try again.");
        }
    };

    return (
        <>
            <Headers currentTab={null}/>
            <div className={styles['auth-container']}>
                <h2 className={styles['auth-title']}>Login</h2>
                <form onSubmit={handleLogin} className={styles['auth-form']}>
                    <input
                        type="email"
                        name="email"
                        className={styles['auth-input']}
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        autoComplete="new-password"
                    />
                    <input
                        type="password"
                        name="password"
                        className={styles['auth-input']}
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        autoComplete="new-password"
                    />
                    <button type="submit" className={styles['auth-button']} disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
                <Link to={Routers.ForgotPassword} className={styles['auth-link']}>
                    Forgot Password?
                </Link>
                <Link to={Routers.Signup} className={styles['auth-link']}>
                    Don't have an account? Sign Up
                </Link>
            </div>
        </>
    );
}

export default Login;
