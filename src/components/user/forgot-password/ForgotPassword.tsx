import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ForgotPassword.module.scss";
import Header from '../../layout/header/Header.tsx';
import {Routers} from "../../../constants/AppConstants.ts"

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState(1);
    const navigate = useNavigate();

    // Redirect to dashboard if already logged in
    useEffect(() => {
        if(localStorage.getItem('token')) {
            navigate(Routers.Dashboard);
        }
    }, [navigate]);

    // Step 1: Request password reset
    const handleResetPassword = async () => {
        const response = await fetch(`${import.meta.env.VITE_MIGHTYBULL_BASE_URL}/v1/api/auth/reset-password?username=${encodeURIComponent(email)}&newPassword=${encodeURIComponent(newPassword)}`, {
            method: "POST",
        });

        if (response.ok) {
            alert("OTP sent to your email.");
            setStep(2); // Move to OTP verification step
        } else {
            alert("Failed to send OTP. Check email & try again.");
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async () => {
        const response = await fetch(`${import.meta.env.VITE_MIGHTYBULL_BASE_URL}/v1/api/auth/verify-otp?username=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}&password=${encodeURIComponent(newPassword)}`, {
            method: "POST",
        });

        if (response.ok) {
            alert("Password reset successful. You can now login.");
            navigate(Routers.Login);
        } else {
            alert("Failed to verify OTP. Check OTP & try again.");
        }
    };

    return (
        <>
            <Header/>
            <div className={styles['container']}>
                <h2>{step === 1 ? "Forgot Password" : "Verify OTP"}</h2>

                {step === 1 ? (
                    <>
                        <input
                            className={styles['input']}
                            type="email"
                            placeholder="Enter your Email"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <input
                            className={styles['input']}
                            type="password"
                            placeholder="Enter New Password"
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <button onClick={handleResetPassword} className={styles['btn']}>
                            Send OTP
                        </button>
                    </>
                ) : (
                    <>
                        <input
                            className={styles['input']}
                            type="text"
                            placeholder="Enter OTP"
                            onChange={(e) => setOtp(e.target.value)}
                        />
                        <button onClick={handleVerifyOtp} className={styles['btn btn-green']}>
                            Verify OTP & Reset Password
                        </button>
                    </>
                )}

                <p className={styles['text-link']} onClick={() => navigate("/login")}>
                    Back to Login
                </p>
            </div>
        </>
    );
}

export default ForgotPassword;
