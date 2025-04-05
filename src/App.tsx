import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom'
import './App.css'
import './styles/variables.scss';
import Home from "./components/home/Home"
import Signup from "./components/user/signup/Signup";
import Login from "./components/user/login/Login";
import ForgotPassword from "./components/user/forgot-password/ForgotPassword";
import Dashboard from "./components/dashboard/Dashboard";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    {/* Add other protected pages here */}
                </Route>

                {/* Redirect unknown routes to login */}
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    )
}

export default App
