import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Signup.css";

const API_BASE = "http://localhost:8083/mightybull/v1/api/auth";

const Signup = () => {
    const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "" });
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

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
            const response = await fetch(`${API_BASE}/signup`, {
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
                `${API_BASE}/verify-otp?username=${formData.email}&otp=${otp}&password=${formData.password}`,
                { method: "POST" }
            );
            if (!response.ok) throw new Error("OTP verification failed!");
            alert("Signup successful!");
            navigate("/login");
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <h2>{otpSent ? "Verify OTP" : "Signup"}</h2>
            {!otpSent ? (
                <>
                    <input name="name" type="text" className="input" placeholder="Full Name" onChange={handleChange} />
                    <input name="email" type="email" className="input" placeholder="Email" onChange={handleChange} />
                    <input name="phone" type="tel" className="input" placeholder="Phone" onChange={handleChange} />
                    <input name="password" type="password" className="input" placeholder="Password" onChange={handleChange} />
                    <button onClick={handleSignup} className="btn" disabled={loading}>
                        {loading ? "Signing Up..." : "Sign Up"}
                    </button>
                </>
            ) : (
                <>
                    <input type="text" className="input" placeholder="Enter OTP" onChange={(e) => setOtp(e.target.value)} />
                    <button onClick={handleVerifyOtp} className="btn" disabled={loading}>
                        {loading ? "Verifying OTP..." : "Verify OTP"}
                    </button>
                </>
            )}
            <p className="text-link" onClick={() => navigate("/login")}>
                Already have an account? Login
            </p>
        </div>
    );
};

export default Signup;
