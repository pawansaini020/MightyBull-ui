// import { useNavigate } from "react-router-dom";
import Headers from "../layout/header/Header.tsx";
import styles from './Dashboard.module.scss';
import { FaPlus } from 'react-icons/fa';

function Dashboard() {

    interface StockItem {
        name: string;
        price: string;
        change: string;
        isPositive: boolean;
    }

    const stockList: StockItem[] = [
        { name: 'Reliance Industries', price: '₹1,204.70', change: '-44.00 (3.52%)', isPositive: false },
        { name: 'HDFC Bank', price: '₹1,817.30', change: '22.45 (1.25%)', isPositive: true },
        { name: 'TCS', price: '₹3,299.40', change: '-103.75 (3.05%)', isPositive: false },
        { name: 'Bharti Airtel', price: '₹1,743.45', change: '-2.55 (0.15%)', isPositive: false },
        { name: 'ICICI Bank', price: '₹1,335.30', change: '5.75 (0.43%)', isPositive: true },
        { name: 'SBI', price: '₹767.45', change: '-11.75 (1.51%)', isPositive: false },
        { name: 'Infosys', price: '₹1,451.65', change: '-44.85 (3.00%)', isPositive: false },
        { name: 'Bajaj Finance', price: '₹8,718.85', change: '124.25 (1.45%)', isPositive: true },
        { name: 'Hindustan Unilever', price: '₹2,244.55', change: '0.00 (0.00%)', isPositive: true },
        { name: 'LIC', price: '₹792.15', change: '-23.15 (2.84%)', isPositive: false },
    ];

    return (
        <>
            <Headers/>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h3>Top by Market Cap</h3>
                    <a href="#" className={styles.seeMore}>See more</a>
                </div>

                <div className={styles.table}>
                    <div className={styles.tableHead}>
                        <span>Company</span>
                        <span>Market Price</span>
                        <span>Watchlist</span>
                    </div>

                    {stockList.map((stock, index) => (
                        <div className={styles.tableRow} key={index}>
                            <div className={styles.company}>
                                <span>{stock.name}</span>
                                <div className={styles.chartPlaceholder}>
                                    {/* Replace this with actual chart */}
                                    <div className={stock.isPositive ? styles.greenChart : styles.redChart}></div>
                                </div>
                            </div>

                            <div className={styles.price}>
                                <div>{stock.price}</div>
                                <div className={stock.isPositive ? styles.positive : styles.negative}>{stock.change}</div>
                            </div>

                            <div className={styles.watchlist}>
                                <button className={styles.watchlistBtn}>
                                    <FaPlus size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.pagination}>
                    <button>{'<'}</button>
                    <button className={styles.active}>1</button>
                    <button>2</button>
                    <button>...</button>
                    <button>5</button>
                    <button>{'>'}</button>
                </div>
            </div>
        </>
    );
}

export default Dashboard;
