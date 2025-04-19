import { Navigate, Outlet } from "react-router-dom";
import {Routers} from "../constants/AppConstants.ts";

const ProtectedRoute = () => {
    const token = localStorage.getItem("token");

    return token ? <Outlet /> : <Navigate to={Routers.Home} replace />;
};

export default ProtectedRoute;
