import Headers from '../../layout/header/Header.tsx';
import Footer from '../../layout/footer/Footer.tsx';
import styles from './StockWidgetDetails.module.scss';
import { useEffect, useState, useMemo, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../../helpers/axiosInstance.ts';
import { formatNumber } from '../../../helpers/StringTransform.ts';
import {
    MdShowChart,
    MdTrendingUp,
    MdTrendingDown,
    MdInfoOutline,
    MdAssessment,
    MdTableChart,
} from 'react-icons/md';

interface StockScore {
    stockId: string;
    marketCapScore: number;
    priceScore: number;
    peScore: number;
    dividendYieldScore: number;
    roceScore: number;
    rocScore: number;
    quarterlyProfitScore: number;
    profitAndLossScore: number;
    balanceSheetScore: number;
    cashFlowScore: number;
    debtorDaysScore: number;
    yearlyRoceScore: number;
    shareholdingPatternScore: number;
    score: number;
}

interface StockWidget {
    stockId: string;
    name: string;
    sector: string;
    marketCap: number;
    currentPrice: number;
    high: number;
    low: number;
    stockPE: number;
    dividendYield: number;
    roce: number;
    roe: number;
    score: number;
    prosList: string[];
    consList: string[];
    scoreDTO: StockScore;
    quarterlyResults: Record<string, Record<string, number | null>> | null;
    profitAndLoss: Record<string, Record<string, number | null>> | null;
    balanceSheet: Record<string, Record<string, number | null>> | null;
    ratios: Record<string, Record<string, number | null>> | null;
    shareholdingPattern: Record<string, Record<string, number | null>> | null;
}

const ALL_QUARTERS = [
    'Jun 2022',
    'Sep 2022',
    'Dec 2022',
    'Mar 2023',
    'Jun 2023',
    'Sep 2023',
    'Dec 2023',
    'Mar 2024',
    'Jun 2024',
    'Sep 2024',
    'Dec 2024',
    'Mar 2025',
];

const ALL_YEARS = [
    'Mar 2014',
    'Mar 2015',
    'Mar 2016',
    'Mar 2017',
    'Mar 2018',
    'Mar 2019',
    'Mar 2020',
    'Mar 2021',
    'Mar 2022',
    'Mar 2023',
    'Mar 2024',
    'Mar 2025',
];

type ScoreComponentKey = Exclude<keyof StockScore, 'stockId' | 'score'>;

const SCORE_BREAKDOWN: { key: ScoreComponentKey; label: string }[] = [
    { key: 'marketCapScore', label: 'Market cap' },
    { key: 'priceScore', label: 'Price' },
    { key: 'peScore', label: 'P/E' },
    { key: 'dividendYieldScore', label: 'Dividend yield' },
    { key: 'roceScore', label: 'ROCE' },
    { key: 'rocScore', label: 'ROC' },
    { key: 'quarterlyProfitScore', label: 'Quarterly profit' },
    { key: 'profitAndLossScore', label: 'Profit & loss' },
    { key: 'balanceSheetScore', label: 'Balance sheet' },
    { key: 'cashFlowScore', label: 'Cash flow' },
    { key: 'debtorDaysScore', label: 'Debtor days' },
    { key: 'yearlyRoceScore', label: 'Yearly ROCE' },
    { key: 'shareholdingPatternScore', label: 'Shareholding pattern' },
];

function isMobileWidth() {
    return typeof window !== 'undefined' && window.innerWidth <= 768;
}

function safeObjectKeys(obj: Record<string, unknown> | null | undefined): string[] {
    if (!obj || typeof obj !== 'object') return [];
    return Object.keys(obj);
}

function DataTableBlock({
    title,
    icon,
    columns,
    rowKeys,
    getCell,
}: {
    title: string;
    icon: ReactNode;
    columns: string[];
    rowKeys: string[];
    getCell: (metric: string, col: string) => string;
}) {
    if (rowKeys.length === 0 || columns.length === 0) return null;

    const gridCols = `minmax(10rem, 14rem) repeat(${columns.length}, minmax(5.25rem, 1fr))`;
    const sectionId = `tbl-${title.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()}`;

    return (
        <section className={styles.section} aria-labelledby={sectionId}>
            <div className={styles.sectionHead}>
                <span className={styles.sectionIcon} aria-hidden>
                    {icon}
                </span>
                <h2 id={sectionId} className={styles.sectionTitle}>
                    {title}
                </h2>
            </div>
            <div className={styles.tableScroll}>
                <div className={styles.dataTableWrap}>
                    <div className={styles.dataTableRow} style={{ gridTemplateColumns: gridCols }}>
                        <span className={styles.dataTableSticky}>Metric</span>
                        {columns.map((c) => (
                            <span key={c} className={`${styles.dataTableNumHead} ${styles.dataTableHeadCell}`}>
                                {c}
                            </span>
                        ))}
                    </div>
                    {rowKeys.map((metric) => (
                        <div key={metric} className={styles.dataTableRow} style={{ gridTemplateColumns: gridCols }}>
                            <span className={`${styles.dataTableSticky} ${styles.dataTableMetric}`}>{metric}</span>
                            {columns.map((col) => (
                                <span key={col} className={styles.dataTableCell}>
                                    {getCell(metric, col)}
                                </span>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function StockWidgetDetails() {
    const { stockId } = useParams();
    const [stock, setStock] = useState<StockWidget | null>(null);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [quarters, setQuarters] = useState<string[]>([]);
    const [years, setYears] = useState<string[]>([]);

    useEffect(() => {
        if (isMobileWidth()) {
            setQuarters(ALL_QUARTERS.slice(-3));
            setYears(ALL_YEARS.slice(-3));
        } else {
            setQuarters(ALL_QUARTERS);
            setYears(ALL_YEARS);
        }
    }, []);

    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            if (!stockId) {
                setLoading(false);
                setStock(null);
                setFetchError('Missing stock id');
                return;
            }
            setLoading(true);
            setFetchError(null);
            try {
                const response = await axiosInstance.get(
                    `${import.meta.env.VITE_MIGHTYBULL_BASE_URL}/v1/api/stock/widget-details/${encodeURIComponent(stockId)}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                        },
                    }
                );
                const data = response?.data?.data;
                if (!cancelled) {
                    setStock(data ?? null);
                    if (!data) setFetchError('No data returned');
                }
            } catch {
                if (!cancelled) {
                    setStock(null);
                    setFetchError('Could not load stock details.');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        run();
        return () => {
            cancelled = true;
        };
    }, [stockId]);

    const metricCards = useMemo(() => {
        if (!stock) return [];
        return [
            { label: 'Score', value: formatNumber(stock.score), accent: 'primary' as const },
            { label: 'Stock P/E', value: formatNumber(stock.stockPE), accent: 'default' as const },
            { label: 'Market cap', value: `${formatNumber(stock.marketCap)} Cr`, accent: 'default' as const },
            { label: 'Current price', value: `₹${formatNumber(stock.currentPrice)}`, accent: 'default' as const },
            { label: 'Day low', value: formatNumber(stock.low), accent: 'bear' as const },
            { label: 'Day high', value: formatNumber(stock.high), accent: 'bull' as const },
            { label: 'ROCE', value: `${formatNumber(stock.roce)}%`, accent: 'default' as const },
            { label: 'ROE', value: `${formatNumber(stock.roe)}%`, accent: 'default' as const },
            { label: 'Dividend yield', value: `${formatNumber(stock.dividendYield)}%`, accent: 'default' as const },
        ];
    }, [stock]);

    const sectorLabel = stock?.sector?.trim() ? stock.sector : '—';

    return (
        <>
            <Headers />
            <div className={styles.mainDiv}>
                <div className={styles.shell}>
                    {loading ? (
                        <div className={styles.loadingBlock}>
                            <span className={styles.loadingDot} aria-hidden />
                            Loading stock details…
                        </div>
                    ) : !stock ? (
                        <div className={styles.emptyBlock}>
                            <MdInfoOutline className={styles.emptyIcon} aria-hidden />
                            <p className={styles.emptyTitle}>{fetchError || 'Stock not found'}</p>
                            <p className={styles.emptyHint}>Check the link or return to the stock list.</p>
                        </div>
                    ) : (
                        <>
                            <section className={styles.hero} aria-label="Stock overview">
                                <div className={styles.heroGlow} aria-hidden />
                                <div className={styles.heroInner}>
                                    <div className={styles.heroIcon} aria-hidden>
                                        <MdShowChart />
                                    </div>
                                    <div className={styles.heroText}>
                                        <p className={styles.heroEyebrow}>{sectorLabel}</p>
                                        <h1 className={styles.heroTitle}>{stock.name}</h1>
                                        <p className={styles.heroMeta}>
                                            <span className={styles.ticker}>{stock.stockId}</span>
                                        </p>
                                    </div>
                                    <div className={styles.heroScore}>
                                        <span className={styles.heroScoreLabel}>MightyBull score</span>
                                        <span className={styles.heroScoreValue}>{formatNumber(stock.score)}</span>
                                    </div>
                                </div>
                            </section>

                            <section className={styles.section} aria-labelledby="metrics-heading">
                                <div className={styles.sectionHead}>
                                    <span className={styles.sectionIcon} aria-hidden>
                                        <MdAssessment />
                                    </span>
                                    <h2 id="metrics-heading" className={styles.sectionTitle}>
                                        Key metrics
                                    </h2>
                                </div>
                                <div className={styles.metricsGrid}>
                                    {metricCards.map(({ label, value, accent }) => (
                                        <div
                                            key={label}
                                            className={`${styles.metricCard} ${styles[`metricAccent_${accent}`]}`}
                                        >
                                            <span className={styles.metricLabel}>{label}</span>
                                            <span className={styles.metricValue}>{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className={styles.section} aria-labelledby="fundamentals-heading">
                                <div className={styles.sectionHead}>
                                    <span className={styles.sectionIcon} aria-hidden>
                                        <MdTrendingUp />
                                    </span>
                                    <h2 id="fundamentals-heading" className={styles.sectionTitle}>
                                        Fundamental view
                                    </h2>
                                </div>
                                <div className={styles.prosConsGrid}>
                                    <div className={styles.prosCard}>
                                        <h3 className={styles.prosConsTitle}>
                                            <MdTrendingUp className={styles.prosConsTitleIcon} aria-hidden />
                                            Pros
                                        </h3>
                                        <ul className={styles.prosConsList}>
                                            {(stock.prosList ?? []).map((item, index) => (
                                                <li key={index}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className={styles.consCard}>
                                        <h3 className={styles.prosConsTitle}>
                                            <MdTrendingDown className={styles.prosConsTitleIcon} aria-hidden />
                                            Cons
                                        </h3>
                                        <ul className={styles.prosConsList}>
                                            {(stock.consList ?? []).map((item, index) => (
                                                <li key={index}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                                <div className={styles.disclaimer} role="note">
                                    <span>
                                        * Pros and cons are machine-generated. Hover the icon for more detail.
                                    </span>
                                    <span className={styles.tooltipWrap}>
                                        <MdInfoOutline className={styles.tooltipIcon} aria-label="More info" />
                                        <span className={styles.tooltipBubble} role="tooltip">
                                            These are AI-generated insights. Do your own research before investing.
                                        </span>
                                    </span>
                                </div>
                            </section>

                            {stock.scoreDTO && (
                                <section className={styles.section} aria-labelledby="score-breakdown-heading">
                                    <div className={styles.sectionHead}>
                                        <span className={styles.sectionIcon} aria-hidden>
                                            <MdTableChart />
                                        </span>
                                        <h2 id="score-breakdown-heading" className={styles.sectionTitle}>
                                            Score breakdown
                                        </h2>
                                    </div>
                                    <div className={styles.scoreTableCard}>
                                        <div className={styles.scoreTableHead}>
                                            <span>Parameter</span>
                                            <span>Score</span>
                                        </div>
                                        <ul className={styles.scoreTableBody}>
                                            {SCORE_BREAKDOWN.map(({ key, label }) => (
                                                <li key={key} className={styles.scoreTableRow}>
                                                    <span className={styles.scoreParam}>{label}</span>
                                                    <span className={styles.scoreVal}>
                                                        {formatNumber(stock.scoreDTO[key] as number)}
                                                    </span>
                                                </li>
                                            ))}
                                            <li className={`${styles.scoreTableRow} ${styles.scoreTableRowTotal}`}>
                                                <span className={styles.scoreParam}>Total</span>
                                                <span className={styles.scoreVal}>
                                                    {formatNumber(stock.scoreDTO.score)}
                                                </span>
                                            </li>
                                        </ul>
                                    </div>
                                </section>
                            )}

                            <DataTableBlock
                                title="Quarterly results"
                                icon={<MdTableChart />}
                                columns={quarters}
                                rowKeys={safeObjectKeys(stock.quarterlyResults as Record<string, unknown>)}
                                getCell={(metric, q) => {
                                    const v = stock.quarterlyResults?.[metric]?.[q];
                                    return v != null ? formatNumber(v as number) : '—';
                                }}
                            />

                            <DataTableBlock
                                title="Profit & loss"
                                icon={<MdTableChart />}
                                columns={years}
                                rowKeys={safeObjectKeys(stock.profitAndLoss as Record<string, unknown>)}
                                getCell={(metric, y) => {
                                    const v = stock.profitAndLoss?.[metric]?.[y];
                                    return v != null ? formatNumber(v as number) : '—';
                                }}
                            />

                            <DataTableBlock
                                title="Balance sheet"
                                icon={<MdTableChart />}
                                columns={years}
                                rowKeys={safeObjectKeys(stock.balanceSheet as Record<string, unknown>)}
                                getCell={(metric, y) => {
                                    const v = stock.balanceSheet?.[metric]?.[y];
                                    return v != null ? formatNumber(v as number) : '—';
                                }}
                            />

                            <DataTableBlock
                                title="Ratios"
                                icon={<MdTableChart />}
                                columns={years}
                                rowKeys={safeObjectKeys(stock.ratios as Record<string, unknown>)}
                                getCell={(metric, y) => {
                                    const v = stock.ratios?.[metric]?.[y];
                                    return v != null ? formatNumber(v as number) : '—';
                                }}
                            />

                            <DataTableBlock
                                title="Shareholding pattern"
                                icon={<MdTableChart />}
                                columns={quarters}
                                rowKeys={safeObjectKeys(stock.shareholdingPattern as Record<string, unknown>)}
                                getCell={(metric, q) => {
                                    const v = stock.shareholdingPattern?.[metric]?.[q];
                                    return v != null ? formatNumber(v as number) : '—';
                                }}
                            />
                        </>
                    )}
                </div>
                <Footer />
            </div>
        </>
    );
}

export default StockWidgetDetails;
