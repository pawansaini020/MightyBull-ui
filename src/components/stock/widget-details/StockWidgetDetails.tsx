import Headers from "../../layout/header/Header.tsx";
import styles from "./StockWidgetDetails.module.scss";
import {useEffect, useState} from "react";
import {useParams} from 'react-router-dom';
import axiosInstance from "../../../helpers/axiosInstance.ts";
import { formatNumber } from "../../../helpers/StringTransform.ts";
// import {Routers} from "../../../constants/AppConstants.ts";

function StockWidgetDetails() {

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
        quarterlyResults: any;
        profitAndLoss: any;
        balanceSheet: any;
        ratios: any;
        shareholdingPattern: any;
    }

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

    const { stockId } = useParams();
    const [stock, setStock] = useState<StockWidget | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchStockDetails = async (stockId: string | undefined) => {
        try {
            const response = await axiosInstance.get(`${import.meta.env.VITE_MIGHTYBULL_BASE_URL}/v1/api/stock/widget-details/${stockId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            console.log("Stock widget details: " + response.data);
            const stockWidget: StockWidget = response.data.data;
            setStock(stockWidget);
        } catch (error) {
            console.error('Failed to fetch stock details:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStockDetails(stockId);
    }, [stockId]);

    if (loading) {
        return (
            <>
                <Headers />
                <div>Loading...</div>
            </>
        );
    }
    if (!stock) {
        return (
            <>
                <Headers />
                <div className={styles['main-div']}>
                    Stock data not found.
                </div>
            </>
        );
    }

    const quarters = [
        "Mar 2022", "Jun 2022", "Sep 2022", "Dec 2022",
        "Mar 2023", "Jun 2023", "Sep 2023", "Dec 2023",
        "Mar 2024", "Jun 2024", "Sep 2024", "Dec 2024"
    ];

    const years = [
        "Mar 2013", "Mar 2014", "Mar 2015", "Mar 2016",
        "Mar 2017", "Mar 2018", "Mar 2019", "Mar 2020",
        "Mar 2021", "Mar 2022", "Mar 2023", "Mar 2024"
    ];

    return (
        <>
            <Headers />
            <div className={styles['main-div']}>
                <div className={styles['stock-details']}>
                    <div className={styles['stock-title']}>
                        <h3>{stock.name}</h3>
                    </div>
                    <div className={styles['stock-info-div']}>
                        <div className={styles.row}>
                            <div className={styles.card}>
                                <div className={styles.flexRow}>
                                    <span className={styles.label}>Score</span>
                                    <span className={styles.value}>{formatNumber(stock.score)}</span>
                                </div>
                            </div>
                            <div className={styles.card}>
                                <div className={styles.flexRow}>
                                    <span className={styles.label}>Stock P/E</span>
                                    <span className={styles.value}>{formatNumber(stock.stockPE)}</span>
                                </div>
                            </div>
                            <div className={styles.card}>
                                <div className={styles.flexRow}>
                                    <span className={styles.label}>Market Cap</span>
                                    <span className={styles.value}>₹ {formatNumber(stock.marketCap)} Cr.</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.row}>
                            <div className={styles.card}>
                                <div className={styles.flexRow}>
                                    <span className={styles.label}>Current Price</span>
                                    <span className={styles.value}>{formatNumber(stock.currentPrice)}</span>
                                </div>
                            </div>
                            <div className={styles.card}>
                                <div className={styles.flexRow}>
                                    <span className={styles.label}>Low</span>
                                    <span className={styles.value}>₹ {formatNumber(stock.low)}</span>
                                </div>
                            </div>
                            <div className={styles.card}>
                                <div className={styles.flexRow}>
                                    <span className={styles.label}>High</span>
                                    <span className={styles.value}>₹ {formatNumber(stock.high)}</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.row}>
                            <div className={styles.card}>
                                <div className={styles.flexRow}>
                                    <span className={styles.label}>ROCE</span>
                                    <span className={styles.value}>{formatNumber(stock.roce)} %</span>
                                </div>
                            </div>
                            <div className={styles.card}>
                                <div className={styles.flexRow}>
                                    <span className={styles.label}>ROE</span>
                                    <span className={styles.value}>{formatNumber(stock.roe)} %</span>
                                </div>
                            </div>
                            <div className={styles.card}>
                                <div className={styles.flexRow}>
                                    <span className={styles.label}>Dividend Yield</span>
                                    <span className={styles.value}>{formatNumber(stock.dividendYield)} %</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles['pros-cons-container']}>
                    <div className={styles['pros-cons-container-title']}>
                        <h3>Fundamental Analysis</h3>
                    </div>
                    <div className={styles['card-grid']}>
                        {/* Pros */}
                        <div className={styles['card-pros']}>
                            <h3 className={styles['card-heading']}>PROS</h3>
                            <ul className={styles['card-list']}>
                                {stock.prosList.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        </div>

                        {/* Cons */}
                        <div className={styles['card-cons']}>
                            <h3 className={styles['card-heading']}>CONS</h3>
                            <ul className={styles['card-list']}>
                                {stock.consList.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <p className={styles['disclaimer']}>
                        * The pros and cons are machine generated.{" "}
                        <div className={styles["tooltip-wrapper"]}>
                            <span className={styles["tooltip-icon"]}>ⓘ</span>
                            <div className={styles["custom-tooltip"]}>
                                These are AI generated insights. Please exercise caution and do your own analysis.
                            </div>
                        </div>
                    </p>
                </div>
                <div className={styles['stock-details']}>
                    <div className={styles['stock-title']}>
                        <h3>Score Analysis</h3>
                    </div>
                    <div className={styles['score-details']}>
                        <div className={styles['score-table-head']}>
                            <span><strong>Score Parameter</strong></span>
                            <span><strong>Score</strong></span>
                            <span><strong>Remark</strong></span>
                        </div>
                        <div className={styles['score-table-row']}>
                            <div className={styles['score-row-text']}>
                                <div>Market Cap</div>
                            </div>
                            <div className={styles['score-row-text']}>
                                <div>{formatNumber(stock.scoreDTO.marketCapScore)}</div>
                            </div>
                            <div className={styles['score-row-text']}>
                                <div>NA</div>
                            </div>
                        </div>
                        <div className={styles['score-table-row']}>
                            <div className={styles['score-row-text']}>
                                <div>Price</div>
                            </div>
                            <div className={styles['score-row-text']}>
                                <div>{formatNumber(stock.scoreDTO.priceScore)}</div>
                            </div>
                            <div className={styles['score-row-text']}>
                                <div>NA</div>
                            </div>
                        </div>
                        <div className={styles['score-table-row']}>
                            <div className={styles['score-row-text']}>
                                <div>Pe</div>
                            </div>
                            <div className={styles['score-row-text']}>
                                <div>{formatNumber(stock.scoreDTO.peScore)}</div>
                            </div>
                            <div className={styles['score-row-text']}>
                                <div>NA</div>
                            </div>
                        </div>
                        <div className={styles['score-table-row']}>
                            <div className={styles['score-row-text']}>
                                <div>Dividend Yield</div>
                            </div>
                            <div className={styles['score-row-text']}>
                                <div>{formatNumber(stock.scoreDTO.dividendYieldScore)}</div>
                            </div>
                            <div className={styles['score-row-text']}>
                                <div>NA</div>
                            </div>
                        </div>
                        <div className={styles['score-table-row']}>
                            <div className={styles['score-row-text']}>
                                <div>Roce</div>
                            </div>
                            <div className={styles['score-row-text']}>
                                <div>{formatNumber(stock.scoreDTO.roceScore)}</div>
                            </div>
                            <div className={styles['score-row-text']}>
                                <div>NA</div>
                            </div>
                        </div>
                        <div className={styles['score-table-row']}>
                            <div className={styles['score-row-text']}>
                                <div>Roc</div>
                            </div>
                            <div className={styles['score-row-text']}>
                                <div>{formatNumber(stock.scoreDTO.rocScore)}</div>
                            </div>
                            <div className={styles['score-row-text']}>
                                <div>NA</div>
                            </div>
                        </div>
                        <div className={styles['score-table-row']}>
                            <div className={styles['score-row-text']}>
                                <div>Quarterly Profit</div>
                            </div>
                            <div className={styles['score-row-text']}>
                                <div>{formatNumber(stock.scoreDTO.quarterlyProfitScore)}</div>
                            </div>
                            <div className={styles['score-row-text']}>
                                <div>NA</div>
                            </div>
                        </div>
                        <div className={styles['score-table-row']}>
                            <div className={styles['score-row-text']}>
                                <div>Profit And Loss</div>
                            </div>
                            <div className={styles['score-row-text']}>
                                <div>{formatNumber(stock.scoreDTO.profitAndLossScore)}</div>
                            </div>
                            <div className={styles['score-row-text']}>
                                <div>NA</div>
                            </div>
                        </div>
                        <div className={styles['score-table-row']}>
                            <div className={styles['score-row-text']}>
                                <div>Balance Sheet</div>
                            </div>
                            <div className={styles['score-row-text']}>
                                <div>{formatNumber(stock.scoreDTO.balanceSheetScore)}</div>
                            </div>
                            <div className={styles['score-row-text']}>
                                <div>NA</div>
                            </div>
                        </div>
                        <div className={styles['score-table-row']}>
                            <div className={styles['score-row-text']}>
                                <div>Cash Flow</div>
                            </div>
                            <div className={styles['score-row-text']}>
                                <div>{formatNumber(stock.scoreDTO.cashFlowScore)}</div>
                            </div>
                            <div className={styles['score-row-text']}>
                                <div>NA</div>
                            </div>
                        </div>
                        <div className={styles['score-table-row']}>
                            <div className={styles['score-row-text']}>
                                <div>Debtor Days</div>
                            </div>
                            <div className={styles['score-row-text']}>
                                <div>{formatNumber(stock.scoreDTO.debtorDaysScore)}</div>
                            </div>
                            <div className={styles['score-row-text']}>
                                <div>NA</div>
                            </div>
                        </div>
                        <div className={styles['score-table-row']}>
                            <div className={styles['score-row-text']}>
                                <div>Yearly Roce</div>
                            </div>
                            <div className={styles['score-row-text']}>
                                <div>{formatNumber(stock.scoreDTO.yearlyRoceScore)}</div>
                            </div>
                            <div className={styles['score-row-text']}>
                                <div>NA</div>
                            </div>
                        </div>
                        <div className={styles['score-table-row']}>
                            <div className={styles['score-row-text']}>
                                <div>Shareholding Pattern</div>
                            </div>
                            <div className={styles['score-row-text']}>
                                <div>{formatNumber(stock.scoreDTO.shareholdingPatternScore)}</div>
                            </div>
                            <div className={styles['score-row-text']}>
                                <div>NA</div>
                            </div>
                        </div>
                        <div className={styles['score-table-row']}>
                            <div className={styles['score-row-text']}>
                                <div>Total</div>
                            </div>
                            <div className={styles['score-row-text']}>
                                <div>{formatNumber(stock.scoreDTO.score)}</div>
                            </div>
                            <div className={styles['score-row-text']}>
                                <div>NA</div>
                            </div>
                        </div>
                    </div>
                </div>
                {/*quarterly results*/}
                <div className={styles['stock-details']}>
                    <div className={styles['stock-title']}>
                        <h3>Quarterly Results</h3>
                    </div>
                    <div className={styles['quarterly-results-container']}>
                        {/* Table Head - Quarters */}
                        <div className={styles['score-table-head']}>
                            <span><strong>Metric</strong></span>
                            {quarters.map((quarter, index) => (
                                <span key={index}><strong>{quarter}</strong></span>
                            ))}
                        </div>

                        {/* Table Rows - One per Metric */}
                        {Object.keys(stock.quarterlyResults).map((metric, i) => (
                            <div key={i} className={styles['score-table-row']}>
                                <div className={styles['score-row-text']}>
                                    <div>{metric}</div>
                                </div>
                                {quarters.map((q, index) => (
                                    <div key={index} className={styles['score-row-text']}>
                                        <div>
                                            {
                                                stock.quarterlyResults[metric][q] !== null &&
                                                stock.quarterlyResults[metric][q] !== undefined
                                                    ? formatNumber(stock.quarterlyResults[metric][q])
                                                    : "-"
                                            }
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/*Profit Loss*/}
                <div className={styles['stock-details']}>
                    <div className={styles['stock-title']}>
                        <h3>Profit And Loss</h3>
                    </div>
                    <div className={styles['profit-loss-container']}>
                        {/* Table Head - Years */}
                        <div className={styles['score-table-head']}>
                            <span><strong>Metric</strong></span>
                            {years.map((year, index) => (
                                <span key={index}><strong>{year}</strong></span>
                            ))}
                        </div>

                        {/* Table Rows - One per Metric */}
                        {Object.keys(stock.profitAndLoss).map((metric, i) => (
                            <div key={i} className={styles['score-table-row']}>
                                <div className={styles['score-row-text']}>
                                    <div>{metric}</div>
                                </div>
                                {years.map((q, index) => (
                                    <div key={index} className={styles['score-row-text']}>
                                        <div>
                                            {
                                                stock.profitAndLoss[metric][q] !== null &&
                                                stock.profitAndLoss[metric][q] !== undefined
                                                    ? formatNumber(stock.profitAndLoss[metric][q])
                                                    : "-"
                                            }
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/*Balance Sheet*/}
                <div className={styles['stock-details']}>
                    <div className={styles['stock-title']}>
                        <h3>Balance Sheet</h3>
                    </div>
                    <div className={styles['balance-sheet-container']}>
                        {/* Table Head - Years */}
                        <div className={styles['score-table-head']}>
                            <span><strong>Metric</strong></span>
                            {years.map((year, index) => (
                                <span key={index}><strong>{year}</strong></span>
                            ))}
                        </div>

                        {/* Table Rows - One per Metric */}
                        {Object.keys(stock.balanceSheet).map((metric, i) => (
                            <div key={i} className={styles['score-table-row']}>
                                <div className={styles['score-row-text']}>
                                    <div>{metric}</div>
                                </div>
                                {years.map((q, index) => (
                                    <div key={index} className={styles['score-row-text']}>
                                        <div>
                                            {
                                                stock.balanceSheet[metric][q] !== null &&
                                                stock.balanceSheet[metric][q] !== undefined
                                                    ? formatNumber(stock.balanceSheet[metric][q])
                                                    : "-"
                                            }
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/*Rations*/}
                <div className={styles['stock-details']}>
                    <div className={styles['stock-title']}>
                        <h3>Rations</h3>
                    </div>
                    <div className={styles['ratios-container']}>
                        {/* Table Head - Years */}
                        <div className={styles['score-table-head']}>
                            <span><strong>Metric</strong></span>
                            {years.map((year, index) => (
                                <span key={index}><strong>{year}</strong></span>
                            ))}
                        </div>

                        {/* Table Rows - One per Metric */}
                        {Object.keys(stock.ratios).map((metric, i) => (
                            <div key={i} className={styles['score-table-row']}>
                                <div className={styles['score-row-text']}>
                                    <div>{metric}</div>
                                </div>
                                {years.map((q, index) => (
                                    <div key={index} className={styles['score-row-text']}>
                                        <div>
                                            {
                                                stock.ratios[metric][q] !== null &&
                                                stock.ratios[metric][q] !== undefined
                                                    ? formatNumber(stock.ratios[metric][q])
                                                    : "-"
                                            }
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/*shareholding pattern*/}
                <div className={styles['stock-details']}>
                    <div className={styles['stock-title']}>
                        <h3>Shareholding Pattern</h3>
                    </div>
                    <div className={styles['shareholding-pattern-container']}>
                        {/* Table Head - Quarters */}
                        <div className={styles['score-table-head']}>
                            <span><strong>Metric</strong></span>
                            {quarters.map((quarter, index) => (
                                <span key={index}><strong>{quarter}</strong></span>
                            ))}
                        </div>

                        {/* Table Rows - One per Metric */}
                        {Object.keys(stock.shareholdingPattern).map((metric, i) => (
                            <div key={i} className={styles['score-table-row']}>
                                <div className={styles['score-row-text']}>
                                    <div>{metric}</div>
                                </div>
                                {quarters.map((q, index) => (
                                    <div key={index} className={styles['score-row-text']}>
                                        <div>
                                            {
                                                stock.shareholdingPattern[metric][q] !== null &&
                                                stock.shareholdingPattern[metric][q] !== undefined
                                                    ? formatNumber(stock.shareholdingPattern[metric][q])
                                                    : "-"
                                            }
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

export default StockWidgetDetails;