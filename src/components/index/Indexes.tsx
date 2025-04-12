// import {useNavigate} from 'react-router-dom';
import Headers from "../layout/header/Header.tsx";
import styles from "./Indexes.module.scss";

function Indexes() {

    return (
        <>
            <Headers />
            <div className={styles['header']}>
                Welcome to the Stock App.
            </div>
        </>
    )
}
export default Indexes;