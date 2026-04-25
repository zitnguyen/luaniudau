import React from "react";
import Header from './Header';
import Footer from './Footer';
import { Outlet, useLocation } from 'react-router-dom';
import PageTransition from './PageTransition';

const PublicLayout = () => {
    const location = useLocation();
    const isLearningPage = location.pathname.startsWith("/learning/");

    React.useEffect(() => {
        window.scrollTo({ top: 0, behavior: "auto" });
    }, [location.pathname]);

    return (
        <div className="min-h-screen flex flex-col">
            {isLearningPage ? (
                <main className="flex-grow">
                    <Outlet />
                </main>
            ) : (
                <>
                    <Header />
                    <main className="flex-grow">
                        <PageTransition>
                            <Outlet />
                        </PageTransition>
                    </main>
                    <Footer />
                </>
            )}
        </div>
    );
};

export default PublicLayout;
