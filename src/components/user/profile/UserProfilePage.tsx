import styles from './UserProfilePage.module.scss';
import Headers from "../../layout/header/Header.tsx";
import {useMemo, useState} from 'react';
import { getTwoCapitalChars } from '../../../helpers/StringTransform.ts';

function UserProfilePage() {

    const loggedInUser = useMemo(() => localStorage.getItem('name') || '', []);
    const userInitials = useMemo(() => getTwoCapitalChars(loggedInUser || 'U'), [loggedInUser]);

    const menuItems = [
        'Basic Details', 'Reports', 'Change Password', 'Active Devices', 
        'Subscription Details', 'Payment Details', 'KYC Details', 
        'Delete Account', 'Activity Log'
    ];

    const [activeMenuIndex, setActiveMenuIndex] = useState(0);

    return (
        <>
            <Headers />
            <div className={styles['main-div']}>
                <div className={styles['profile-page']}>
                    <aside className={styles['sidebar']}>
                        <div className={styles['profile-header']}>
                            <div className={styles['avatar']}>{userInitials}</div>
                            <h3>{loggedInUser}</h3>
                        </div>
                        <nav className={styles['menu']}>
                            {menuItems.map((item, idx) => (
                                <div 
                                    key={idx} 
                                    className={`${styles['menu-item']} ${activeMenuIndex === idx ? styles['active'] : ''}`}
                                    onClick={() => setActiveMenuIndex(idx)}
                                >
                                    {item}
                                </div>
                            ))}
                        </nav>
                    </aside>

                    <section className={styles['profile-details']}>
                        <div className={styles['details-grid']}>
                            <div className={styles['field']}><label>Name</label><span>Pawan Saini</span></div>
                            <div className={styles['field']}><label>PAN</label><span>*****296H</span></div>
                            <div className={styles['field']}><label>Date of Birth</label><span>**/**/1995</span></div>
                            <div className={styles['field']}><label>Gender</label><span>Female</span></div>
                            <div className={styles['field']}><label>Mobile Number</label><span>*****01805 <button className="edit">Edit</button></span></div>
                            <div className={styles['field']}><label>Marital Status</label><span>Married</span></div>
                            <div className={styles['field']}><label>Email</label><span>paw*********0@gmail.com <button className="edit">Edit</button></span></div>
                            <div className={styles['field']}><label>Unique Client Code</label><span>2008332671</span></div>
                            <div className={styles['field']}><label>Demat Acc Number / BOID</label><span>1208870366145483</span></div>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}

export default UserProfilePage;