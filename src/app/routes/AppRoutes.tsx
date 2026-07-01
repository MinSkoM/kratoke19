import type { FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Search } from 'lucide-react';
import type { Order, Product } from '../../types';
import Menu, { ProductCard } from '../../features/products/components/Menu';
import Register from '../../features/member/components/Register';
import History from '../../features/order-history/components/History';
import PricingCalculatorPage from '../../features/pricing-calculator/components/PricingCalculatorPage';

interface AppRoutesProps {
  products: Product[];
  orders: Order[];
  isLoading: boolean;
  searchTerm: string;
  filteredProducts: Product[];
  groupedSearch: { name: string; category: string; variants: Product[] }[];
  expandedSearchName: string | null;
  setExpandedSearchName: (name: string | null | ((previous: string | null) => string | null)) => void;
  addToCart: (product: Product, quantity: number) => void;
  handleRegister: (name: string, phone: string, address: string) => Promise<void>;
  isRegistered: boolean;
  memberInfo: { name: string; phone: string; address: string } | null;
}

const AppRoutes: FC<AppRoutesProps> = ({
  products,
  orders,
  isLoading,
  searchTerm,
  filteredProducts,
  groupedSearch,
  expandedSearchName,
  setExpandedSearchName,
  addToCart,
  handleRegister,
  isRegistered,
  memberInfo,
}) => (
  <Routes>
    <Route path="/" element={<Navigate to="/calculator" replace />} />
    <Route path="/menu" element={
      searchTerm ? (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between px-0.5">
            <p className="text-sm font-semibold text-gray-500">พบ <strong className="text-gray-900">{filteredProducts.length}</strong> รายการ</p>
            <p className="text-xs text-gray-400">{groupedSearch.length} กลุ่ม</p>
          </div>
          {groupedSearch.length > 0
            ? groupedSearch.map(group => (
                <ProductCard
                  key={group.name}
                  name={group.name}
                  variants={group.variants}
                  isExpanded={expandedSearchName === group.name}
                  onToggle={() => setExpandedSearchName(previous => previous === group.name ? null : group.name)}
                  onAdd={(product, quantity) => {
                    addToCart(product, quantity);
                    setExpandedSearchName(null);
                  }}
                />
              ))
            : (
                <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                  <Search size={40} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-400 text-lg">ไม่พบสินค้าที่ค้นหา</p>
                </div>
              )}
        </div>
      ) : (
        <Menu products={products} isLoading={isLoading} addToCart={addToCart} />
      )
    } />
    <Route path="/calculator" element={<PricingCalculatorPage products={products} isLoading={isLoading} />} />
    <Route path="/register" element={<Register onRegister={handleRegister} isRegistered={isRegistered} initialData={memberInfo} />} />
    <Route path="/history" element={<History orders={orders} isLoading={isLoading} />} />
  </Routes>
);

export default AppRoutes;
