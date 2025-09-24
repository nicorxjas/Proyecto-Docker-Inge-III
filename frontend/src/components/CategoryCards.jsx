import { useEffect, useState } from 'react';
import apiClient from '../services/apiClient';

const capitalizeWords = (str) =>
  str.replace(/\b\w/g, (char) => char.toUpperCase());

const CategoryCards = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    apiClient
      .get('/products/categories')
      .then((res) => setCategories(res.data))
      .catch((err) => console.error('Error al cargar categorías:', err));
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {categories.map((cat) => (
        <div
          key={cat.category}
          className="bg-white/70 backdrop-blur-md uppercase rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between h-32"
        >
          {/* Texto descriptivo */}
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
              Total
            </p>
            <p className="text-lg font-medium text-gray-800">
              {capitalizeWords(cat.category)}
            </p>
          </div>

          {/* Número */}
          <div className="mt-auto text-right">
            <span className="text-3xl font-bold text-black">{cat.count}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CategoryCards;
