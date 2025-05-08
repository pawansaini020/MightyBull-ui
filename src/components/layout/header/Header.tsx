import {useEffect, useRef, useState, useCallback, useMemo} from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Header.module.scss';
import MIGHTYBULL_LOGO from '../../../assets/mightybull2.png';
import { getTwoCapitalChars } from '../../../helpers/StringTransform.ts';
import {Routers} from "../../../constants/AppConstants.ts";
import StockSearch from "../../global/search/StockSearch.tsx";
import TabSwitcher from "../../global/tab-switch/TabSwitcher.tsx";

const isMobile = () => window.innerWidth <= 768;

interface Tab {
    key: string;
    label: string;
}

interface Stock {
    name: string;
    stockId: string;
}

const TABS: Tab[] = [
    { key: 'STOCK', label: 'Stock' },
    { key: 'MUTUAL_FUND', label: isMobile() ? 'MF' : 'Mutual Fund' },
];

function Header({currentTab}: {currentTab?: string | null}) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const dropdownOpenRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState(currentTab);

    const loggedInUser = useMemo(() => localStorage.getItem('name') || '', []);

    const handleProfileClick = useCallback(() => {
        setDropdownOpen(prev => !prev);
    }, []);

    const handleLogin = useCallback(() => navigate(Routers.Login), [navigate]);
    const handleSignup = useCallback(() => navigate(Routers.Signup), [navigate]);
    const handleDashboardClick = useCallback(() => navigate(Routers.Dashboard), [navigate]);

    const handleLogout = useCallback(() => {
        localStorage.clear();
        navigate(Routers.Home);
    }, [navigate]);

    const handleUserDetails = useCallback(() => {
        navigate(Routers.UserProfilePage);
    }, [navigate]);

    const handleStockSearch = useCallback((stock: Stock) => {
        navigate(Routers.StockWidgetDetails.replace(':stockId', encodeURIComponent(stock.stockId)));
    }, [navigate]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (dropdownOpenRef.current && !dropdownOpenRef.current.contains(target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (activeTab === TABS[0].key) {
            navigate(Routers.Dashboard);
        } else if (activeTab === TABS[1].key) {
            navigate(Routers.MutualFundDashboard);
        }
    }, [activeTab, navigate]);

    const userInitials = useMemo(() => getTwoCapitalChars(loggedInUser || 'U'), [loggedInUser]);

    return (
        <div className={styles['main-div']}>
            <div className={styles['header']}>
                <div className={styles['logo-section']}>
                    <img 
                        className={styles['logo-img']}
                        src={MIGHTYBULL_LOGO} 
                        alt="MIGHTYBULL-Logo"
                        onClick={handleDashboardClick}
                    />
                    <span className={styles['logo-heading']} onClick={handleDashboardClick}>
                        MightyBull
                    </span>
                </div>
                <div className={styles['logged-in-section']}>
                    {loggedInUser && (
                        <>
                            <div className={styles['tabs-section']}>
                                {activeTab && (
                                    <TabSwitcher 
                                        activeTab={activeTab} 
                                        setActiveTab={setActiveTab} 
                                        tabs={TABS} 
                                    />
                                )}
                            </div>
                            <div className={styles['stock-search-section']}>
                                <StockSearch onSearch={handleStockSearch} />
                            </div>
                        </>
                    )}
                </div>
                <div className={styles['profile-section']}>
                    <span className={styles['profile-icon']} onClick={handleProfileClick}>
                        {userInitials}
                    </span>
                    {dropdownOpen && (
                        <div className={styles['dropdown']} ref={dropdownOpenRef}>
                            {loggedInUser ? (
                                <>
                                    <div className={styles['dropdown-item']} onClick={handleUserDetails}>User Details</div>
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
    );
}

export default Header;