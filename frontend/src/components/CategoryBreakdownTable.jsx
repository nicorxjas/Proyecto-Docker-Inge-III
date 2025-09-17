import { useEffect, useState } from 'react';
import axios from 'axios';
import * as Tooltip from '@radix-ui/react-tooltip';

const CategoryTable = () => {
  const [categories, setCategories] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [hoveredColumn, setHoveredColumn] = useState(null);

  useEffect(() => {
    axios
      .get('http://localhost:3000/products/categories/summary')
      .then((res) => setCategories(res.data))
      .catch((err) => console.error('Error al cargar categorías:', err));
  }, []);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      } else {
        return { key, direction: 'asc' };
      }
    });
  };

  const sortedData = [...categories].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
    }

    return aVal?.toString().localeCompare(bVal?.toString());
  });

  const renderHeader = (label, key) => (
    <th
      className="px-6 py-3 font-medium text-gray-500 select-none"
      onMouseEnter={() => setHoveredColumn(key)}
      onMouseLeave={() => setHoveredColumn(null)}
    >
      <div className="flex items-center gap-1 w-fit">
        <span>{label}</span>
        <span
          onClick={() => handleSort(key)}
          className={`cursor-pointer text-sm transition-opacity duration-200 ${
            hoveredColumn === key ? 'opacity-100 text-gray-500' : 'opacity-0'
          }`}
        >
          {sortConfig.key === key ? (sortConfig.direction === 'asc' ? '▴' : '▾') : '↕'}
        </span>
      </div>
    </th>
  );

  return (
    <div className="bg-white rounded-xl shadow-md mt-10 overflow-hidden border-t border-gray-200">
      <div className="px-6 pt-6 pb-4">
        <h2 className="text-xl font-semibold text-gray-900">Resumen por Categoría</h2>
        <p className="text-sm text-gray-500">Total de precios y participación</p>
      </div>

      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-left">
          <tr>
            {renderHeader('Categoría', 'category')}
            {renderHeader('Total Precio', 'total')}
            {renderHeader('Porcentaje', 'percentage')}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sortedData.map((item) => (
            <tr key={item.category} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 font-medium text-gray-800">{item.category}</td>
              <td className="px-6 py-4 text-gray-700">
                {typeof item.total === 'number'
                  ? `$${item.total.toFixed(2)}`
                  : '—'}
              </td>
              <td className="px-6 py-4 text-gray-700">
                <Tooltip.Root delayDuration={200}>
                  <Tooltip.Trigger asChild>
                    <span className="truncate cursor-help inline-block max-w-[200px]">
                      {isNaN(Number(item.percentage))
                        ? '—'
                        : `${Number(item.percentage).toFixed(2)}%`}
                    </span>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      side="top"
                      sideOffset={4}
                      className="z-50 rounded-md bg-gray-800 px-3 py-2 text-sm text-white shadow-md max-w-sm"
                    >
                      Porcentaje del total:{' '}
                      {isNaN(Number(item.percentage))
                        ? '—'
                        : `${Number(item.percentage).toFixed(2)}%`}
                      <Tooltip.Arrow className="fill-gray-800" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CategoryTable;
