import Sidebar from './components/Sidebar';
import RightSidebar from './components/RightSideBar';
import Dashboard from './components/Dashboard';
import * as Tooltip from '@radix-ui/react-tooltip';

function App() {
  return (
    <Tooltip.Provider>
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 bg-white p-6 overflow-auto">
        <Dashboard />
      </main>
    </div>
    </Tooltip.Provider>
  );
}

export default App;
