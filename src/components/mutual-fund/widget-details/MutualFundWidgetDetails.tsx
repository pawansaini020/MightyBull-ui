import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './MutualFundWidgetDetails.module.scss';
import Headers from '../../layout/header/Header.tsx';
import Footer from '../../layout/footer/Footer.tsx';
import {
    formatNumber,
    formateString,
    formatDate,
    getColoredStyle,
} from '../../../helpers/StringTransform.ts';
import axiosInstance from '../../../helpers/axiosInstance.ts';
import { Routers } from '../../../constants/AppConstants.ts';
import Pagination from '../../global/pagination/Pagination.tsx';
import {
    MdSavings,
    MdArrowBack,
    MdAssessment,
    MdPieChart,
    MdInfoOutline,
} from 'react-icons/md';

interface ReturnStats {
    return1w?: number;
    return1y?: number;
    return3y?: number;
}

interface StockHoldingItem {
    stock_id: string;
    stock_search_id: string;
    company_name: string;
    sector_name: string;
    instrument_name: string;
    market_value: number;
    corpus_per: number;
    portfolio_date: string | Date;
}

interface MutualFundItem {
    mutualFundId: string;
    name: string;
    fundHouse: string;
    category: string;
    subCategory: string;
    risk: string;
    riskRating: number;
    logoUrl: string;
    benchmarkName: string;
    metaDesc: string;
    rank: number;
    nav: number;
    navDate: string;
    return1d: number;
    return1y: number;
    return3y: number;
    return5y: number;
    aum: number;
    expenseRatio: number;
    dividend: number;
    launchDate: string;
    exitLoadMessage: string;
    stampDuty: string;
    companies: string[];
    analysis: object;
    returnStats: ReturnStats[];
    holdings: StockHoldingItem[];
    lockIn: object;
}

const PAGE_SIZE = 10;

type MetricAccent = 'primary' | 'default' | 'bull' | 'bear';

interface MetricCardDef {
    label: string;
    value: string;
    accent: MetricAccent;
    returnVal?: number;
}

