import {useEffect, useRef, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Header.module.scss'
import MIGHTYBULL_LOGO from '../../../assets/mightybull2.png'
import { getTwoCapitalChars } from '../../../helpers/StringTransform.ts'
import {Routers} from "../../../constants/AppConstants.ts";
import StockSearch from "../../global/search/StockSearch.tsx";
import TabSwitcher from "../../global/tab-switch/TabSwitcher.tsx";

function Header() {

    const TABS = [
        { key: 'STOCK', label: 'Stocks' },
        { key: 'MUTUAL_FUND', label: 'Mutual Fund' },
    ];

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const dropdownOpenRef = useRef<HTMLDivElement>(null);
    const loggedInUser = localStorage.getItem('name') ? localStorage.getItem('name') : '';
    const [activeTab, setActiveTab] = useState(TABS[0].key);

    const handleProfileClick = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const handleLogin = () => navigate(Routers.Login);
    const handleSignup = () => navigate(Routers.Signup);

    const handleLogout = () => {
        localStorage.clear() // Clear token
        navigate(Routers.Home); // Redirect to login page
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

    const handleTabsClick = () => {
        if(activeTab == TABS[0].key) {
            navigate(Routers.Dashboard);
        } else if(activeTab == TABS[1].key) {
            navigate(Routers.MutualFundDashboard);
        }
    }

    // useEffect(() => {
    //     console.log("Active tab: ", activeTab);
    //     if(activeTab == TABS[0].key) {
    //         navigate(Routers.Dashboard);
    //     } else if(activeTab == TABS[1].key) {
    //         navigate(Routers.Indices);
    //     }
    // }, [activeTab]);

    return (
        <div className={styles['main-div']}>
            <div className={styles['header']}>
                <div className={styles['logo-options']}>
                    <img className={styles['logo-img']}
                         src={MIGHTYBULL_LOGO} alt="MIGHTYBULL-Logo"
                         onClick={handleDashboardClick}
                    />
                    <span className={styles['logo-heading']} onClick={handleDashboardClick}>MightyBull</span>
                </div>
                {loggedInUser && (
                    <>
                        <div className={styles['tabs-section']} onClick={handleTabsClick}>
                            <TabSwitcher activeTab={activeTab} setActiveTab={setActiveTab} tabs={TABS} />
                        </div>
                        <StockSearch onSearch={handleStockSearch} />
                    </>
                )}
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