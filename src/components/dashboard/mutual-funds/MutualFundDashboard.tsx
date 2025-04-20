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

    const fetchMutualFunds = async () => {
        try {
            const response = await axiosInstance.get('v1/api/mutual-fund/widgets?page_number=0&page_size=10');
            setMutualFunds(response.data.data);
        } catch (error) {
            console.error("Failed to fetch mutual fund widgets: ", error);
        }
    }

    const handleAllMutualFundsClick = () => {
        navigate(Routers.MutualFundWidgets)
    }

    useEffect(() => {
        fetchMutualFunds();
    }, [])

    return (
        <>
            <Headers />
            <div className={styles['main-div']}>
                <div className={styles['popular-funds']}>
                    <div className={styles['popular-funds-header']}>
                        <h2>Popular Funds</h2>
                        <a href="#" className={styles['all-mutual-funds']} onClick={handleAllMutualFundsClick}>All Mutual Funds</a>
                    </div>

                    <div className={styles['popular-funds-div']}>
                        <div className={styles['popular-funds-grid']}>
                            {mutualFunds.map((fund, idx) => (
                                <div key={idx} className={styles['popular-funds-card']}
                                     onClick={() => navigate(Routers.MutualFundWidgetDetails.replace(':mutualFundId', encodeURIComponent(fund.mutualFundId)))}
                                >
                                    <img src={fund.logoUrl} alt={fund.fundHouse} />
                                    <div className={styles['popular-funds-card-name']}>{fund.fundHouse}</div>
                                    <div className={styles['popular-funds-card-return']}>
                                        <span>{fund.return3y}</span> <span className={styles['duration']}>(3Y)</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default MutualFundDashboard;