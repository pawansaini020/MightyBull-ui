import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../AuthPage.module.scss";
import Headers from '../../layout/header/Header.tsx';
import Footer from '../../layout/footer/Footer.tsx';
import { Routers } from "../../../constants/AppConstants.ts";
import { MdPersonAddAlt } from "react-icons/md";

const Signup = () => {
    const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "" });
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState("");
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

    const handleSignup = async () => {
        if (!formData.name || !formData.email || !formData.phone || !formData.password) {
            alert("All fields are required.");
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_MIGHTYBULL_BASE_URL}/v1/api/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            if (!response.ok) throw new Error("Signup failed!");
            setOtpSent(true);
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) {
            alert("Please enter the OTP.");
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(
                `${import.meta.env.VITE_MIGHTYBULL_BASE_URL}/v1/api/auth/verify-otp?username=${formData.email}&otp=${otp}&password=${formData.password}`,
                { method: "POST" }
            );
            if (!response.ok) throw new Error("OTP verification failed!");
            alert("Signup successful!");
            navigate(Routers.Login);
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
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
                            <span className={styles.visualBadge}>Get started</span>
                            <h2 className={styles.visualTitle}>
                                Start investing across{" "}
                                <span className={styles.visualAccent}>India's markets</span>
                            </h2>
                            <p className={styles.visualSub}>
                                Open your MightyBull account to explore stocks, mutual funds, and
                                ETFs—with a clean, distraction-free experience.
                            </p>
                            <div className={styles.chartMock}>
                                {[45, 70, 52, 85, 60, 92, 68].map((h, i) => (
                                    <div
                                        key={i}
                                        className={styles.chartBar}
                                        style={{ height: `${h}%` }}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className={styles.visualFoot}>
                            <span className={styles.visualTag}>₹0 maintenance</span>
                            <span className={styles.visualTag}>NSE · BSE</span>
                        </div>
                    </aside>

                    <div className={styles.content}>
                        <div className={styles.card}>
                            <div className={styles.cardIcon} aria-hidden>
                                <MdPersonAddAlt />
                            </div>
                            <p className={styles.eyebrow}>Join MightyBull</p>
                            <h1 className={styles.title}>
                                {otpSent ? "Verify your email" : "Create account"}
                            </h1>
                            <p className={styles.lead}>
                                {otpSent
                                    ? "We sent a one-time code to your email. Enter it below to activate your account."
                                    : "Fill in your details to register. You'll confirm with an OTP sent to your email."}
                            </p>

                            {!otpSent ? (
                                <div className={styles.form}>
                                    <div className={styles.field}>
                                        <label className={styles.label} htmlFor="signup-name">
                                            Full name
                                        </label>
                                        <input
                                            id="signup-name"
                                            name="name"
                                            type="text"
                                            className={styles.input}
                                            placeholder="Your name"
                                            onChange={handleChange}
                                            autoComplete="name"
                                        />
                                    </div>
                                    <div className={styles.field}>
                                        <label className={styles.label} htmlFor="signup-email">
                                            Email
                                        </label>
                                        <input
                                            id="signup-email"
                                            name="email"
                                            type="email"
                                            className={styles.input}
                                            placeholder="you@example.com"
                                            onChange={handleChange}
                                            autoComplete="email"
                                        />
                                    </div>
                                    <div className={styles.field}>
                                        <label className={styles.label} htmlFor="signup-phone">
                                            Phone
                                        </label>
                                        <input
                                            id="signup-phone"
                                            name="phone"
                                            type="tel"
                                            className={styles.input}
                                            placeholder="10-digit mobile"
                                            onChange={handleChange}
                                            autoComplete="tel"
                                        />
                                    </div>
                                    <div className={styles.field}>
                                        <label className={styles.label} htmlFor="signup-password">
                                            Password
                                        </label>
                                        <input
                                            id="signup-password"
                                            name="password"
                                            type="password"
                                            className={styles.input}
                                            placeholder="Create a strong password"
                                            onChange={handleChange}
                                            autoComplete="new-password"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        className={styles.submit}
                                        onClick={handleSignup}
                                        disabled={loading}
                                    >
                                        {loading ? "Sending…" : "Continue"}
                                    </button>
                                </div>
                            ) : (
                                <div className={styles.form}>
                                    <p className={styles.stepHint}>
                                        Code sent to <strong>{formData.email}</strong>
                                    </p>
                                    <div className={styles.field}>
                                        <label className={styles.label} htmlFor="signup-otp">
                                            One-time password
                                        </label>
                                        <input
                                            id="signup-otp"
                                            type="text"
                                            className={styles.input}
                                            placeholder="Enter OTP"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            autoComplete="one-time-code"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        className={styles.submit}
                                        onClick={handleVerifyOtp}
                                        disabled={loading}
                                    >
                                        {loading ? "Verifying…" : "Verify & finish"}
                                    </button>
                                </div>
                            )}

                            <div className={styles.linkRow}>
                                <p className={styles.linkMuted}>
                                    Already have an account? <Link to={Routers.Login}>Log in</Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Signup;
