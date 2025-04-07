// import Header from '../components/layout/header/Header.tsx'

function NotFound() {
    return (
        <>
            {/* <Header/>*/}
            <div className="content-container">
                <div style={{width:"100%", height:"100%", display:"flex", justifyContent:'center', alignItems:'center', color: 'var(--primary-text)'}}>
                    <h1>404: Page Not Found</h1>
                </div>
            </div>
        </>
    )
}

export default NotFound