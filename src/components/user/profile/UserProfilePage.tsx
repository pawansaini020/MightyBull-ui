import styles from './UserProfilePage.module.scss';
import Headers from '../../layout/header/Header.tsx';
import Footer from '../../layout/footer/Footer.tsx';
import { useMemo, useState } from 'react';
import { getTwoCapitalChars } from '../../../helpers/StringTransform.ts';
import {
    MdOutlineBadge,
    MdOutlineAssessment,
    MdOutlineLock,
    MdOutlineDevices,
    MdOutlineCardMembership,
    MdOutlinePayment,
    MdOutlineVerifiedUser,
    MdOutlineDeleteForever,
    MdOutlineHistory,
    MdChevronRight,
} from 'react-icons/md';

const MENU = [
    { label: 'Basic Details', icon: MdOutlineBadge },
    { label: 'Reports', icon: MdOutlineAssessment },
    { label: 'Change Password', icon: MdOutlineLock },
    { label: 'Active Devices', icon: MdOutlineDevices },
    { label: 'Subscription', icon: MdOutlineCardMembership },
    { label: 'Payment', icon: MdOutlinePayment },
    { label: 'KYC', icon: MdOutlineVerifiedUser },
    { label: 'Delete Account', icon: MdOutlineDeleteForever },
    { label: 'Activity Log', icon: MdOutlineHistory },
] as const;

function UserProfilePage() {
    const loggedInUser = useMemo(() => localStorage.getItem('name') || '', []);
    const userInitials = useMemo(() => getTwoCapitalChars(loggedInUser || 'U'), [loggedInUser]);
    const [activeMenuIndex, setActiveMenuIndex] = useState(0);
    const SectionIcon = MENU[activeMenuIndex].icon;

    return (
        <>
            <Headers />
            <div className={styles.mainDiv}>
                <div className={styles.inner}>
                    <header className={styles.hero}>
                        <div className={styles.heroGlow} aria-hidden />
                        <div className={styles.heroContent}>
                            <div className={styles.heroMain}>
                                <div className={styles.avatarRing}>
                                    <div className={styles.avatar}>{userInitials}</div>
                                </div>
                                <div className={styles.heroText}>
                                    <p className={styles.eyebrow}>Account</p>
                                    <h1 className={styles.heroTitle}>{loggedInUser || 'Investor'}</h1>
                                    <p className={styles.heroSub}>
                                        Manage your MightyBull profile, security, and preferences.
                                    </p>
                                </div>
                            </div>
                            <div className={styles.heroTags}>
                                <span className={styles.tag}>NSE · BSE</span>
                                <span className={styles.tag}>Verified access</span>
                            </div>
                        </div>
                    </header>

                    <div className={styles.layout}>
                        <aside className={styles.sidebar} aria-label="Profile sections">
                            <p className={styles.sidebarTitle}>Sections</p>
                            <nav className={styles.nav}>
                                {MENU.map((item, idx) => {
                                    const Icon = item.icon;
                                    const isActive = activeMenuIndex === idx;
                                    return (
                                        <button
                                            key={item.label}
                                            type="button"
                                            className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                                            onClick={() => setActiveMenuIndex(idx)}
                                            aria-current={isActive ? 'page' : undefined}
                                        >
                                            <Icon className={styles.navIcon} aria-hidden />
                                            <span className={styles.navLabel}>{item.label}</span>
                                            <MdChevronRight
                                                className={`${styles.navChevron} ${isActive ? styles.navChevronActive : ''}`}
                                                aria-hidden
                                            />
                                        </button>
                                    );
                                })}
                            </nav>
                        </aside>

                        <main className={styles.main}>
                            <div className={styles.card}>
                                <div className={styles.cardHead}>
                                    <h2 className={styles.cardTitle}>{MENU[activeMenuIndex].label}</h2>
                                    <p className={styles.cardHint}>
                                        {activeMenuIndex === 0
                                            ? 'Your registered details as per KYC records.'
                                            : 'This section will be available in a future update.'}
                                    </p>
                                </div>

                                {activeMenuIndex === 0 ? (
                                    <dl className={styles.detailsList}>
                                        <div className={styles.row}>
                                            <dt className={styles.dt}>Name</dt>
                                            <dd className={styles.dd}>
                                                <span>{loggedInUser || '—'}</span>
                                            </dd>
                                        </div>
                                        <div className={styles.row}>
                                            <dt className={styles.dt}>PAN</dt>
                                            <dd className={styles.dd}>
                                                <span className={styles.masked}>••••••296X</span>
                                            </dd>
                                        </div>
                                        <div className={styles.row}>
                                            <dt className={styles.dt}>Date of birth</dt>
                                            <dd className={styles.dd}>
                                                <span className={styles.masked}>••/••/••••</span>
                                            </dd>
                                        </div>
                                        <div className={styles.row}>
                                            <dt className={styles.dt}>Gender</dt>
                                            <dd className={styles.dd}>
                                                <span>—</span>
                                            </dd>
                                        </div>
                                        <div className={styles.row}>
                                            <dt className={styles.dt}>Mobile</dt>
                                            <dd className={styles.dd}>
                                                <span className={styles.masked}>••••••••805</span>
                                                <button type="button" className={styles.editBtn}>
                                                    Edit
                                                </button>
                                            </dd>
                                        </div>
                                        <div className={styles.row}>
                                            <dt className={styles.dt}>Marital status</dt>
                                            <dd className={styles.dd}>
                                                <span>—</span>
                                            </dd>
                                        </div>
                                        <div className={styles.row}>
                                            <dt className={styles.dt}>Email</dt>
                                            <dd className={styles.dd}>
                                                <span className={styles.masked}>•••••••••@••••.com</span>
                                                <button type="button" className={styles.editBtn}>
                                                    Edit
                                                </button>
                                            </dd>
                                        </div>
                                        <div className={styles.row}>
                                            <dt className={styles.dt}>Unique client code</dt>
                                            <dd className={styles.dd}>
                                                <span className={styles.mono}>—</span>
                                            </dd>
                                        </div>
                                        <div className={styles.row}>
                                            <dt className={styles.dt}>Demat / BOID</dt>
                                            <dd className={styles.dd}>
                                                <span className={styles.masked}>••••••••••••5483</span>
                                            </dd>
                                        </div>
                                    </dl>
                                ) : (
                                    <div className={styles.placeholder}>
                                        <div className={styles.placeholderIcon} aria-hidden>
                                            <SectionIcon className={styles.placeholderGlyph} />
                                        </div>
                                        <p className={styles.placeholderTitle}>Coming soon</p>
                                        <p className={styles.placeholderText}>
                                            We&apos;re building {MENU[activeMenuIndex].label.toLowerCase()} for you.
                                            Check back after the next release.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </main>
                    </div>
                </div>
                <Footer />
            </div>
        </>
    );
}

export default UserProfilePage;
