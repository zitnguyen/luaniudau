import Header from './Header';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';
import PageTransition from './PageTransition';

const PublicLayout = () => {
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
