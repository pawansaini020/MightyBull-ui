import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/header/Header.tsx';
import Footer from '../components/layout/footer/Footer.tsx';
import { Routers } from '../constants/AppConstants.ts';
import styles from './NotFound.module.scss';
import { MdHome, MdDashboard, MdArrowBack, MdSearchOff } from 'react-icons/md';

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
                <div className={styles.bgMesh} aria-hidden />
                <main
                    className={styles.shell}
                    role="main"
                    aria-labelledby="not-found-heading"
                >
                    <div className={styles.panel}>
                        <aside className={styles.panelAside} aria-hidden>
                            <div className={styles.asideGlow} />
                            <span className={styles.code}>404</span>
                            <span className={styles.asideIcon}>
                                <MdSearchOff />
                            </span>
                        </aside>
                        <div className={styles.panelMain}>
                            <p className={styles.eyebrow}>Page not found</p>
                            <h1 id="not-found-heading" className={styles.title}>
                                This address isn&apos;t on the map
                            </h1>
                            <p className={styles.sub}>
                                Double-check the URL, or use the shortcuts below to get back into
                                MightyBull.
                            </p>
                            <div className={styles.actions}>
                                <button type="button" className={styles.btnPrimary} onClick={goHome}>
                                    <MdHome aria-hidden />
                                    Home
                                </button>
                                {hasSession ? (
                                    <button
                                        type="button"
                                        className={styles.btnSecondary}
                                        onClick={goDashboard}
                                    >
                                        <MdDashboard aria-hidden />
                                        Dashboard
                                    </button>
                                ) : null}
                                <button type="button" className={styles.btnGhost} onClick={goBack}>
                                    <MdArrowBack aria-hidden />
                                    Go back
                                </button>
                            </div>
                            <p className={styles.hint}>
                                <span className={styles.hintKbd} aria-hidden>
                                    ←
                                </span>
                                You can also use your browser&apos;s back control.
                            </p>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        </>
    );
}

export default NotFound;
