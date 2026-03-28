import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../AuthPage.module.scss";
import Headers from '../../layout/header/Header.tsx';
import Footer from '../../layout/footer/Footer.tsx';
import { Routers } from "../../../constants/AppConstants.ts";
import { MdOutlineVpnKey } from "react-icons/md";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem("token")) {
            navigate(Routers.Dashboard);
        }
    }, [navigate]);

    const handleResetPassword = async () => {
        const response = await fetch(
            `${import.meta.env.VITE_MIGHTYBULL_BASE_URL}/v1/api/auth/reset-password?username=${encodeURIComponent(email)}&newPassword=${encodeURIComponent(newPassword)}`,
            { method: "POST" }
        );

        if (response.ok) {
            alert("OTP sent to your email.");
            setOtp("");
            setStep(2);
        } else {
            alert("Failed to send OTP. Check email & try again.");
        }
    };

    const handleVerifyOtp = async () => {
        const response = await fetch(
            `${import.meta.env.VITE_MIGHTYBULL_BASE_URL}/v1/api/auth/verify-otp?username=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}&password=${encodeURIComponent(newPassword)}`,
            { method: "POST" }
        );

        if (response.ok) {
            alert("Password reset successful. You can now login.");
            navigate(Routers.Login);
        } else {
            alert("Failed to verify OTP. Check OTP & try again.");
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
                            <span className={styles.visualBadge}>Account safety</span>
                            <h2 className={styles.visualTitle}>
                                Reset access{" "}
                                <span className={styles.visualAccent}>in two quick steps</span>
                            </h2>
                            <p className={styles.visualSub}>
                                We'll email you a one-time code. Choose a new password and
                                you're back to trading and tracking on MightyBull.
                            </p>
                            <div className={styles.chartMock}>
                                {[42, 58, 50, 72, 64, 80, 55].map((h, i) => (
                                    <div
                                        key={i}
                                        className={styles.chartBar}
                                        style={{ height: `${h}%` }}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className={styles.visualFoot}>
                            <span className={styles.visualTag}>Encrypted flow</span>
                            <span className={styles.visualTag}>OTP verified</span>
                        </div>
                    </aside>

                    <div className={styles.content}>
                        <div className={styles.card}>
                            <div className={styles.cardIcon} aria-hidden>
                                <MdOutlineVpnKey />
                            </div>
                            <p className={styles.eyebrow}>Password</p>
                            <h1 className={styles.title}>
                                {step === 1 ? "Forgot password" : "Enter OTP"}
                            </h1>
                            <p className={styles.lead}>
                                {step === 1
                                    ? "Use your registered email and pick a new password. We'll send a code to confirm it's you."
                                    : "Check your inbox for the OTP, then submit to complete your reset."}
                            </p>

                            {step === 1 ? (
                                <div className={styles.form}>
                                    <div className={styles.field}>
                                        <label className={styles.label} htmlFor="forgot-email">
                                            Email
                                        </label>
                                        <input
                                            id="forgot-email"
                                            className={styles.input}
                                            type="email"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            autoComplete="email"
                                            name="forgot-reset-email"
                                        />
                                    </div>
                                    <div className={styles.field}>
                                        <label className={styles.label} htmlFor="forgot-new-password">
                                            New password
                                        </label>
                                        <input
                                            id="forgot-new-password"
                                            className={styles.input}
                                            type="password"
                                            placeholder="New password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            autoComplete="new-password"
                                            name="forgot-new-password"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        className={styles.submit}
                                        onClick={handleResetPassword}
                                    >
                                        Send OTP
                                    </button>
                                </div>
                            ) : (
                                <div className={styles.form}>
                                    <p className={styles.stepHint}>
                                        OTP sent to <strong>{email}</strong>
                                    </p>
                                    <div className={styles.field}>
                                        <label className={styles.label} htmlFor="forgot-otp">
                                            One-time password
                                        </label>
                                        <input
                                            key="forgot-otp-verify-step"
                                            id="forgot-otp"
                                            className={styles.input}
                                            type="text"
                                            autoCapitalize="off"
                                            placeholder="Enter OTP"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            autoComplete="one-time-code"
                                            name="one-time-code"
                                            spellCheck={false}
                                            data-lpignore="true"
                                            data-1p-ignore="true"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        className={styles.submit}
                                        onClick={handleVerifyOtp}
                                    >
                                        Reset password
                                    </button>
                                </div>
                            )}

                            <div className={styles.linkRow}>
                                <Link to={Routers.Login} className={styles.link}>
                                    ← Back to log in
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default ForgotPassword;
