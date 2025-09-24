import { useEffect, useState } from 'react';
import apiClient from '../services/apiClient';
import { PieChart, Pie, Cell } from 'recharts';
import { FaLaptop, FaGem, FaMale, FaFemale, FaBox } from 'react-icons/fa';

const COLORS = ['#3b82f6', '#22c55e', '#a855f7', '#f59e0b'];

const ICONS = {
  electronics: FaLaptop,
  jewelery: FaGem,
  "men's clothing": FaMale,
  "women's clothing": FaFemale,
};

// Ajustes del anillo fino
const CHART_SIZE = 260;    // tamaño total del lienzo
const OUTER = 110;         // radio exterior
const THICKNESS = 12;      // espesor del anillo (fino)
const INNER = OUTER - THICKNESS; // radio interior

const CategoryDonutChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    apiClient
      .get('/products/categories')
      .then((res) => {
        const mapped = res.data.map((item, idx) => ({
          name: item.category,
          value: Number(item.count),
          color: COLORS[idx % COLORS.length],
          icon: ICONS[item.category] || FaBox,
        }));
        setData(mapped);
      })
      .catch((err) => console.error(err));
  }, []);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-[#f8fafd] rounded-2xl shadow-sm p-8 font-sans w-full">
      {/* Header */}
      <div className="flex items-start justify-between w-full">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Market Share</h2>
          <p className="text-sm text-gray-500">Amount of revenue in one month</p>
        </div>
        <span className="text-gray-400 text-xl leading-none">…</span>
      </div>

      {/* Donut fino y con colores separados */}
      <div className="relative flex justify-center mt-8">
        <PieChart width={CHART_SIZE} height={CHART_SIZE}>
          {/* Anillo base gris (360°) */}
          <Pie
            data={[{ name: 'bg', value: 100 }]}
            dataKey="value"
            cx="50%"
            cy="50%"
            innerRadius={INNER}
            outerRadius={OUTER}
            startAngle={90}
            endAngle={450}
            fill="#e5e7eb"   // gris claro
            stroke="none"
            isAnimationActive={false}
          />

          {/* Segmentos de colores finos */}
          <Pie
            data={data}
            dataKey="value"
            cx="50%"
            cy="50%"
            innerRadius={INNER}
            outerRadius={OUTER}
            startAngle={90}
            endAngle={450}
            paddingAngle={2}       // separadores claros entre segmentos
            cornerRadius={0}       // extremos rectos (estilo Power BI)
            stroke="#ffffff"       // filo blanco para separar aún más
            strokeWidth={2}
            isAnimationActive={false}
          >
            {data.map((item, i) => (
              <Cell key={i} fill={item.color} />
            ))}
          </Pie>
        </PieChart>

        {/* Centro */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-semibold text-gray-800">{total}</span>
          <span className="text-sm text-gray-500 mt-1">Total products</span>
        </div>
      </div>

      {/* Lista de categorías */}
      <div className="mt-8 divide-y divide-gray-200 w-full">
        {data.map((item) => (
          <div key={item.name} className="flex items-center py-4">
            {/* Indicador lateral (color del segmento) + icono */}
            <div className="w-1/6 flex items-center gap-3">
              <span
                className="inline-block h-3 w-1.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <item.icon className="text-xl text-gray-700" />
            </div>

            {/* Nombre y porcentaje */}
            <div className="w-4/6 flex justify-between">
              <span className="text-gray-700">{item.name}</span>
              <span className="text-gray-900 font-medium">
                {total ? ((item.value / total) * 100).toFixed(2) : 0}%
              </span>
            </div>

            {/* Total por categoría */}
            <div className="w-1/6 flex justify-end">
              <span className="text-gray-700">{item.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryDonutChart;
