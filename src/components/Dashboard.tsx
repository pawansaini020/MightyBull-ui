import { useNavigate } from "react-router-dom";

function Dashboard() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token"); // Clear token
        navigate("/login"); // Redirect to login page
    };

    return (
        <div className="p-4 text-center">
            <h2 className="text-2xl font-bold">Welcome to MightyBull Dashboard 🎉</h2>
            <p>You have successfully logged in.</p>

            <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 mt-4 rounded hover:bg-red-700 transition"
            >
                Logout
            </button>
        </div>
    );
}

export default Dashboard;
