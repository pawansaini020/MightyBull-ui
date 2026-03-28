import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../AuthPage.module.scss";
import Headers from '../../layout/header/Header.tsx';
import Footer from '../../layout/footer/Footer.tsx';
import { Routers } from "../../../constants/AppConstants.ts";
import { MdLockOutline } from "react-icons/md";

function Login() {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem("token")) {
            navigate(Routers.Dashboard);
        }
    }, [navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const response = await fetch(
            `${import.meta.env.VITE_MIGHTYBULL_BASE_URL}/v1/api/auth/login?` +
                new URLSearchParams({ username: formData.email, password: formData.password }),
            { method: "POST" }
        );

        setLoading(false);

        if (response.ok) {
            const data = (await response.json()).data;
            localStorage.setItem("token", data.token);
            localStorage.setItem("name", data.name);
            navigate(Routers.Dashboard);
        } else {
            alert("Invalid credentials! Please try again.");
        }
    };

    return (
        <>
            <Headers />
            <div className={styles.page}>
                <div className={styles.shell}>
                    <aside className={styles.visual} aria-hidden>
                        <div className={styles.visualGlow} />
                        <div className={styles.visualInner}>
                            <span className={styles.visualBadge}>MightyBull</span>
                            <h2 className={styles.visualTitle}>
                                Welcome back to{" "}
                                <span className={styles.visualAccent}>your portfolio</span>
                            </h2>
                            <p className={styles.visualSub}>
                                Sign in to track NSE &amp; BSE holdings, mutual funds, and ETFs in one
                                calm, focused workspace.
                            </p>
                            <div className={styles.chartMock}>
                                {[38, 62, 48, 78, 55, 88, 70].map((h, i) => (
                                    <div
                                        key={i}
                                        className={styles.chartBar}
                                        style={{ height: `${h}%` }}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className={styles.visualFoot}>
                            <span className={styles.visualTag}>NSE</span>
                            <span className={styles.visualTag}>BSE</span>
                            <span className={styles.visualTag}>Secure access</span>
                        </div>
                    </aside>

                    <div className={styles.content}>
                        <div className={styles.card}>
                            <div className={styles.cardIcon} aria-hidden>
                                <MdLockOutline />
                            </div>
                            <p className={styles.eyebrow}>Account</p>
                            <h1 className={styles.title}>Log in</h1>
                            <p className={styles.lead}>
                                Enter your email and password to continue to your dashboard.
                            </p>
                            <form onSubmit={handleLogin} className={styles.form} noValidate>
                                <div className={styles.field}>
                                    <label className={styles.label} htmlFor="login-email">
                                        Email
                                    </label>
                                    <input
                                        id="login-email"
                                        type="email"
                                        name="email"
                                        className={styles.input}
                                        placeholder="you@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        autoComplete="email"
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label} htmlFor="login-password">
                                        Password
                                    </label>
                                    <input
                                        id="login-password"
                                        type="password"
                                        name="password"
                                        className={styles.input}
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        autoComplete="current-password"
                                    />
                                </div>
                                <button type="submit" className={styles.submit} disabled={loading}>
                                    {loading ? "Signing in…" : "Log in"}
                                </button>
                            </form>
                            <div className={styles.linkRow}>
                                <Link to={Routers.ForgotPassword} className={styles.link}>
                                    Forgot password?
                                </Link>
                                <p className={styles.linkMuted}>
                                    New to MightyBull?{" "}
                                    <Link to={Routers.Signup}>Create an account</Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default Login;
