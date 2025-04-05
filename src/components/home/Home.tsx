import Header from '../layout/header/Header.tsx';
import styles from './Header.module.scss';
import {useEffect} from "react";
import {useNavigate} from "react-router-dom"

function Home() {

    const  navigate = useNavigate();

    // Redirect to dashboard if already logged in
    useEffect(() => {
        if (localStorage.getItem("token")) {
            navigate("/dashboard");
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