function FundLogo({ url, label }: { url: string; label: string }) {
    const [broken, setBroken] = useState(false);
    if (broken || !url?.trim()) {
        return (
            <span className={styles.logoFallbackHero} aria-hidden>
                {label.trim().slice(0, 2).toUpperCase() || 'MF'}
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

function MutualFundWidgetDetails() {
    const { mutualFundId } = useParams<{ mutualFundId: string }>();
    const navigate = useNavigate();
    const [mutualFund, setMutualFund] = useState<MutualFundItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchMutualFundDetails = useCallback(async (id: string | undefined) => {
        if (!id) {
            setFetchError('Missing fund id.');
            setMutualFund(null);
            setLoading(false);
            return;
        }
        setLoading(true);
        setFetchError(null);
        try {
            const response = await axiosInstance.get(
                `/v1/api/mutual-fund/widget-details/${encodeURIComponent(id)}`
            );
            const raw = response?.data?.data;
            if (raw && typeof raw === 'object' && String(raw.mutualFundId ?? '').length > 0) {
                setMutualFund(raw as MutualFundItem);
            } else {
                setMutualFund(null);
                setFetchError('Fund not found.');
            }
        } catch (err) {
            console.error('Error fetching mutual fund details:', err);
            setMutualFund(null);
            setFetchError('Could not load fund details.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [mutualFundId]);

    useEffect(() => {
        fetchMutualFundDetails(mutualFundId);
    }, [mutualFundId, fetchMutualFundDetails]);

    const holdings = useMemo(() => {
        const h = mutualFund?.holdings;
        return Array.isArray(h) ? h : [];
    }, [mutualFund?.holdings]);

    const firstStats = useMemo(() => {
        const rs = mutualFund?.returnStats;
        if (!Array.isArray(rs) || rs.length === 0) return null;
        return rs[0] ?? null;
    }, [mutualFund?.returnStats]);

    const paginatedHoldings = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return holdings.slice(start, start + PAGE_SIZE);
    }, [holdings, currentPage]);

    const metricCards = useMemo((): MetricCardDef[] => {
        if (!mutualFund) return [];
        const retCard = (label: string, v: number): MetricCardDef => ({
            label,
            value: `${formatNumber(v)}%`,
            accent: 'default',
            returnVal: v,
        });
        const cards: MetricCardDef[] = [
            {
                label: 'NAV',
                value: `${formatNumber(mutualFund.nav)} · ${formateString(mutualFund.navDate)}`,
                accent: 'primary',
            },
            { label: 'AUM (Cr)', value: formatNumber(mutualFund.aum), accent: 'default' },
            { label: 'Rank', value: formateString(mutualFund.rank), accent: 'default' },
            { label: 'Category', value: formateString(mutualFund.category), accent: 'default' },
            { label: 'Cap / style', value: formateString(mutualFund.subCategory), accent: 'default' },
            {
                label: 'Risk',
                value: `${formateString(mutualFund.risk)} · ${Number.isFinite(mutualFund.riskRating) ? mutualFund.riskRating : '—'}`,
                accent: 'default',
            },
        ];
        if (
            firstStats?.return1w != null &&
            Number.isFinite(Number(firstStats.return1w))
        ) {
            cards.push(retCard('1W return', Number(firstStats.return1w)));
        }
        cards.push(
            retCard('1D return', mutualFund.return1d),
            retCard('1Y return', mutualFund.return1y),
            retCard('3Y return', mutualFund.return3y),
            retCard('5Y return', mutualFund.return5y)
        );
        return cards;
    }, [mutualFund, firstStats]);

    const costRows = useMemo(() => {
        if (!mutualFund) return [];
        return [
            { label: 'Expense ratio', value: `${formatNumber(mutualFund.expenseRatio)}%` },
            { label: 'Stamp duty', value: formateString(mutualFund.stampDuty) },
            { label: 'Exit load', value: formateString(mutualFund.exitLoadMessage) },
            { label: 'Dividend', value: formatNumber(mutualFund.dividend) },
            { label: 'Launch', value: formateString(mutualFund.launchDate) },
            { label: 'Benchmark', value: formateString(mutualFund.benchmarkName) },
        ];
    }, [mutualFund]);

    const handleStockClick = useCallback(
        (stockId: string) => {
            if (!stockId) return;
            navigate(
                Routers.StockWidgetDetails.replace(':stockId', encodeURIComponent(stockId))
            );
        },
        [navigate]
    );

    const showHoldingsPagination = holdings.length > PAGE_SIZE;

    return (
        <>
            <Headers />
            <div className={styles.mainDiv}>
                <div className={styles.shell}>
                    {loading ? (
                        <div className={styles.loadingBlock}>
                            <span className={styles.loadingDot} aria-hidden />
                            Loading fund details…
                        </div>
                    ) : !mutualFund ? (
                        <div className={styles.emptyBlock}>
                            <MdInfoOutline className={styles.emptyIcon} aria-hidden />
                            <p className={styles.emptyTitle}>
                                {fetchError || 'Mutual fund not found'}
                            </p>
                            <p className={styles.emptyHint}>
                                Check the link or return to the fund list.
                            </p>
                            <button
                                type="button"
                                className={styles.backBtnSolid}
                                onClick={() => navigate(Routers.MutualFundWidgets)}
                            >
                                <MdArrowBack aria-hidden />
                                All mutual funds
                            </button>
                        </div>
                    ) : (
                        <>
                            <button
                                type="button"
                                className={styles.backLink}
                                onClick={() => navigate(Routers.MutualFundWidgets)}
                            >
                                <MdArrowBack aria-hidden />
                                All mutual funds
                            </button>

                            <section className={styles.hero} aria-label="Fund overview">
                                <div className={styles.heroGlow} aria-hidden />
                                <div className={styles.heroInner}>
                                    <div className={styles.heroLogoRing}>
                                        <FundLogo
                                            url={mutualFund.logoUrl}
                                            label={mutualFund.fundHouse || mutualFund.name}
                                        />
                                    </div>
                                    <div className={styles.heroText}>
                                        <p className={styles.heroEyebrow}>
                                            {formateString(mutualFund.fundHouse)}
                                        </p>
                                        <h1 className={styles.heroTitle}>{mutualFund.name}</h1>
                                        {mutualFund.metaDesc ? (
                                            <p className={styles.heroSub}>{mutualFund.metaDesc}</p>
                                        ) : null}
                                        <p className={styles.heroChips}>
                                            {mutualFund.benchmarkName ? (
                                                <span className={styles.chip}>
                                                    {mutualFund.benchmarkName}
                                                </span>
                                            ) : null}
                                            <span className={styles.chip}>
                                                {formateString(mutualFund.category)}
                                            </span>
                                        </p>
                                    </div>
                                    <div className={styles.heroValueBlock}>
                                        <span className={styles.heroValueLabel}>NAV</span>
                                        <span className={styles.heroValueMain}>
                                            {formatNumber(mutualFund.nav)}
                                        </span>
                                        <span className={styles.heroValueMeta}>
                                            {formateString(mutualFund.navDate)}
                                        </span>
                                        <span
                                            className={getColoredStyle(
                                                mutualFund.return1y ?? 0,
                                                styles
                                            )}
                                        >
                                            1Y: {formatNumber(mutualFund.return1y)}%
                                        </span>
                                    </div>
                                </div>
                            </section>

                            <section className={styles.section} aria-labelledby="mf-metrics-heading">
                                <div className={styles.sectionHead}>
                                    <span className={styles.sectionIcon} aria-hidden>
                                        <MdAssessment />
                                    </span>
                                    <h2 id="mf-metrics-heading" className={styles.sectionTitle}>
                                        Key metrics
                                    </h2>
                                </div>
                                <div className={styles.metricsGrid}>
                                    {metricCards.map((card) => (
                                        <div
                                            key={card.label}
                                            className={`${styles.metricCard} ${styles[`metricAccent_${card.accent}`]}`}
                                        >
                                            <span className={styles.metricLabel}>{card.label}</span>
                                            <span
                                                className={
                                                    card.returnVal !== undefined
                                                        ? `${styles.metricValue} ${getColoredStyle(card.returnVal, styles)}`
                                                        : styles.metricValue
                                                }
                                            >
                                                {card.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className={styles.section} aria-labelledby="mf-costs-heading">
                                <div className={styles.sectionHead}>
                                    <span className={styles.sectionIcon} aria-hidden>
                                        <MdSavings />
                                    </span>
                                    <h2 id="mf-costs-heading" className={styles.sectionTitle}>
                                        Costs & reference
                                    </h2>
                                </div>
                                <div className={styles.costCard}>
                                    <dl className={styles.costGrid}>
                                        {costRows.map(({ label, value }) => (
                                            <div key={label} className={styles.costRow}>
                                                <dt>{label}</dt>
                                                <dd>{value}</dd>
                                            </div>
                                        ))}
                                    </dl>
                                </div>
                            </section>

                            <section className={styles.section} aria-labelledby="mf-holdings-heading">
                                <div className={styles.sectionHead}>
                                    <span className={styles.sectionIcon} aria-hidden>
                                        <MdPieChart />
                                    </span>
                                    <div className={styles.sectionTitleRow}>
                                        <h2 id="mf-holdings-heading" className={styles.sectionTitle}>
                                            Holdings
                                        </h2>
                                        {holdings.length > 0 ? (
                                            <span className={styles.sectionCount}>
                                                {holdings.length} positions
                                            </span>
                                        ) : null}
                                    </div>
                                </div>

                                {holdings.length === 0 ? (
                                    <div className={styles.holdingsEmpty}>
                                        No holding data available for this fund.
                                    </div>
                                ) : (
                                    <>
                                        <div className={styles.tableCard}>
                                            <div className={styles.tableScroll}>
                                                <div className={styles.tableInner}>
                                                    <div
                                                        className={styles.tableHead}
                                                        role="row"
                                                        aria-label="Holdings columns"
                                                    >
                                                        <span>Company</span>
                                                        <span>Sector</span>
                                                        <span>As of</span>
                                                        <span>Instrument</span>
                                                        <span className={styles.colNum}>
                                                            Mkt. value
                                                        </span>
                                                        <span className={styles.colNum}>Corpus %</span>
                                                    </div>
                                                    <ul className={styles.tableBody}>
                                                        {paginatedHoldings.map((stock) => (
                                                            <li
                                                                key={
                                                                    stock.stock_id ||
                                                                    `${stock.company_name}-${stock.instrument_name}`
                                                                }
                                                            >
                                                                <button
                                                                    type="button"
                                                                    className={styles.tableRow}
                                                                    onClick={() =>
                                                                        handleStockClick(
                                                                            stock.stock_id
                                                                        )
                                                                    }
                                                                >
                                                                    <span className={styles.colCompany}>
                                                                        {formateString(
                                                                            stock.company_name
                                                                        )}
                                                                    </span>
                                                                    <span className={styles.colMuted}>
                                                                        {formateString(
                                                                            stock.sector_name
                                                                        )}
                                                                    </span>
                                                                    <span className={styles.colMuted}>
                                                                        {formatDate(
                                                                            stock.portfolio_date
                                                                        )}
                                                                    </span>
                                                                    <span className={styles.colMuted}>
                                                                        {formateString(
                                                                            stock.instrument_name
                                                                        )}
                                                                    </span>
                                                                    <span className={styles.colNum}>
                                                                        {formatNumber(
                                                                            stock.market_value
                                                                        )}
                                                                    </span>
                                                                    <span className={styles.colNum}>
                                                                        {formatNumber(
                                                                            stock.corpus_per
                                                                        )}
                                                                    </span>
                                                                </button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>

                                        {showHoldingsPagination && (
                                            <div className={styles.paginationWrap}>
                                                <Pagination
                                                    className="pagination-bar"
                                                    siblingCount={1}
                                                    currentPage={currentPage}
                                                    totalCount={holdings.length}
                                                    pageSize={PAGE_SIZE}
                                                    onPageChange={setCurrentPage}
                                                />
                                            </div>
                                        )}
                                    </>
                                )}
                            </section>
                        </>
                    )}
                </div>
                <Footer />
            </div>
        </>
    );
}

export default MutualFundWidgetDetails;
