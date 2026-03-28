import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/header/Header.tsx';
import Footer from '../components/layout/footer/Footer.tsx';
import { Routers } from '../constants/AppConstants.ts';
import styles from './NotFound.module.scss';
import { MdHome, MdDashboard, MdArrowBack } from 'react-icons/md';

function NotFound() {
    const navigate = useNavigate();
    const hasSession = useMemo(() => Boolean(localStorage.getItem('token')), []);

    const goHome = useCallback(() => navigate(Routers.Home), [navigate]);
    const goDashboard = useCallback(() => navigate(Routers.Dashboard), [navigate]);
    const goBack = useCallback(() => navigate(-1), [navigate]);

    return (
        <>
            <Header />
            <div className={styles.page}>
                <div className={styles.mesh} aria-hidden />
                <main
                    className={styles.shell}
                    role="main"
                    aria-labelledby="not-found-heading"
                >
                    <div className={styles.content}>
                        <div className={styles.layout}>
                            <div className={styles.art} aria-hidden>
                                <div className={styles.artFrame}>
                                    <span className={styles.artOrb} />
                                    <span className={styles.artOrb} />
                                    <span className={styles.artRing} />
                                    <span className={styles.art404}>404</span>
                                </div>
                            </div>

                            <div className={styles.card}>
                                <div className={styles.cardAccent} aria-hidden />
                                <div className={styles.cardBody}>
                                    <div className={styles.cardGlow} aria-hidden />
                                    <span className={styles.badge}>
                                        <span className={styles.badgeDot} />
                                        Page missing
                                    </span>
                                    <h1 id="not-found-heading" className={styles.title}>
                                        We couldn&apos;t find that page
                                    </h1>
                                    <p className={styles.sub}>
                                        The URL may be mistyped, or the page was moved. Pick a
                                        destination below to continue in MightyBull.
                                    </p>
                                    <div className={styles.actions}>
                                        <button
                                            type="button"
                                            className={styles.btnPrimary}
                                            onClick={goHome}
                                        >
                                            <MdHome aria-hidden />
                                            Home
                                        </button>
                                        {hasSession ? (
                                            <button
                                                type="button"
                                                className={styles.btnGhost}
                                                onClick={goDashboard}
                                            >
                                                <MdDashboard aria-hidden />
                                                Dashboard
                                            </button>
                                        ) : null}
                                        <button
                                            type="button"
                                            className={styles.btnGhost}
                                            onClick={goBack}
                                        >
                                            <MdArrowBack aria-hidden />
                                            Back
                                        </button>
                                    </div>
                                    <p className={styles.hint}>
                                        Tip: use your browser&apos;s{' '}
                                        <span className={styles.hintKbd}>←</span> button or{' '}
                                        <span className={styles.hintKbd}>Back</span> above to return
                                        where you were.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        </>
    );
}

export default NotFound;
