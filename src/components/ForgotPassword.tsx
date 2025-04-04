import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ForgotPassword.css";

const API_BASE = "http://localhost:8083/mightybull/v1/api/auth";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState(1);
    const navigate = useNavigate();

    // Step 1: Request password reset
    const handleResetPassword = async () => {
        const response = await fetch(`${API_BASE}/reset-password?username=${encodeURIComponent(email)}&newPassword=${encodeURIComponent(newPassword)}`, {
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
        const response = await fetch(`${API_BASE}/verify-otp?username=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}&password=${encodeURIComponent(newPassword)}`, {
            method: "POST",
        });

        if (response.ok) {
            alert("Password reset successful. You can now login.");
            navigate("/login");
        } else {
            alert("Failed to verify OTP. Check OTP & try again.");
        }
    };

    return (
        <div className="container">
            <h2>{step === 1 ? "Forgot Password" : "Verify OTP"}</h2>

            {step === 1 ? (
                <>
                    <input
                        className="input"
                        type="email"
                        placeholder="Enter your Email"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        className="input"
                        type="password"
                        placeholder="Enter New Password"
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button onClick={handleResetPassword} className="btn">
                        Send OTP
                    </button>
                </>
            ) : (
                <>
                    <input
                        className="input"
                        type="text"
                        placeholder="Enter OTP"
                        onChange={(e) => setOtp(e.target.value)}
                    />
                    <button onClick={handleVerifyOtp} className="btn btn-green">
                        Verify OTP & Reset Password
                    </button>
                </>
            )}

            <p className="text-link" onClick={() => navigate("/login")}>
                Back to Login
            </p>
        </div>
    );
}

export default ForgotPassword;
