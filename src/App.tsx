import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom'
import './App.css'
import './styles/variables.scss';
import './styles/font.scss';
import Home from "./components/home/Home"
import Signup from "./components/user/signup/Signup";
import Login from "./components/user/login/Login";
import ForgotPassword from "./components/user/forgot-password/ForgotPassword";
import Dashboard from "./components/dashboard/Dashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import StockWidgets from "./components/stock/widget/StockWidgets.tsx";
import StockWidgetDetails from "./components/stock/widget-details/StockWidgetDetails.tsx";
import {Routers} from "./constants/AppConstants.ts";

function App() {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path={Routers.Home} element={<Home />} />
                <Route path={Routers.Signup} element={<Signup />} />
                <Route path={Routers.Login} element={<Login />} />
                <Route path={Routers.ForgotPassword} element={<ForgotPassword />} />
                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                    {/* Add other protected pages here */}
                    <Route path={Routers.Dashboard} element={<Dashboard />} />
                    <Route path={Routers.StockWidgets} element={<StockWidgets />}></Route>
                    <Route path={Routers.StockWidgetDetails} element={<StockWidgetDetails />}></Route>
                </Route>

                {/* Redirect unknown routes to login */}
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    )
}

export default App
