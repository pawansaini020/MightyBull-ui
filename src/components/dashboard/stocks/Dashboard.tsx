import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Headers from '../../layout/header/Header.tsx';
import Footer from '../../layout/footer/Footer.tsx';
import styles from './Dashboard.module.scss';
import axiosInstance from '../../../helpers/axiosInstance.ts';
import { Page, Routers } from '../../../constants/AppConstants.ts';
import { formatNumber, getColoredStyle } from '../../../helpers/StringTransform.ts';
import { MdShowChart, MdTrendingUp, MdChevronRight } from 'react-icons/md';

const TABS = [
    { key: 'STOCK', label: 'Stocks' },
    { key: 'MUTUAL_FUND', label: 'Mutual Fund' },
];

const INDEX_CARDS: { dataKey: string; title: string; short: string }[] = [
    { dataKey: 'nifty', title: 'NIFTY 50', short: 'NIFTY' },
    { dataKey: 'sp-bse-sensex', title: 'SENSEX', short: 'SENSEX' },
    { dataKey: 'nifty-bank', title: 'BANK NIFTY', short: 'BANKNIFTY' },
    { dataKey: 'nifty-financial-services', title: 'FIN NIFTY', short: 'FINNIFTY' },
    { dataKey: 'sp-bse-bankex', title: 'BANKEX', short: 'BANKEX' },
    { dataKey: 'nifty-midcap-select', title: 'MIDCAP SELECT', short: 'MIDSEL' },
];

interface StockItem {
    stockId: string;
    name: string;
    sector: string;
    price: string;
    change: string;
    isPositive: boolean;
    score: number;
    marketCap: number;
    dividend: number;
}

