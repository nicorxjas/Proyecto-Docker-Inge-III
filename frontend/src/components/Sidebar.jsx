import { FaTachometerAlt, FaUser, FaProjectDiagram, FaFileAlt, FaBlog, FaChartPie } from 'react-icons/fa';

const Sidebar = () => {
  return (
    <aside className="h-screen w-64 bg-white border-r border-gray-100 p-5 flex flex-col text-gray-800">

      {/* Logo */}
      <div className="text-2xl font-bold mb-8">El Carmen</div>

      {/* Dashboards */}
      <div className="text-sm text-gray-500 uppercase mb-2">Dashboards</div>
      <nav className="flex flex-col gap-2 mb-6">
        <NavItem icon={<FaTachometerAlt />} text="Overview" active />
      </nav>

      {/* Pages */}
      <div className="text-sm text-gray-500 uppercase mb-2">Pages</div>
      <nav className="flex flex-col gap-2">
        <NavItem icon={<FaUser />} text="Ingresos" />
        <NavItem icon={<FaTachometerAlt />} text="Gastos" />
        <NavItem icon={<FaProjectDiagram />} text="Manteninimiento Realizado" />
        <NavItem icon={<FaFileAlt />} text="Análisis Patentes" />
        <NavItem icon={<FaUser />} text="Análisis por Patente" />
      </nav>

      {/* Footer logo (opcional) */}
      <div className="mt-auto pt-10 text-sm text-gray-400">© FINNAPP</div>
    </aside>
  );
};

const NavItem = ({ icon, text, active }) => (
  <div className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all
    ${active ? 'bg-gray-100 font-semibold text-black' : 'text-gray-600 hover:bg-gray-50'}`}>
    <span className="text-lg">{icon}</span>
    <span>{text}</span>
  </div>
);

export default Sidebar;
