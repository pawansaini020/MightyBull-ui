import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import styles from './MutualFundDashboard.module.scss';
import Headers from '../../layout/header/Header.tsx';
import axiosInstance from "../../../helpers/axiosInstance.ts";
import {Routers} from "../../../constants/AppConstants.ts";

function MutualFundDashboard() {

    interface MutualFundItem {
        mutualFundId: string;
        name: string;
        fundHouse: string;
        logoUrl: string;
        return3y: number;
    }

    const navigate = useNavigate();

    const [mutualFunds, setMutualFunds] = useState<MutualFundItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMutualFunds = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axiosInstance.get('v1/api/mutual-fund/widgets?page_number=0&page_size=10');
            
            if (!response?.data?.data) {
                throw new Error('Invalid response format');
            }

            const funds = response.data.data.map((fund: MutualFundItem) => ({
                mutualFundId: fund?.mutualFundId || '',
                name: fund?.name || 'N/A',
                fundHouse: fund?.fundHouse || 'N/A',
                logoUrl: fund?.logoUrl || '/default-fund-logo.png',
                return3y: fund?.return3y || 0
            }));

            setMutualFunds(funds);
        } catch (error: any) {
            console.error("Failed to fetch mutual fund widgets: ", error);
            setError(error?.message || 'Failed to fetch mutual funds');
            setMutualFunds([]);
        } finally {
            setIsLoading(false);
        }
    }

    const handleAllMutualFundsClick = (e: React.MouseEvent) => {
        e.preventDefault();
        navigate(Routers.MutualFundWidgets);
    }

    const handleFundClick = (mutualFundId: string) => {
        if (!mutualFundId) return;
        navigate(Routers.MutualFundWidgetDetails.replace(':mutualFundId', encodeURIComponent(mutualFundId)));
    }

    useEffect(() => {
        fetchMutualFunds();
    }, []);

    const TABS = [
        { key: 'STOCK', label: 'Stocks' },
        { key: 'MUTUAL_FUND', label: 'Mutual Fund' },
    ];

    return (
        <>
            <Headers currentTab={TABS[1].key} />
            <div className={styles['main-div']}>
                <div className={styles['popular-funds']}>
                    <div className={styles['popular-funds-header']}>
                        <h2>Popular Funds</h2>
                        <h2>
                            <a href="#" className={styles['all-mutual-funds']} onClick={handleAllMutualFundsClick}>
                                All Mutual Funds
                            </a>
                        </h2>
                    </div>

                    <div className={styles['popular-funds-div']}>
                        {isLoading ? (
                            <div className={styles['loading-message']}>Loading...</div>
                        ) : error ? (
                            <div className={styles['error-message']}>{error}</div>
                        ) : mutualFunds.length === 0 ? (
                            <div className={styles['no-data-message']}>No mutual funds found</div>
                        ) : (
                            <div className={styles['popular-funds-grid']}>
                                {mutualFunds.map((fund, idx) => (
                                    <div 
                                        key={fund.mutualFundId || idx} 
                                        className={styles['popular-funds-card']}
                                        onClick={() => handleFundClick(fund.mutualFundId)}
                                    >
                                        <img 
                                            src={fund.logoUrl} 
                                            alt={fund.fundHouse} 
                                            onError={(e) => {
                                                const img = e.target as HTMLImageElement;
                                                img.src = '/default-fund-logo.png';
                                            }}
                                        />
                                        <div className={styles['popular-funds-card-name']}>
                                            {fund.fundHouse}
                                        </div>
                                        <div className={styles['popular-funds-card-return']}>
                                            <span>{fund.return3y.toFixed(2)}%</span>
                                            <span className={styles['duration']}>(3Y)</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default MutualFundDashboard;