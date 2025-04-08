import {useEffect, useRef, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Header.module.scss'
import MIGHTYBULL_LOGO from '../../../assets/mightybull2.png'
import { getTwoCapitalChars } from '../../../helpers/StringTransform.ts'
import {Routers} from "../../../constants/AppConstants.ts";
import StockSearch from "../../global/search/StockSearch.tsx";

function Header() {

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const dropdownOpenRef = useRef<HTMLDivElement>(null);
    const loggedInUser = localStorage.getItem('name') ? localStorage.getItem('name') : '';

    const handleProfileClick = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const handleLogin = () => navigate(Routers.Login);
    const handleSignup = () => navigate(Routers.Signup);

    const handleLogout = () => {
        localStorage.clear() // Clear token
        navigate(Routers.Login); // Redirect to login page
    };

    const handleDashboardClick = () => {
        navigate(Routers.Dashboard);
    }

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Node;
            if (
                dropdownOpenRef.current && !dropdownOpenRef.current.contains(target)
            ) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleStockSearch = (stock: { name: string; stockId: string; }) => {
        console.log("Search triggered for redirecting ot this stock page: ", stock);
        navigate(Routers.StockWidgetDetails.replace(':stockId', encodeURIComponent(stock.stockId)))
    };

    return (
        <div className={styles['main-div']}>
            <div className={styles['header']}>
                <div className={styles['logo-options']} onClick={handleDashboardClick}>
                    <img className={styles['logo-img']} src={MIGHTYBULL_LOGO} alt="MIGHTYBULL-Logo" />
                    <span className={styles['logo-heading']}>Mighty Bull</span>
                </div>
                {/*<div className={styles['search-options']}>*/}
                {/*    <input className={styles['search-box']} type="text" placeholder="Search Stock..." onClick={handleSearchClick} />*/}
                {/*</div>*/}
                {loggedInUser && <StockSearch onSearch={handleStockSearch} />}
                <div className={styles['profile-options']}>
                    <span className={styles['profile-icon']} onClick={handleProfileClick}>
                        {getTwoCapitalChars(loggedInUser || 'U')}
                    </span>
                    {dropdownOpen && (
                        <div className={styles['dropdown']} ref={dropdownOpenRef}>
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