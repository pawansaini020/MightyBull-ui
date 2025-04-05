import styles from './Header.module.scss'
import MIGHTYBULL_LOGO from '../../../assets/mightybull2.png'
import {
    getTwoCapitalChars,
} from '../../../helpers/StringTransform.ts'

const loggedInUser = 'Pawan Saini'

function Header() {

    return (
        <div className={styles['main-div']}>
            <div className={styles['header']}>
                <div className={styles['logo-options']}>
                    <img className={styles['logo-img']} src={MIGHTYBULL_LOGO} alt="MIGHTYBULL-Logo" />
                    <span className={styles['logo-heading']}>Mighty Bull</span>
                </div>
                <div className={styles['search-options']}>
                    <input className={styles['search-box']} type="text" placeholder="Search Stock..."/>
                </div>
                <div className={styles['profile-options']}>
                    <span className={styles["profile-icon"]}>
                        {getTwoCapitalChars(loggedInUser)}
                    </span>
                </div>
            </div>
        </div>
    )
}

export default Header;