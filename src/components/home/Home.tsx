import Header from '../layout/header/Header.tsx';
import styles from './Home.module.scss';
import {useEffect} from "react";
import {useNavigate} from "react-router-dom"
import {Routers} from "../../constants/AppConstants.ts"

function Home() {

    const  navigate = useNavigate();

    // Redirect to dashboard if already logged in
    useEffect(() => {
        if (localStorage.getItem("token")) {
            navigate(Routers.Dashboard);
        }
    }, [navigate]);

    return (
        <>
            <Header/>
            <div className={styles['main-div']}>
                <div>
                    <h1>Welcome to MightyBull</h1>
                </div>
            </div>
        </>
    )
}

export default Home;