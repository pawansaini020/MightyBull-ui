import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './IndexWidgetDetails.module.scss';
import Headers from '../../layout/header/Header.tsx';
import Footer from '../../layout/footer/Footer.tsx';
import { formatNumber, getColoredStyle } from '../../../helpers/StringTransform.ts';
import axiosInstance from '../../../helpers/axiosInstance.ts';
import { Page, Routers } from '../../../constants/AppConstants.ts';
import Pagination from '../../global/pagination/Pagination.tsx';
import {
    MdArrowBack,
    MdAssessment,
    MdTimeline,
    MdCorporateFare,
    MdInfoOutline,
    MdErrorOutline,
} from 'react-icons/md';

interface IndexItem {
    name: string;
    indexId: string;
    symbol: string;
    type: string;
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
    companies: string[];
}

interface StockItem {
    stockId: string;
    name: string;
    sector: string;
    closePrice: number;
    change: string;
    isPositive: boolean;
    marketCap: number;
}

interface PaginationInfo {
    total_count?: number;
    page_size?: number;
}

function bandPosition(value: number, low: number, high: number): number {
    const v = Number(value);
    const lo = Number(low);
    const hi = Number(high);
    if (!Number.isFinite(v) || !Number.isFinite(lo) || !Number.isFinite(hi) || hi <= lo) {
        return 50;
    }
    return Math.min(100, Math.max(0, ((v - lo) / (hi - lo)) * 100));
}

function IndexLogo({ url, name }: { url: string; name: string }) {
    const [broken, setBroken] = useState(false);
    if (broken || !url?.trim()) {
        return (
            <span className={styles.logoFallbackHero} aria-hidden>
                {name.trim().slice(0, 2).toUpperCase() || '—'}
            </span>
        );
    }
    return (
        <img
            src={url}
            alt=""
            className={styles.logoImgHero}
            width={52}
            height={52}
            loading="lazy"
            onError={() => setBroken(true)}
        />
    );
}

