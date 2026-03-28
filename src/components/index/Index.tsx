import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Headers from '../layout/header/Header.tsx';
import Footer from '../layout/footer/Footer.tsx';
import styles from './Index.module.scss';
import TabSwitcher from '../global/tab-switch/TabSwitcher.tsx';
import axiosInstance from '../../helpers/axiosInstance.ts';
import { formatNumber, getColoredStyle } from '../../helpers/StringTransform.ts';
import { Routers } from '../../constants/AppConstants.ts';
import { MdShowChart, MdErrorOutline, MdTimeline } from 'react-icons/md';

interface IndexItem {
    name: string;
    indexId: string;
    symbol: string;
    country: string;
    logoUrl: string;
    value: number;
    open: number;
    close: number;
    dayChange: number;
    dayChangePerc: number;
    low: number;
    high: number;
    yearLowPrice: number;
    yearHighPrice: number;
}

const TABS = [
    { key: 'INDIAN', label: 'Indian indices' },
    { key: 'GLOBAL', label: 'Global indices' },
] as const;

function IndexLogo({ url, name }: { url: string; name: string }) {
    const [broken, setBroken] = useState(false);
    if (broken || !url?.trim()) {
        return (
            <span className={styles.logoFallback} aria-hidden>
                {name.trim().slice(0, 2).toUpperCase() || '—'}
            </span>
        );
    }
    return (
        <img
            src={url}
            alt=""
            className={styles.logoImg}
            width={36}
            height={36}
            loading="lazy"
            onError={() => setBroken(true)}
        />
    );
}

function Index() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<string>(TABS[0].key);
    const [indexData, setIndexData] = useState<IndexItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchIndexData = useCallback(async (type: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axiosInstance.get(
                `${import.meta.env.VITE_MIGHTYBULL_BASE_URL}/v1/api/index/widgets?index_type=${type}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );
            const raw = response?.data?.data;
            setIndexData(Array.isArray(raw) ? raw : []);
        } catch (err) {
            console.error('Failed to fetch indices', err);
            setError('Could not load indices. Please try again.');
            setIndexData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchIndexData(activeTab);
    }, [activeTab, fetchIndexData]);

    const handleIndexWidget = (indexId: string) =>
        navigate(Routers.IndexDetails.replace(':indexId', encodeURIComponent(indexId)));

    const activeLabel = TABS.find((t) => t.key === activeTab)?.label ?? '';

    return (
        <>
            <Headers />
            <div className={styles.mainDiv}>
                <div className={styles.shell}>
                    <header className={styles.hero}>
                        <div className={styles.heroGlow} aria-hidden />
                        <div className={styles.heroInner}>
                            <div className={styles.heroIcon} aria-hidden>
                                <MdShowChart />
                            </div>
                            <div className={styles.heroText}>
                                <p className={styles.heroEyebrow}>Markets</p>
                                <h1 className={styles.heroTitle}>Index overview</h1>
                                <p className={styles.heroSub}>
                                    Track Indian and global benchmarks in one place. Tap a row for full
                                    detail.
                                </p>
                            </div>
                        </div>
                    </header>

                    <div className={styles.toolbarCard}>
                        <div className={styles.toolbarRow}>
                            <TabSwitcher
                                activeTab={activeTab}
                                setActiveTab={setActiveTab}
                                tabs={[...TABS]}
                            />
                            {!loading && !error && (
                                <div className={styles.countChip} role="status">
                                    <MdTimeline aria-hidden className={styles.countChipIcon} />
                                    <strong>{indexData.length}</strong>
                                    <span>{activeLabel.toLowerCase()}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className={styles.errorBanner} role="alert">
                            <MdErrorOutline aria-hidden />
                            <span>{error}</span>
                            <button
                                type="button"
                                className={styles.retryBtn}
                                onClick={() => fetchIndexData(activeTab)}
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    <div className={styles.tableCard}>
                        {!loading && !error ? (
                            <div
                                className={styles.tableHead}
                                role="row"
                                aria-label="Column headers"
                            >
                                <span className={styles.colLogo} />
                                <span>Index</span>
                                <span className={styles.colNum}>Last (1D)</span>
                                <span className={`${styles.colNum} ${styles.hideMobile}`}>High</span>
                                <span className={`${styles.colNum} ${styles.hideMobile}`}>Low</span>
                                <span className={`${styles.colNum} ${styles.hideMobile}`}>Open</span>
                                <span className={`${styles.colNum} ${styles.hideMobile}`}>
                                    Prev close
                                </span>
                            </div>
                        ) : null}

                        {loading ? (
                            <div className={styles.loadingState}>
                                <span className={styles.loadingPulse} aria-hidden />
                                Loading indices…
                            </div>
                        ) : error ? (
                            <div className={styles.cardErrorState}>
                                <MdErrorOutline aria-hidden className={styles.cardErrorIcon} />
                                <p className={styles.cardErrorTitle}>Unable to load this list</p>
                                <p className={styles.cardErrorHint}>
                                    Check your connection and tap Retry above.
                                </p>
                            </div>
                        ) : indexData.length === 0 ? (
                            <div className={styles.emptyState}>
                                <MdTimeline className={styles.emptyIcon} aria-hidden />
                                <p className={styles.emptyTitle}>No indices to show</p>
                                <p className={styles.emptyHint}>Switch tab or check back later.</p>
                            </div>
                        ) : (
                            <ul className={styles.tableBody}>
                                {indexData.map((row) => (
                                    <li key={row.indexId}>
                                        <button
                                            type="button"
                                            className={styles.tableRow}
                                            onClick={() => handleIndexWidget(row.indexId)}
                                        >
                                            <span className={styles.colLogo}>
                                                <span className={styles.logoRing}>
                                                    <IndexLogo url={row.logoUrl} name={row.name} />
                                                </span>
                                            </span>
                                            <span className={styles.colName}>
                                                <span className={styles.nameMain}>{row.name}</span>
                                                {row.symbol ? (
                                                    <span className={styles.nameMeta}>{row.symbol}</span>
                                                ) : null}
                                            </span>
                                            <span className={styles.colLast}>
                                                <span className={styles.lastValue}>
                                                    {formatNumber(row.value)}
                                                </span>
                                                <span
                                                    className={getColoredStyle(
                                                        row?.dayChange ?? 0,
                                                        styles
                                                    )}
                                                >
                                                    {formatNumber(row.dayChange)} (
                                                    {formatNumber(row.dayChangePerc)}%)
                                                </span>
                                            </span>
                                            <span className={`${styles.colNum} ${styles.hideMobile}`}>
                                                {formatNumber(row.high)}
                                            </span>
                                            <span className={`${styles.colNum} ${styles.hideMobile}`}>
                                                {formatNumber(row.low)}
                                            </span>
                                            <span className={`${styles.colNum} ${styles.hideMobile}`}>
                                                {formatNumber(row.open)}
                                            </span>
                                            <span className={`${styles.colNum} ${styles.hideMobile}`}>
                                                {formatNumber(row.close)}
                                            </span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
                <Footer />
            </div>
        </>
    );
}

export default Index;
