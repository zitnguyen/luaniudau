import React from "react";
import Header from './Header';
import Footer from './Footer';
import { Outlet, useLocation } from 'react-router-dom';
import PageTransition from './PageTransition';

const PublicLayout = () => {
    const location = useLocation();

    React.useEffect(() => {
        window.scrollTo({ top: 0, behavior: "auto" });
    }, [location.pathname]);

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow pt-20"> {/* pt-20 to account for fixed header height */}
                <PageTransition>
                    <Outlet />
                </PageTransition>
            </main>
            <Footer />
        </div>
    );
};

export default PublicLayout;
