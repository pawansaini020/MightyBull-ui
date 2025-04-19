import styles from './MutualFundDashboard.module.scss';
import Headers from '../../layout/header/Header.tsx';

function MutualFundDashboard() {
    return (
        <>
            <Headers />
            <div className={styles['main-div']}>
                <h3>Welcome to mutual funds.</h3>
            </div>
        </>
    )
}

export default MutualFundDashboard;