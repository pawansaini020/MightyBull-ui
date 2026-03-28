import Header from '../layout/header/Header.tsx';
import Footer from '../layout/footer/Footer.tsx';
import styles from './Home.module.scss';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Routers } from '../../constants/AppConstants.ts';
import {
    MdTrendingUp,
    MdSavings,
    MdStackedBarChart,
    MdSpeed,
    MdVerified,
    MdPhoneIphone,
} from 'react-icons/md';

function Home() {
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem('token')) {
            navigate(Routers.Dashboard);
        }
    }, [navigate]);

    return (
        <>
            <Header />
            <div className={styles.page}>
                <main className={styles.main}>
                    <section className={styles.hero} aria-labelledby="hero-heading">
                        <div className={styles.heroGlow} aria-hidden />
                        <div className={styles.heroInner}>
                            <p className={styles.eyebrow}>NSE · BSE · India</p>
                            <h1 id="hero-heading" className={styles.heroTitle}>
                                Invest in India&apos;s markets,{' '}
                                <span className={styles.heroAccent}>the simple way</span>
                            </h1>
                            <p className={styles.heroLead}>
                                MightyBull brings stocks, mutual funds, and ETFs together—so you can
                                build wealth with clarity, not clutter.
                            </p>
                            <div className={styles.heroActions}>
                                <button
                                    type="button"
                                    className={styles.btnPrimary}
                                    onClick={() => navigate(Routers.Signup)}
                                >
                                    Open free account
                                </button>
                                <button
                                    type="button"
                                    className={styles.btnSecondary}
                                    onClick={() => navigate(Routers.Login)}
                                >
                                    Log in
                                </button>
                            </div>
                            <ul className={styles.heroStats} aria-label="Highlights">
                                <li>
                                    <strong className={styles.statValue}>₹0</strong>
                                    <span className={styles.statLabel}>account maintenance</span>
                                </li>
                                <li>
                                    <strong className={styles.statValue}>1 app</strong>
                                    <span className={styles.statLabel}>stocks, MFs &amp; ETFs</span>
                                </li>
                                <li>
                                    <strong className={styles.statValue}>24/7</strong>
                                    <span className={styles.statLabel}>track your portfolio</span>
                                </li>
                            </ul>
                        </div>
                        <div className={styles.heroVisual} aria-hidden>
                            <div className={styles.mockCard}>
                                <div className={styles.mockHeader}>
                                    <span className={styles.mockDot} />
                                    <span className={styles.mockDot} />
                                    <span className={styles.mockDot} />
                                </div>
                                <div className={styles.mockBody}>
                                    <div className={styles.mockRow}>
                                        <span className={styles.mockLabel}>NIFTY 50</span>
                                        <span className={styles.mockUp}>+1.24%</span>
                                    </div>
                                    <div className={styles.mockChart}>
                                        <div className={styles.mockBar} style={{ height: '40%' }} />
                                        <div className={styles.mockBar} style={{ height: '65%' }} />
                                        <div className={styles.mockBar} style={{ height: '52%' }} />
                                        <div className={styles.mockBar} style={{ height: '88%' }} />
                                        <div className={styles.mockBar} style={{ height: '72%' }} />
                                        <div className={styles.mockBar} style={{ height: '95%' }} />
                                    </div>
                                    <div className={styles.mockFooter}>
                                        <MdTrendingUp className={styles.mockIcon} />
                                        <span>MightyBull</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className={styles.exchanges} aria-label="Supported exchanges">
                        <p className={styles.exchangeIntro}>Trade where India invests</p>
                        <div className={styles.exchangeBadges}>
                            <div className={styles.badge}>
                                <span className={styles.badgeMark}>NSE</span>
                                <span className={styles.badgeText}>National Stock Exchange</span>
                            </div>
                            <div className={styles.badge}>
                                <span className={styles.badgeMark}>BSE</span>
                                <span className={styles.badgeText}>Bombay Stock Exchange</span>
                            </div>
                        </div>
                    </section>

                    <section className={styles.features} aria-labelledby="features-heading">
                        <div className={styles.sectionHead}>
                            <h2 id="features-heading" className={styles.sectionTitle}>
                                Everything you need to invest
                            </h2>
                            <p className={styles.sectionSub}>
                                One platform for discovery, tracking, and long-term planning.
                            </p>
                        </div>
                        <div className={styles.featureGrid}>
                            <article className={styles.featureCard}>
                                <div className={`${styles.featureIcon} ${styles.iconStocks}`}>
                                    <MdTrendingUp aria-hidden />
                                </div>
                                <h3 className={styles.featureTitle}>Stocks</h3>
                                <p className={styles.featureDesc}>
                                    Explore listed companies on NSE &amp; BSE with clean quotes and
                                    intuitive lists.
                                </p>
                            </article>
                            <article className={styles.featureCard}>
                                <div className={`${styles.featureIcon} ${styles.iconMf}`}>
                                    <MdSavings aria-hidden />
                                </div>
                                <h3 className={styles.featureTitle}>Mutual funds</h3>
                                <p className={styles.featureDesc}>
                                    Build diversified portfolios with funds suited to your goals and
                                    risk appetite.
                                </p>
                            </article>
                            <article className={styles.featureCard}>
                                <div className={`${styles.featureIcon} ${styles.iconEtf}`}>
                                    <MdStackedBarChart aria-hidden />
                                </div>
                                <h3 className={styles.featureTitle}>ETFs</h3>
                                <p className={styles.featureDesc}>
                                    Get index-like exposure with the flexibility of trading on the
                                    exchange.
                                </p>
                            </article>
                        </div>
                    </section>

                    <section className={styles.trust} aria-label="Why MightyBull">
                        <div className={styles.trustGrid}>
                            <div className={styles.trustItem}>
                                <MdSpeed className={styles.trustIcon} aria-hidden />
                                <h3 className={styles.trustTitle}>Fast, focused UI</h3>
                                <p className={styles.trustCopy}>
                                    Less noise, more signal—built for everyday investors.
                                </p>
                            </div>
                            <div className={styles.trustItem}>
                                <MdVerified className={styles.trustIcon} aria-hidden />
                                <h3 className={styles.trustTitle}>Transparent experience</h3>
                                <p className={styles.trustCopy}>
                                    Clear layouts for prices, funds, and indices in one place.
                                </p>
                            </div>
                            <div className={styles.trustItem}>
                                <MdPhoneIphone className={styles.trustIcon} aria-hidden />
                                <h3 className={styles.trustTitle}>Invest on your terms</h3>
                                <p className={styles.trustCopy}>
                                    Check markets and holdings whenever it suits you.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className={styles.ctaBand} aria-labelledby="cta-heading">
                        <div className={styles.ctaInner}>
                            <h2 id="cta-heading" className={styles.ctaTitle}>
                                Ready to start your journey?
                            </h2>
                            <p className={styles.ctaText}>
                                Join MightyBull and access Indian equities and funds in minutes.
                            </p>
                            <button
                                type="button"
                                className={styles.btnPrimaryLarge}
                                onClick={() => navigate(Routers.Signup)}
                            >
                                Create your account
                            </button>
                        </div>
                    </section>

                </main>
                <Footer />
            </div>
        </>
    );
}

export default Home;
