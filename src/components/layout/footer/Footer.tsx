import { Link } from 'react-router-dom';
import styles from './Footer.module.scss';
import { Routers } from '../../../constants/AppConstants.ts';

function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className={styles.footer} role="contentinfo">
            <div className={styles.inner}>
                <div className={styles.grid}>
                    <div className={styles.brandCol}>
                        <span className={styles.brandName}>MightyBull</span>
                        <p className={styles.brandText}>
                            Your companion for investing in India—stocks, mutual funds, and ETFs on
                            NSE &amp; BSE, with a simple, transparent experience. 
                            Access stocks, mutual funds, and ETFs across the NSE and BSE with a platform designed to be your long-term investment companion. 
                            No hidden agendas, no complex hurdles—just a powerful tool to help you own a piece of India’s growth.
                        </p>
                    </div>

                    <div className={styles.col}>
                        <h3 className={styles.colTitle}>Products</h3>
                        <ul className={styles.linkList}>
                            <li>
                                <Link to={Routers.Dashboard}>Stocks</Link>
                            </li>
                            <li>
                                <Link to={Routers.MutualFundDashboard}>Mutual funds</Link>
                            </li>
                            <li>
                                <Link to={Routers.StockWidgets}>ETFs</Link>
                            </li>
                            <li>
                                <Link to={Routers.Indices}>Indices</Link>
                            </li>
                        </ul>
                    </div>

                    <div className={styles.col}>
                        <h3 className={styles.colTitle}>Markets</h3>
                        <ul className={styles.linkList}>
                            <li>
                                <Link to={Routers.Indices}>Share market</Link>
                            </li>
                            <li>
                                <Link to={Routers.Indices}>Stock indices</Link>
                            </li>
                            <li>
                                <Link to={Routers.Indices}>NSE</Link>
                            </li>
                            <li>
                                <Link to={Routers.Indices}>BSE</Link>
                            </li>
                        </ul>
                    </div>

                    <div className={styles.col}>
                        <h3 className={styles.colTitle}>Company</h3>
                        <ul className={styles.linkList}>
                            <li>
                                <Link to={Routers.Home}>About MightyBull</Link>
                            </li>
                            <li>
                                <Link to={Routers.Login}>Login</Link>
                            </li>
                            <li>
                                <Link to={Routers.Signup}>Sign up</Link>
                            </li>
                            <li>
                                <Link to={Routers.ForgotPassword}>Forgot password</Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className={styles.bottom}>
                    <p className={styles.copyright}>
                        © 2025–{year} MightyBull. All rights reserved.
                    </p>
                    <div className={styles.disclaimer}>
                        <p>
                            Investments in securities markets are subject to market risks. Read all
                            related documents carefully before investing. MightyBull does not
                            guarantee returns; past performance is not indicative of future results.
                            Please consult your financial adviser before making investment decisions.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
