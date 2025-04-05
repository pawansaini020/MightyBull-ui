import { useNavigate } from "react-router-dom";

import "./Home.css";

function Home() {
    const navigate = useNavigate()

    return (
        <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
            <h1 className="text-3xl font-bold mb-5">Welcome to MightyBull</h1>
            <button className="btn" onClick={() => navigate("/signup")}>Signup</button>
            <button className="btn" onClick={() => navigate("/login")}>Login</button>
        </div>
    )
}

export default Home;