interface IndexData {
    name: string;
    symbol: string;
    indexId: string;
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

function Dashboard() {
    const [stockList, setStockList] = useState<StockItem[]>([]);
    const navigate = useNavigate();
    const [isRotatingStock, setIsRotatingStock] = useState(false);
    const [indexes, setIndexes] = useState<Record<string, IndexData>>({});
    const [isRotatingIndex, setIsRotatingIndex] = useState(false);
    /** Remount glyph so the spin animation runs on every click */
    const [indexSpinKey, setIndexSpinKey] = useState(0);
    const [stockSpinKey, setStockSpinKey] = useState(0);

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

    const handleRefreshStockClick = () => {
        setStockSpinKey((k) => k + 1);
        setIsRotatingStock(true);
        fetchStocks(1);
        window.setTimeout(() => setIsRotatingStock(false), SPIN_MS);
    };

    const handleRefreshIndexClick = () => {
        setIndexSpinKey((k) => k + 1);
        setIsRotatingIndex(true);
        fetchIndexItemsFromSource();
        window.setTimeout(() => setIsRotatingIndex(false), SPIN_MS);
    };

    const handleSeeMoreButtonClick = () => navigate(Routers.StockWidgets);
    const handleAllIndexesButtonClick = () => navigate(Routers.Indices);
    const handleIndexWidget = (indexId: string) =>
        navigate(Routers.IndexDetails.replace(':indexId', encodeURIComponent(indexId)));

    const fetchStocks = async (page: number) => {
        try {
            const response = await axiosInstance.get(
                `${import.meta.env.VITE_MIGHTYBULL_BASE_URL}/v1/api/stock/widgets?page_number=${page - 1}&page_size=${Page.default_size}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

            const data = response.data.data;
            const transformed: StockItem[] = data.data.map((item: any) => ({
                stockId: item.stockId,
                name: item.name,
                sector: item.sector,
                price: item.closePrice.toFixed(2),
                change: `(${item.yearlyLowPrice} - ${item.yearlyHighPrice})`,
                isPositive: item.closePrice >= (item.yearlyHighPrice + item.yearlyLowPrice) / 2,
                score: item.score,
                marketCap: item.marketCap,
                dividend: item.dividend,
            }));

            setStockList(transformed);
        } catch (error) {
            console.error('Error fetching stocks', error);
        }
    };

    const fetchIndexItems = async () => {
        try {
            const response = await axiosInstance.get(
                `${import.meta.env.VITE_MIGHTYBULL_BASE_URL}/v1/api/index/widgets?index_type=INDIAN`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

            const json = response.data;
            if (response.status) {
                const map: Record<string, IndexData> = {};
                json.data.forEach((idx: IndexData) => {
                    map[idx.indexId] = idx;
                });
                setIndexes(map);
            }
        } catch (error) {
            console.error('Error fetching indexes widgets', error);
        }
    };

    const fetchIndexItemsFromSource = async () => {
        try {
            const response = await axiosInstance.get(
                `${import.meta.env.VITE_MIGHTYBULL_BASE_URL}/v1/api/grow/index/sync`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

            const json = response.data;
            if (response.status) {
                const map: Record<string, IndexData> = {};
                json.data.forEach((idx: IndexData) => {
                    map[idx.indexId] = idx;
                });
                setIndexes(map);
            }
        } catch (error) {
            console.error('Error fetching indexes widgets', error);
        }
    };

    useEffect(() => {
        fetchIndexItems();
        fetchStocks(1);
    }, []);

    return (
        <>
            <Headers currentTab={TABS[0].key} />
            <div className={styles.mainDiv}>
                <div className={styles.shell}>
                    <section className={styles.hero} aria-label="Markets overview">
                        <div className={styles.heroGlow} aria-hidden />
                        <div className={styles.heroInner}>
                            <div className={styles.heroIcon} aria-hidden>
                                <MdShowChart />
                            </div>
                            <div className={styles.heroText}>
                                <p className={styles.heroEyebrow}>Stock dashboard</p>
                                <h1 className={styles.heroTitle}>Indian markets at a glance</h1>
                                <p className={styles.heroSub}>
                                    Live index snapshots and large-cap leaders on NSE &amp; BSE — tap any row
                                    for detail.
                                </p>
                            </div>
                            <div className={styles.heroMeta}>
                                <MdTrendingUp className={styles.heroMetaIcon} aria-hidden />
                                <span>{todayLabel}</span>
                            </div>
                        </div>
                    </section>

                    <section className={styles.section} aria-labelledby="indices-heading">
                        <div className={styles.sectionHead}>
                            <h2 id="indices-heading" className={styles.sectionTitle}>
                                Indices
                            </h2>
                            <div className={styles.sectionActions}>
                                <button
                                    type="button"
                                    className={styles.textLink}
                                    onClick={handleAllIndexesButtonClick}
                                >
                                    All indices
                                    <MdChevronRight className={styles.linkChevron} aria-hidden />
                                </button>
                                <button
                                    type="button"
                                    className={`${styles.iconBtn} ${isRotatingIndex ? styles.refreshSpinning : ''}`}
                                    onClick={handleRefreshIndexClick}
                                    aria-label="Refresh indices"
                                >
                                    <span key={indexSpinKey} className={styles.refreshGlyph} aria-hidden>
                                        🔄
                                    </span>
                                </button>
                            </div>
                        </div>
                        <div className={styles.indexScroll}>
                            <div className={styles.indexGrid}>
                                {INDEX_CARDS.map(({ dataKey, title, short }) => {
                                    const idx = indexes[dataKey];
                                    const id = idx?.indexId;
                                    const dayCh = idx?.dayChange ?? 0;
                                    const dayPct = idx?.dayChangePerc ?? 0;
                                    return (
                                        <button
                                            key={dataKey}
                                            type="button"
                                            className={styles.indexCard}
                                            disabled={!id}
                                            onClick={() => id && handleIndexWidget(id)}
                                        >
                                            <span className={styles.indexBadge}>{short}</span>
                                            <span className={styles.indexName}>{title}</span>
                                            <span className={styles.indexValue}>
                                                {formatNumber(idx?.value || 0)}
                                            </span>
                                            <span
                                                className={`${styles.indexChange} ${getColoredStyle(dayCh, styles)}`}
                                            >
                                                {formatNumber(dayCh)} ({formatNumber(dayPct)}%)
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    <section className={styles.section} aria-labelledby="stocks-heading">
                        <div className={styles.sectionHead}>
                            <h2 id="stocks-heading" className={styles.sectionTitle}>
                                Top by market cap
                            </h2>
                            <div className={styles.sectionActions}>
                                <button
                                    type="button"
                                    className={styles.textLink}
                                    onClick={handleSeeMoreButtonClick}
                                >
                                    See more
                                    <MdChevronRight className={styles.linkChevron} aria-hidden />
                                </button>
                                <button
                                    type="button"
                                    className={`${styles.iconBtn} ${isRotatingStock ? styles.refreshSpinning : ''}`}
                                    onClick={handleRefreshStockClick}
                                    aria-label="Refresh stock list"
                                >
                                    <span key={stockSpinKey} className={styles.refreshGlyph} aria-hidden>
                                        🔄
                                    </span>
                                </button>
                            </div>
                        </div>

                        <div className={styles.tableCard}>
                            <div className={styles.tableHead}>
                                <span>Company</span>
                                <span className={styles.hideMobile}>Sector</span>
                                <span>Score</span>
                                <span>Price</span>
                                <span className={styles.hideMobile}>M cap (Cr)</span>
                                <span className={styles.hideMobile}>Div.</span>
                            </div>
                            <ul className={styles.tableBody}>
                                {stockList.map((stock) => (
                                    <li key={stock.stockId}>
                                        <button
                                            type="button"
                                            className={styles.tableRow}
                                            onClick={() =>
                                                navigate(
                                                    Routers.StockWidgetDetails.replace(
                                                        ':stockId',
                                                        encodeURIComponent(stock.stockId)
                                                    )
                                                )
                                            }
                                        >
                                            <span className={styles.cellCompany}>{stock.name}</span>
                                            <span className={`${styles.cellMuted} ${styles.hideMobile}`}>
                                                {stock.sector}
                                            </span>
                                            <span className={styles.cellScore}>{stock.score.toFixed(2)}</span>
                                            <span className={styles.cellPrice}>
                                                <span className={styles.priceMain}>₹{stock.price}</span>
                                                <span
                                                    className={
                                                        stock.isPositive ? styles.positive : styles.negative
                                                    }
                                                >
                                                    {stock.change}
                                                </span>
                                            </span>
                                            <span className={`${styles.cellNum} ${styles.hideMobile}`}>
                                                {stock.marketCap.toFixed(2)}
                                            </span>
                                            <span className={`${styles.cellNum} ${styles.hideMobile}`}>
                                                {stock.dividend.toFixed(2)}
                                            </span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>
                </div>
                <Footer />
            </div>
        </>
    );
}

export default Dashboard;
