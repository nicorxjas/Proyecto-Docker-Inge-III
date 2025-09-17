import { format } from 'date-fns';
import CategoryCards from './CategoryCards';
import ProductTable from './ProductTable';
import CategoryDonutChart from './CategoryDonutChart';

const Dashboard = () => {
  const today = format(new Date(), 'EEEE, MMMM d, yyyy');

  return (
    <div className="flex flex-col gap-6">
      {/* Encabezado */}
      <div>
        <p className="text-sm text-gray-500">{today}</p>
        <h1 className="text-2xl font-semibold text-gray-900 mt-1">
          Buen día, <span className="ml-1">Capitán!</span>
        </h1>
      </div>

      {/* Tarjetas de categoría */}
      <CategoryCards />

      {/* Tabla de productos + lado derecho */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabla de productos ocupa 2/3 del ancho */}
        <div className="lg:col-span-2">
          <ProductTable />
        </div>

        {/* Gráfico de participación */}
        <div className="flex flex-col gap-6">
          <CategoryDonutChart />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
