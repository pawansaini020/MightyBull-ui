import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Header.module.scss';
import MIGHTYBULL_LOGO from '../../../assets/mightybull2.png';
import { getTwoCapitalChars } from '../../../helpers/StringTransform.ts';
import { Routers } from '../../../constants/AppConstants.ts';
import StockSearch from '../../global/search/StockSearch.tsx';
import TabSwitcher from '../../global/tab-switch/TabSwitcher.tsx';
import { MdExpandMore } from 'react-icons/md';

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

function Header({ currentTab }: { currentTab?: string | null }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const profileMenuRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState(currentTab ?? undefined);

    const loggedInUser = useMemo(() => localStorage.getItem('name') || '', []);

    useEffect(() => {
        if (currentTab !== undefined && currentTab !== null) {
            setActiveTab(currentTab);
        }
    }, [currentTab]);

    const handleLogoNav = useCallback(() => {
        navigate(loggedInUser ? Routers.Dashboard : Routers.Home);
    }, [navigate, loggedInUser]);

    const toggleDropdown = useCallback(() => {
        setDropdownOpen((prev) => !prev);
    }, []);

    const handleLogin = useCallback(() => {
        setDropdownOpen(false);
        navigate(Routers.Login);
    }, [navigate]);

    const handleSignup = useCallback(() => {
        setDropdownOpen(false);
        navigate(Routers.Signup);
    }, [navigate]);

    const handleLogout = useCallback(() => {
        setDropdownOpen(false);
        localStorage.clear();
        navigate(Routers.Home);
    }, [navigate]);

    const handleUserDetails = useCallback(() => {
        setDropdownOpen(false);
        navigate(Routers.UserProfilePage);
    }, [navigate]);

    const handleStockSearch = useCallback(
        (stock: Stock) => {
            navigate(Routers.StockWidgetDetails.replace(':stockId', encodeURIComponent(stock.stockId)));
        },
        [navigate]
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!dropdownOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setDropdownOpen(false);
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [dropdownOpen]);

    useEffect(() => {
        if (activeTab === TABS[0].key) {
            navigate(Routers.Dashboard);
        } else if (activeTab === TABS[1].key) {
            navigate(Routers.MutualFundDashboard);
        }
    }, [activeTab, navigate]);

    const userInitials = useMemo(() => getTwoCapitalChars(loggedInUser || 'U'), [loggedInUser]);

    return (
        <header className={styles.root}>
            <div className={styles.accentLine} aria-hidden />
            <div className={styles.bar}>
                <div className={styles.logoBlock}>
                    <button
                        type="button"
                        className={styles.logoBtn}
                        onClick={handleLogoNav}
                        aria-label={loggedInUser ? 'Go to dashboard' : 'MightyBull home'}
                    >
                        <span className={styles.logoMark}>
                            <img
                                className={styles.logoImg}
                                src={MIGHTYBULL_LOGO}
                                alt=""
                                width={40}
                                height={40}
                            />
                        </span>
                        <span className={styles.brandName}>MightyBull</span>
                    </button>
                    {loggedInUser && (
                        <span className={styles.marketTag} aria-hidden>
                            NSE · BSE
                        </span>
                    )}
                </div>

                <div className={styles.center}>
                    {loggedInUser && (
                        <>
                            <div className={styles.tabsWrap}>
                                {activeTab && (
                                    <TabSwitcher
                                        activeTab={activeTab}
                                        setActiveTab={setActiveTab}
                                        tabs={TABS}
                                    />
                                )}
                            </div>
                            <div className={styles.searchWrap}>
                                <StockSearch onSearch={handleStockSearch} />
                            </div>
                        </>
                    )}
                </div>

                <div className={styles.actions}>
                    <div className={styles.profileWrap} ref={profileMenuRef}>
                        <button
                            type="button"
                            className={styles.avatarBtn}
                            onClick={toggleDropdown}
                            aria-expanded={dropdownOpen}
                            aria-haspopup="menu"
                            aria-label="Account menu"
                        >
                            <span className={styles.avatarRing}>
                                <span className={styles.avatar}>{userInitials}</span>
                            </span>
                            <MdExpandMore
                                className={`${styles.chevron} ${dropdownOpen ? styles.chevronOpen : ''}`}
                                aria-hidden
                            />
                        </button>
                        {dropdownOpen && (
                            <div className={styles.dropdown} role="menu" aria-label="Account">
                                {loggedInUser ? (
                                    <>
                                        <div className={styles.dropdownMeta}>
                                            <span className={styles.dropdownHello}>Signed in</span>
                                            <span className={styles.dropdownName}>{loggedInUser}</span>
                                        </div>
                                        <div className={styles.dropdownDivider} />
                                        <button
                                            type="button"
                                            role="menuitem"
                                            className={styles.dropdownItem}
                                            onClick={handleUserDetails}
                                        >
                                            Profile
                                        </button>
                                        <button
                                            type="button"
                                            role="menuitem"
                                            className={styles.dropdownItem}
                                            onClick={handleLogout}
                                        >
                                            Log out
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            type="button"
                                            role="menuitem"
                                            className={styles.dropdownItem}
                                            onClick={handleLogin}
                                        >
                                            Log in
                                        </button>
                                        <button
                                            type="button"
                                            role="menuitem"
                                            className={`${styles.dropdownItem} ${styles.dropdownItemPrimary}`}
                                            onClick={handleSignup}
                                        >
                                            Sign up
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;
