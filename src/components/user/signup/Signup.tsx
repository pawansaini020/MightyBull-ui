import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Signup.module.scss";
import Header from '../../layout/header/Header.tsx';
import styles from "../forgot-password/ForgotPassword.module.scss";
import {Routers} from "../../../constants/AppConstants.ts"

const Signup = () => {
    const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "" });
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Redirect to dashboard if already logged in
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
            <Header/>
            <div className={styles['container']}>
                <h2>{otpSent ? "Verify OTP" : "Signup"}</h2>
                {!otpSent ? (
                    <>
                        <input name="name" type="text" className={styles['input']} placeholder="Full Name" onChange={handleChange} autoComplete="off"/>
                        <input name="email" type="email" className={styles['input']} placeholder="Email" onChange={handleChange} autoComplete="off"/>
                        <input name="phone" type="tel" className={styles['input']} placeholder="Phone" onChange={handleChange} autoComplete="off"/>
                        <input name="password" type="password" className={styles['input']} placeholder="Password" onChange={handleChange} autoComplete="new-password"/>
                        <button onClick={handleSignup} className={styles['btn']} disabled={loading}>
                            {loading ? "Signing Up..." : "Sign Up"}
                        </button>
                    </>
                ) : (
                    <>
                        <input type="text" className={styles['input']} placeholder="Enter OTP" onChange={(e) => setOtp(e.target.value)} autoComplete="off"/>
                        <button onClick={handleVerifyOtp} className={styles['btn']} disabled={loading}>
                            {loading ? "Verifying OTP..." : "Verify OTP"}
                        </button>
                    </>
                )}
                <p className={styles['text-link']} onClick={() => navigate(Routers.Login)}>
                    Already have an account? Login
                </p>
            </div>
        </>
    );
};

export default Signup;