function IndexWidgetDetails() {
    const { indexId } = useParams();
    const navigate = useNavigate();

    const [index, setIndex] = useState<IndexItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [pageData, setPageData] = useState<PaginationInfo>({});
    const [stockList, setStockList] = useState<StockItem[]>([]);
    const [stocksLoading, setStocksLoading] = useState(false);
    const [stocksError, setStocksError] = useState<string | null>(null);

    const fetchIndexDetails = useCallback(async (id: string | undefined) => {
        if (!id) {
            setFetchError('Missing index id.');
            setIndex(null);
            setLoading(false);
            return;
        }
        setLoading(true);
        setFetchError(null);
        try {
            const response = await axiosInstance.get(
                `/v1/api/index/widget-details/${encodeURIComponent(id)}`
            );
            const raw = response?.data?.data;
            if (raw && typeof raw === 'object' && raw.indexId) {
                setIndex(raw as IndexItem);
            } else {
                setIndex(null);
                setFetchError('Index not found.');
            }
        } catch (error) {
            console.error('Error fetching index details:', error);
            setIndex(null);
            setFetchError('Could not load index details.');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchStocks = useCallback(async (page: number, companies: string[]) => {
        setStocksLoading(true);
        setStocksError(null);
        try {
            const response = await axiosInstance.post(
                `/v1/api/stock/widgets?page_number=${page - 1}&page_size=${Page.default_size}`,
                companies
            );
            const data = response?.data?.data;
            const rows = Array.isArray(data?.data) ? data.data : [];
            const transformed: StockItem[] = rows.map((item: Record<string, unknown>) => ({
                stockId: String(item.stockId ?? ''),
                name: String(item.name ?? ''),
                sector: String(item.sector ?? ''),
                closePrice: Number(item.closePrice) || 0,
                change: `(${item.yearlyLowPrice} – ${item.yearlyHighPrice})`,
                isPositive:
                    Number(item.closePrice) >=
                    ((Number(item.yearlyHighPrice) + Number(item.yearlyLowPrice)) / 2 || 0),
                marketCap: Number(item.marketCap) || 0,
            }));

            setStockList(transformed);
            setPageData(
                data?.pagination && typeof data.pagination === 'object' ? data.pagination : {}
            );
        } catch (error) {
            console.error('Error fetching stocks', error);
            setStocksError('Could not load constituent stocks.');
            setStockList([]);
            setPageData({});
        } finally {
            setStocksLoading(false);
        }
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [indexId]);

    useEffect(() => {
        fetchIndexDetails(indexId);
    }, [indexId, fetchIndexDetails]);

    useEffect(() => {
        if (!index?.companies?.length) {
            setStockList([]);
            setPageData({});
            return;
        }
        if (index.type !== 'INDIAN') return;
        fetchStocks(currentPage, index.companies);
    }, [index?.companies, index?.type, currentPage, fetchStocks]);

    const todayPct = useMemo(
        () => bandPosition(index?.value ?? 0, index?.low ?? 0, index?.high ?? 0),
        [index?.value, index?.low, index?.high]
    );

    const weekPct = useMemo(
        () =>
            bandPosition(
                index?.value ?? 0,
                index?.yearLowPrice ?? 0,
                index?.yearHighPrice ?? 0
            ),
        [index?.value, index?.yearLowPrice, index?.yearHighPrice]
    );

    const typeLabel =
        index?.type === 'INDIAN' ? 'Indian index' : index?.type === 'GLOBAL' ? 'Global index' : 'Index';

    const metricCards = useMemo(() => {
        if (!index) return [];
        return [
            { label: 'Last value', value: formatNumber(index.value), accent: 'primary' as const },
            { label: "Today's open", value: formatNumber(index.open), accent: 'default' as const },
            { label: 'Prev. close', value: formatNumber(index.close), accent: 'default' as const },
            { label: "Today's high", value: formatNumber(index.high), accent: 'bull' as const },
            { label: "Today's low", value: formatNumber(index.low), accent: 'bear' as const },
            { label: '52W high', value: formatNumber(index.yearHighPrice), accent: 'default' as const },
            { label: '52W low', value: formatNumber(index.yearLowPrice), accent: 'default' as const },
            {
                label: 'Day change',
                value: `${formatNumber(index.dayChange)} (${formatNumber(index.dayChangePerc)}%)`,
                accent: 'default' as const,
            },
        ];
    }, [index]);

    const showCompanies =
        index?.type === 'INDIAN' && Array.isArray(index.companies) && index.companies.length > 0;

    const totalCount = pageData?.total_count ?? 0;
    const pageSize = pageData?.page_size ?? Page.default_size;

    return (
        <>
            <Headers />
            <div className={styles.mainDiv}>
                <div className={styles.shell}>
                    {loading ? (
                        <div className={styles.loadingBlock}>
                            <span className={styles.loadingDot} aria-hidden />
                            Loading index details…
                        </div>
                    ) : !index ? (
                        <div className={styles.emptyBlock}>
                            <MdInfoOutline className={styles.emptyIcon} aria-hidden />
                            <p className={styles.emptyTitle}>{fetchError || 'Index not found'}</p>
                            <p className={styles.emptyHint}>
                                Check the link or return to the indices list.
                            </p>
                            <button
                                type="button"
                                className={styles.backBtnSolid}
                                onClick={() => navigate(Routers.Indices)}
                            >
                                <MdArrowBack aria-hidden />
                                All indices
                            </button>
                        </div>
                    ) : (
                        <>
                            <button
                                type="button"
                                className={styles.backLink}
                                onClick={() => navigate(Routers.Indices)}
                            >
                                <MdArrowBack aria-hidden />
                                All indices
                            </button>

                            <section className={styles.hero} aria-label="Index overview">
                                <div className={styles.heroGlow} aria-hidden />
                                <div className={styles.heroInner}>
                                    <div className={styles.heroLogoRing}>
                                        <IndexLogo url={index.logoUrl} name={index.name} />
                                    </div>
                                    <div className={styles.heroText}>
                                        <p className={styles.heroEyebrow}>{typeLabel}</p>
                                        <h1 className={styles.heroTitle}>{index.name}</h1>
                                        <p className={styles.heroMeta}>
                                            {index.symbol ? (
                                                <span className={styles.ticker}>{index.symbol}</span>
                                            ) : null}
                                            {index.country ? (
                                                <span className={styles.countryPill}>{index.country}</span>
                                            ) : null}
                                        </p>
                                    </div>
                                    <div className={styles.heroValueBlock}>
                                        <span className={styles.heroValueLabel}>Last (1D)</span>
                                        <span className={styles.heroValueMain}>
                                            {formatNumber(index.value)}
                                        </span>
                                        <span
                                            className={getColoredStyle(index.dayChange ?? 0, styles)}
                                        >
                                            {formatNumber(index.dayChange)} (
                                            {formatNumber(index.dayChangePerc)}%)
                                        </span>
                                    </div>
                                </div>
                            </section>

                            <section className={styles.section} aria-labelledby="idx-metrics-heading">
                                <div className={styles.sectionHead}>
                                    <span className={styles.sectionIcon} aria-hidden>
                                        <MdAssessment />
                                    </span>
                                    <h2 id="idx-metrics-heading" className={styles.sectionTitle}>
                                        Key levels
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

                            <section className={styles.section} aria-labelledby="idx-range-heading">
                                <div className={styles.sectionHead}>
                                    <span className={styles.sectionIcon} aria-hidden>
                                        <MdTimeline />
                                    </span>
                                    <h2 id="idx-range-heading" className={styles.sectionTitle}>
                                        Range context
                                    </h2>
                                </div>
                                <div className={styles.rangeCard}>
                                    <div className={styles.rangeBlock}>
                                        <div className={styles.rangeLabels}>
                                            <div>
                                                <span className={styles.rangeLabel}>Today low</span>
                                                <span className={styles.rangeNum}>
                                                    {formatNumber(index.low)}
                                                </span>
                                            </div>
                                            <div className={styles.rangeLabelsEnd}>
                                                <span className={styles.rangeLabel}>Today high</span>
                                                <span className={styles.rangeNum}>
                                                    {formatNumber(index.high)}
                                                </span>
                                            </div>
                                        </div>
                                        <div
                                            className={styles.rangeTrack}
                                            role="presentation"
                                            aria-hidden
                                        >
                                            <span
                                                className={styles.rangeThumb}
                                                style={{ left: `${todayPct}%` }}
                                            />
                                        </div>
                                        <p className={styles.rangeHint}>
                                            Marker shows last value within today&apos;s range.
                                        </p>
                                    </div>
                                    <div className={styles.rangeDivider} aria-hidden />
                                    <div className={styles.rangeBlock}>
                                        <div className={styles.rangeLabels}>
                                            <div>
                                                <span className={styles.rangeLabel}>52-week low</span>
                                                <span className={styles.rangeNum}>
                                                    {formatNumber(index.yearLowPrice)}
                                                </span>
                                            </div>
                                            <div className={styles.rangeLabelsEnd}>
                                                <span className={styles.rangeLabel}>52-week high</span>
                                                <span className={styles.rangeNum}>
                                                    {formatNumber(index.yearHighPrice)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className={styles.rangeTrack} role="presentation" aria-hidden>
                                            <span
                                                className={styles.rangeThumb}
                                                style={{ left: `${weekPct}%` }}
                                            />
                                        </div>
                                        <p className={styles.rangeHint}>
                                            Marker shows last value within the 52-week band.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {showCompanies && (
                                <section className={styles.section} aria-labelledby="idx-stocks-heading">
                                    <div className={styles.sectionHead}>
                                        <span className={styles.sectionIcon} aria-hidden>
                                            <MdCorporateFare />
                                        </span>
                                        <h2 id="idx-stocks-heading" className={styles.sectionTitle}>
                                            Constituent stocks
                                        </h2>
                                    </div>
                                    <div className={styles.tableCard}>
                                        <div
                                            className={styles.tableHead}
                                            role="row"
                                            aria-label="Column headers"
                                        >
                                            <span>Company</span>
                                            <span className={`${styles.colNum} ${styles.hideMobile}`}>
                                                M cap (Cr)
                                            </span>
                                            <span className={styles.colLast}>Price</span>
                                            <span className={`${styles.colNum} ${styles.hideMobile}`}>
                                                Sector
                                            </span>
                                        </div>

                                        {stocksLoading ? (
                                            <div className={styles.inlineLoading}>
                                                <span className={styles.loadingDot} aria-hidden />
                                                Loading stocks…
                                            </div>
                                        ) : stocksError ? (
                                            <div className={styles.inlineError} role="alert">
                                                <MdErrorOutline aria-hidden />
                                                <span>{stocksError}</span>
                                            </div>
                                        ) : stockList.length === 0 ? (
                                            <div className={styles.inlineEmpty}>
                                                No stocks to display for this page.
                                            </div>
                                        ) : (
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
                                                            <span className={styles.colName}>
                                                                <span className={styles.nameMain}>
                                                                    {stock.name}
                                                                </span>
                                                            </span>
                                                            <span
                                                                className={`${styles.colNum} ${styles.hideMobile}`}
                                                            >
                                                                {formatNumber(stock.marketCap)}
                                                            </span>
                                                            <span className={styles.colLast}>
                                                                <span className={styles.priceMain}>
                                                                    {formatNumber(stock.closePrice)}
                                                                </span>
                                                                <span
                                                                    className={
                                                                        stock.isPositive
                                                                            ? styles.changePos
                                                                            : styles.changeNeg
                                                                    }
                                                                >
                                                                    {stock.change}
                                                                </span>
                                                            </span>
                                                            <span
                                                                className={`${styles.colNum} ${styles.hideMobile}`}
                                                            >
                                                                {stock.sector || '—'}
                                                            </span>
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    {!stocksLoading && !stocksError && stockList.length > 0 && totalCount > 0 && (
                                        <div className={styles.paginationWrap}>
                                            <Pagination
                                                className="pagination-bar"
                                                siblingCount={1}
                                                currentPage={currentPage}
                                                totalCount={totalCount}
                                                pageSize={pageSize}
                                                onPageChange={setCurrentPage}
                                            />
                                        </div>
                                    )}
                                </section>
                            )}
                        </>
                    )}
                </div>
                <Footer />
            </div>
        </>
    );
}

export default IndexWidgetDetails;
