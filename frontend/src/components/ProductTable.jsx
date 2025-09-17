import { useEffect, useState } from 'react';
import axios from 'axios';
import * as Tooltip from '@radix-ui/react-tooltip';

const ProductTable = () => {
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [hoveredColumn, setHoveredColumn] = useState(null);

    const itemsPerPage = 5;

    useEffect(() => {
        axios
            .get('http://localhost:3000/products')
            .then((res) => setProducts(res.data))
            .catch((err) => console.error('Error al cargar productos:', err));
    }, []);

    const totalPages = Math.ceil(products.length / itemsPerPage);
    const startIdx = (currentPage - 1) * itemsPerPage;

    const sortedProducts = [...products].sort((a, b) => {
        if (!sortConfig.key) return 0;

        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];

        if (typeof aVal === 'number' && typeof bVal === 'number') {
            return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }

        const aStr = aVal?.toString().toLowerCase();
        const bStr = bVal?.toString().toLowerCase();

        if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });


    const currentProducts = sortedProducts.slice(startIdx, startIdx + itemsPerPage);

    const handlePrev = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handleSort = (key) => {
        setSortConfig((prev) => {
            if (prev.key === key) {
                return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
            } else {
                return { key, direction: 'asc' };
            }
        });
    };

    const categoryColors = {
        "men's clothing": 'bg-blue-100 text-blue-700 border border-blue-300',
        "jewelery": 'bg-yellow-100 text-yellow-700 border border-yellow-300',
        "electronics": 'bg-green-100 text-green-700 border border-green-300',
        "women's clothing": 'bg-pink-100 text-pink-700 border border-pink-300',
        default: 'bg-gray-100 text-gray-700 border border-gray-300',
    };


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
                    className={`
                        text-sm cursor-pointer transition-opacity duration-200
                        ${hoveredColumn === key ? 'opacity-100 text-gray-500' : 'opacity-0'}
                    `}
                >
                    {sortConfig.key === key ? (sortConfig.direction === 'asc' ? '▴' : '▾') : '↕'}
                </span>
            </div>
        </th>
    );

    return (
        <div className="bg-white rounded-xl shadow-md mt-10 overflow-hidden border-t border-gray-200">
            <div className="px-6 pt-6 pb-4">
                <h2 className="text-xl font-semibold text-gray-900">Top Products</h2>
                <p className="text-sm text-gray-500">Detailed information about the products</p>
            </div>

            <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-left">
                    <tr>
                        {renderHeader('Product', 'title')}
                        {renderHeader('Price', 'price')}
                        {renderHeader('Category', 'category')}
                        <th className="px-6 py-3 text-gray-500 font-medium">Description</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {currentProducts.map((prod) => {
                        const colorClass = categoryColors[prod.category?.toLowerCase()] || categoryColors.default;

                        return (
                            <tr key={prod.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 flex items-center gap-4">
                                    <img
                                        src={prod.image}
                                        alt={prod.title}
                                        className="w-10 h-10 object-contain"
                                    />
                                    <span className="text-gray-900 font-medium truncate max-w-[180px]">
                                        {prod.title}
                                    </span>
                                </td>

                                <td className="px-6 py-4 text-gray-700">${prod.price.toFixed(2)}</td>

                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${colorClass}`}>
                                        {prod.category}
                                    </span>
                                </td>

                                <td className="px-6 py-4 text-gray-600 max-w-xs">
                                    <Tooltip.Root delayDuration={200}>
                                        <Tooltip.Trigger asChild>
                                            <span className="truncate cursor-help inline-block max-w-[260px] align-top">
                                                {prod.description}
                                            </span>
                                        </Tooltip.Trigger>
                                        <Tooltip.Portal>
                                            <Tooltip.Content
                                                side="top"
                                                sideOffset={4}
                                                className="z-50 rounded-md bg-gray-800 px-3 py-2 text-sm text-white shadow-md max-w-sm"
                                            >
                                                {prod.description}
                                                <Tooltip.Arrow className="fill-gray-800" />
                                            </Tooltip.Content>
                                        </Tooltip.Portal>
                                    </Tooltip.Root>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>

            </table>

            <div className="flex items-center justify-between px-6 py-4 text-sm text-gray-500">
                <span>
                    Mostrando {startIdx + 1}–{Math.min(startIdx + itemsPerPage, products.length)} de {products.length} productos
                </span>
                <div className="flex gap-2">
                    <button
                        onClick={handlePrev}
                        disabled={currentPage === 1}
                        className="text-gray-500 px-4 py-2 rounded-lg transition-colors duration-200 hover:text-blue-600 hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        &lt; Anterior
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={currentPage === totalPages}
                        className="text-gray-500 px-4 py-2 rounded-lg transition-colors duration-200 hover:text-blue-600 hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Siguiente &gt;
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductTable;
