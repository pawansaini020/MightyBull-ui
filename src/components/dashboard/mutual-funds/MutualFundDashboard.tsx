import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './MutualFundDashboard.module.scss';
import Headers from '../../layout/header/Header.tsx';
import Footer from '../../layout/footer/Footer.tsx';
import axiosInstance from '../../../helpers/axiosInstance.ts';
import { Routers } from '../../../constants/AppConstants.ts';
import { formatNumber, getColoredStyle } from '../../../helpers/StringTransform.ts';
import {
    MdSavings,
    MdChevronRight,
    MdErrorOutline,
    MdSearchOff,
} from 'react-icons/md';

const HEADER_TABS = [
    { key: 'STOCK', label: 'Stocks' },
    { key: 'MUTUAL_FUND', label: 'Mutual Fund' },
] as const;

interface MutualFundItem {
    mutualFundId: string;
    name: string;
    fundHouse: string;
    logoUrl: string;
    return3y: number;
}

function FundLogo({ url, label }: { url: string; label: string }) {
    const [broken, setBroken] = useState(false);
    if (broken || !url?.trim()) {
        return (
            <span className={styles.logoFallback} aria-hidden>
                {label.trim().slice(0, 2).toUpperCase() || 'MF'}
            </span>
        );
    }
    return (
        <img
            src={url}
            alt=""
            className={styles.logoImg}
            width={40}
            height={40}
            loading="lazy"
            onError={() => setBroken(true)}
        />
    );
}

function MutualFundDashboard() {
    const navigate = useNavigate();
    const [mutualFunds, setMutualFunds] = useState<MutualFundItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [spinKey, setSpinKey] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const todayLabel = useMemo(
        () =>
            new Intl.DateTimeFormat('en-IN', {
                weekday: 'long',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            }).format(new Date()),
        []
    );

    const SPIN_MS = 650;

    const fetchMutualFunds = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axiosInstance.get(
                '/v1/api/mutual-fund/widgets?page_number=0&page_size=10'
            );
            const raw = response?.data?.data;
            if (!Array.isArray(raw)) {
                throw new Error('Invalid response format');
            }

            const funds: MutualFundItem[] = raw.map((fund: Record<string, unknown>) => ({
                mutualFundId: String(fund?.mutualFundId ?? ''),
                name: String(fund?.name ?? 'N/A'),
                fundHouse: String(fund?.fundHouse ?? 'N/A'),
                logoUrl: String(fund?.logoUrl ?? '').trim(),
                return3y: Number(fund?.return3y) || 0,
            }));

            setMutualFunds(funds);
        } catch (err: unknown) {
            console.error('Failed to fetch mutual fund widgets:', err);
            const message =
                err instanceof Error ? err.message : 'Failed to fetch mutual funds';
            setError(message);
            setMutualFunds([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMutualFunds();
    }, [fetchMutualFunds]);

    const handleRefresh = () => {
        setSpinKey((k) => k + 1);
        setIsRefreshing(true);
        fetchMutualFunds();
        window.setTimeout(() => setIsRefreshing(false), SPIN_MS);
    };

    const handleAllMutualFundsClick = () => {
        navigate(Routers.MutualFundWidgets);
    };

    const handleFundClick = (mutualFundId: string) => {
        if (!mutualFundId) return;
        navigate(
            Routers.MutualFundWidgetDetails.replace(
                ':mutualFundId',
                encodeURIComponent(mutualFundId)
            )
        );
    };

    return (
        <>
            <Headers currentTab={HEADER_TABS[1].key} />
            <div className={styles.mainDiv}>
                <div className={styles.shell}>
                    <header className={styles.hero}>
                        <div className={styles.heroGlow} aria-hidden />
                        <div className={styles.heroInner}>
                            <div className={styles.heroIcon} aria-hidden>
                                <MdSavings />
                            </div>
                            <div className={styles.heroText}>
                                <p className={styles.heroEyebrow}>Mutual funds</p>
                                <h1 className={styles.heroTitle}>Popular funds</h1>
                                <p className={styles.heroSub}>
                                    Curated snapshot of standout schemes. Open a card for full fund
                                    detail, or browse the complete catalogue.
                                </p>
                            </div>
                            <div className={styles.heroMeta}>
                                <MdSavings className={styles.heroMetaIcon} aria-hidden />
                                <span>{todayLabel}</span>
                            </div>
                        </div>
                    </header>

                    <section className={styles.section} aria-labelledby="mf-spotlight-heading">
                        <div className={styles.sectionHead}>
                            <h2 id="mf-spotlight-heading" className={styles.sectionTitle}>
                                Spotlight
                            </h2>
                            <div className={styles.sectionActions}>
                                <button
                                    type="button"
                                    className={styles.iconRefresh}
                                    onClick={handleRefresh}
                                    disabled={isLoading}
                                    aria-label="Refresh funds"
                                    title="Refresh"
                                >
                                    <span
                                        key={spinKey}
                                        className={`${styles.refreshGlyph} ${isRefreshing ? styles.refreshGlyphSpin : ''}`}
                                        aria-hidden
                                    >
                                        ↻
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    className={styles.textLink}
                                    onClick={handleAllMutualFundsClick}
                                >
                                    All mutual funds
                                    <MdChevronRight aria-hidden />
                                </button>
                            </div>
                        </div>

                        <div className={styles.tableCard}>
                            {error && (
                                <div className={styles.errorBanner} role="alert">
                                    <MdErrorOutline aria-hidden />
                                    <span>{error}</span>
                                    <button
                                        type="button"
                                        className={styles.retryBtn}
                                        onClick={() => fetchMutualFunds()}
                                    >
                                        Retry
                                    </button>
                                </div>
                            )}

                            {isLoading ? (
                                <div className={styles.loadingState}>
                                    <span className={styles.loadingPulse} aria-hidden />
                                    Loading funds…
                                </div>
                            ) : !error && mutualFunds.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <MdSearchOff className={styles.emptyIcon} aria-hidden />
                                    <p className={styles.emptyTitle}>No funds to show</p>
                                    <p className={styles.emptyHint}>
                                        Try refreshing or explore all mutual funds.
                                    </p>
                                </div>
                            ) : !error ? (
                                <ul className={styles.fundGrid}>
                                    {mutualFunds.map((fund) => (
                                        <li key={fund.mutualFundId || fund.name}>
                                            <button
                                                type="button"
                                                className={styles.fundCard}
                                                onClick={() => handleFundClick(fund.mutualFundId)}
                                            >
                                                <div className={styles.fundCardTop}>
                                                    <span className={styles.logoRing}>
                                                        <FundLogo
                                                            url={fund.logoUrl}
                                                            label={fund.fundHouse || fund.name}
                                                        />
                                                    </span>
                                                    <MdChevronRight
                                                        className={styles.cardChevron}
                                                        aria-hidden
                                                    />
                                                </div>
                                                <p className={styles.fundName}>{fund.name}</p>
                                                <p className={styles.fundHouse}>{fund.fundHouse}</p>
                                                <div className={styles.returnRow}>
                                                    <span className={styles.returnLabel}>3Y return</span>
                                                    <span
                                                        className={getColoredStyle(
                                                            fund.return3y,
                                                            styles
                                                        )}
                                                    >
                                                        {formatNumber(fund.return3y)}%
                                                    </span>
                                                </div>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : null}
                        </div>
                    </section>
                </div>
                <Footer />
            </div>
        </>
    );
}

export default MutualFundDashboard;
