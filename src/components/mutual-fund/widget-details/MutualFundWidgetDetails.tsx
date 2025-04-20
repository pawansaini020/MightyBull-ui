import styles from "./MutualFundWidgetDetails.module.scss"
import Headers from "../../layout/header/Header.tsx";
import {useParams} from "react-router-dom";

function MutualFundWidgetDetails () {

    const {mutualFundId} = useParams();

    return (
        <>
            <Headers />
            <div className={styles['main-div']}>
                <div className={styles['mutual-fund-container']}>Welcome to mutual fund details page: {mutualFundId}</div>
            </div>
        </>
    )
}
export default MutualFundWidgetDetails;