import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./MutualFundWidgetDetails.module.scss";
import Headers from "../../layout/header/Header.tsx";
import { formatNumber, formateString, formatDate } from "../../../helpers/StringTransform.ts";
import axiosInstance from "../../../helpers/axiosInstance.ts";
import { Routers } from "../../../constants/AppConstants.ts";
import Pagination from "../../global/pagination/Pagination.tsx";

// Types
interface ReturnStats {
    return1w?: number;
    return1y?: number;
    return3y?: number;
}

interface StockHoldingItem {
    mutualFundId: string;
    stock_search_id: string;
    company_name: string;
    sector_name: string;
    instrument_name: string;
    market_value: number;
    corpus_per: number;
    portfolio_date: Date;
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

function MutualFundWidgetDetails() {
    const { mutualFundId } = useParams<{ mutualFundId: string }>();
    const navigate = useNavigate();
    const [mutualFund, setMutualFund] = useState<MutualFundItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [stockHoldings, setStockHoldings] = useState<StockHoldingItem[]>([]);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);

    // API call to fetch mutual fund details
    const fetchMutualFundDetails = async (id: string | undefined) => {
        if (!id) return;
        
        try {
            const response = await axiosInstance.get(`/v1/api/mutual-fund/widget-details/${id}`);
            const mutualFundWidget: MutualFundItem = response.data.data;
            setMutualFund(mutualFundWidget);
            setStockHoldings(mutualFundWidget.holdings);
        } catch (error) {
            console.error("Error fetching mutual fund details:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMutualFundDetails(mutualFundId);
    }, [mutualFundId]);

    // Calculate paginated data
    const paginatedHoldings = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return stockHoldings.slice(startIndex, endIndex);
    }, [stockHoldings, currentPage, pageSize]);

    const handleStockClick = (stockId: string) => {
        navigate(Routers.StockWidgetDetails.replace(':stockId', encodeURIComponent(stockId)));
    };

    // Loading state
    if (loading) {
        return (
            <>
                <Headers />
                <div className={styles['index-title']}>Loading...</div>
            </>
        );
    }

    // Error state
    if (!mutualFund || !mutualFund.mutualFundId) {
        return (
            <>
                <Headers />
                <div className={styles['main-div']}>
                    <div className={styles['index-details']}>
                        <div className={styles['not-found-div']}>
                            Mutual fund data not found.
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Headers />
            <div className={styles['main-div']}>
                {/* Mutual Fund Overview Section */}
                <div className={styles['index-details']}>
                    <div className={styles['index-title']}>
                        <h3>{mutualFund.name}</h3>
                    </div>
                    
                    <div className={styles['index-info-div']}>
                        {/* Basic Info Row */}
                        <div className={styles.row}>
                            <div className={styles.card}>
                                <div className={styles.flexRow}>
                                    <span className={styles.label}>Current Value</span>
                                    <span className={styles.value}>
                                        {formateString(mutualFund.nav)} ({formateString(mutualFund.navDate)})
                                    </span>
                                </div>
                            </div>
                            <div className={styles.card}>
                                <div className={styles.flexRow}>
                                    <span className={styles.label}>Rank</span>
                                    <span className={styles.value}>{formateString(mutualFund.rank)}</span>
                                </div>
                            </div>
                            <div className={styles.card}>
                                <div className={styles.flexRow}>
                                    <span className={styles.label}>Aum</span>
                                    <span className={styles.value}>{formatNumber(mutualFund.aum)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Category Info Row */}
                        <div className={styles.row}>
                            <div className={styles.card}>
                                <div className={styles.flexRow}>
                                    <span className={styles.label}>Category</span>
                                    <span className={styles.value}>{formateString(mutualFund.category)}</span>
                                </div>
                            </div>
                            <div className={styles.card}>
                                <div className={styles.flexRow}>
                                    <span className={styles.label}>Cap</span>
                                    <span className={styles.value}>{formateString(mutualFund.subCategory)}</span>
                                </div>
                            </div>
                            <div className={styles.card}>
                                <div className={styles.flexRow}>
                                    <span className={styles.label}>Risk</span>
                                    <span className={styles.value}>{formateString(mutualFund.risk)} ({formateString(mutualFund.riskRating)})</span>
                                </div>
                            </div>
                        </div>

                        {/* Returns Info Row */}
                        <div className={styles.row}>
                            <div className={styles.card}>
                                <div className={styles.flexRow}>
                                    <span className={styles.label}>Return 1M</span>
                                    <span className={styles.value}>
                                        {formatNumber(mutualFund.returnStats[0]?.return1w || 0)} %
                                    </span>
                                </div>
                            </div>
                            <div className={styles.card}>
                                <div className={styles.flexRow}>
                                    <span className={styles.label}>Return 1y</span>
                                    <span className={styles.value}>
                                        {formatNumber(mutualFund.returnStats[0]?.return1y || 0)}  %
                                    </span>
                                </div>
                            </div>
                            <div className={styles.card}>
                                <div className={styles.flexRow}>
                                    <span className={styles.label}>Return 3y</span>
                                    <span className={styles.value}>
                                        {formatNumber(mutualFund.returnStats[0]?.return3y || 0)}  %
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Additional Info Row */}
                        <div className={styles.row}>
                            <div className={styles.card}>
                                <div className={styles.flexRow}>
                                    <span className={styles.label}>Stamp Duty</span>
                                    <span className={styles.value}>{formateString(mutualFund.stampDuty)}</span>
                                </div>
                            </div>
                            <div className={styles.card}>
                                <div className={styles.flexRow}>
                                    <span className={styles.label}>Expense Ratio</span>
                                    <span className={styles.value}>{formatNumber(mutualFund.expenseRatio)} %</span>
                                </div>
                            </div>
                            <div className={styles.card}>
                                <div className={styles.flexRow}>
                                    <span className={styles.label}>Exit Load Message</span>
                                    <span className={styles.value}>{formateString(mutualFund.exitLoadMessage)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Holdings Section */}
                <div className={styles['index-details']}>
                    <div className={styles['index-title']}>
                        <h3>Holdings</h3>
                    </div>
                    <div className={styles['stock-table']}>
                        <div className={styles['stock-table-head']}>
                            <span><strong>Company</strong></span>
                            <span><strong>Sector</strong></span>
                            <span><strong>Portfolio Date</strong></span>
                            <span><strong>Instrument Name</strong></span>
                            <span><strong>Market Price</strong></span>
                            <span><strong>Corpus %</strong></span>
                        </div>

                        {paginatedHoldings.map((stock, index) => (
                            <div
                                className={styles['stock-table-row']}
                                key={index}
                                onClick={() => handleStockClick(stock.stock_search_id)}
                            >
                                <div className={styles['row-text']}>
                                    <div>{formateString(stock.company_name)}</div>
                                </div>
                                <div className={styles['row-text']}>
                                    <div>{formateString(stock.sector_name)}</div>
                                </div>
                                <div className={styles['row-text']}>
                                    <div>{formatDate(stock.portfolio_date)}</div>
                                </div>
                                <div className={styles['row-text']}>
                                    <div>{formateString(stock.instrument_name)}</div>
                                </div>
                                <div className={styles['row-text']}>
                                    <div>{formatNumber(stock.market_value)}</div>
                                </div>
                                <div className={styles['row-text']}>
                                    <div>{formatNumber(stock.corpus_per)} %</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className={styles['pagination_container']}>
                        <Pagination
                            className="pagination-bar"
                            siblingCount={1}
                            currentPage={currentPage}
                            totalCount={stockHoldings.length}
                            pageSize={pageSize}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

export default MutualFundWidgetDetails;