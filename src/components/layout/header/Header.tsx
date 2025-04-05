import { useState} from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Header.module.scss'
import MIGHTYBULL_LOGO from '../../../assets/mightybull2.png'
import {
    getTwoCapitalChars,
} from '../../../helpers/StringTransform.ts'

const loggedInUser = localStorage.getItem('name') ? localStorage.getItem('name') : '';

function Header() {

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();

    const handleProfileClick = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const handleLogin = () => navigate('/login');
    const handleSignup = () => navigate('/signup');

    const handleLogout = () => {
        localStorage.clear() // Clear token
        navigate("/login"); // Redirect to login page
    };

    const handleDashboardClick = () => {
        navigate('/dashboard');
    }

    return (
        <div className={styles['main-div']}>
            <div className={styles['header']}>
                <div className={styles['logo-options']} onClick={handleDashboardClick}>
                    <img className={styles['logo-img']} src={MIGHTYBULL_LOGO} alt="MIGHTYBULL-Logo" />
                    <span className={styles['logo-heading']}>Mighty Bull</span>
                </div>
                <div className={styles['search-options']}>
                    <input className={styles['search-box']} type="text" placeholder="Search Stock..."/>
                </div>
                <div className={styles['profile-options']}>
                    <span className={styles['profile-icon']} onClick={handleProfileClick}>
                        {getTwoCapitalChars(loggedInUser || 'U')}
                    </span>
                    {dropdownOpen && (
                        <div className={styles['dropdown']}>
                            {loggedInUser ? (
                                <>
                                    <div className={styles['dropdown-item']}>User Details</div>
                                    <div className={styles['dropdown-item']} onClick={handleLogout}>Logout</div>
                                </>
                            ) : (
                                <>
                                    <div className={styles['dropdown-item']} onClick={handleLogin}>Login</div>
                                    <div className={styles['dropdown-item']} onClick={handleSignup}>Sign Up</div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Header;