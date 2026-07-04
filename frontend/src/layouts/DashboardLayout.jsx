import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const DashboardLayout = ({ children }) => {
  return (
    <div className="bms-layout">
      {/* Desktop sidebar */}
      <div className="bms-layout-sidebar">
        <Sidebar />
      </div>

      {/* Right side */}
      <div className="bms-layout-main">
        <Navbar />
        <main className="bms-layout-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;