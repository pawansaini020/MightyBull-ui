import Footer from '../components/layout/footer/Footer.tsx';

function NotFound() {
    return (
        <>
            <div className="content-container">
                <div style={{width:"100%", height:"100%", display:"flex", justifyContent:'center', alignItems:'center', color: 'var(--primary-text)'}}>
                    <h1>404: Page Not Found</h1>
                </div>
            </div>
            <Footer />
        </>
    )
}

export default NotFound