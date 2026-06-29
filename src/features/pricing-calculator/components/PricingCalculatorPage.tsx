import { useState } from 'react';
import type { FC } from 'react';
import { Calculator, ListFilter } from 'lucide-react';
import type { Product } from '../../../types';
import PriceCaptureList from './PriceCaptureList';
import PricingForm from './PricingForm';
import PricingResult from './PricingResult';
import { usePricingCalculator } from '../usePricingCalculator';

interface PricingCalculatorPageProps {
  products: Product[];
  isLoading: boolean;
}

type CalculatorTab = 'price-check' | 'estimate';

const PricingCalculatorPage: FC<PricingCalculatorPageProps> = ({ products, isLoading }) => {
  const [activeTab, setActiveTab] = useState<CalculatorTab>('price-check');
  const {
    result,
    addProduct,
    removeItem,
    updateItemQuantity,
  } = usePricingCalculator();

  return (
    <div className="space-y-4 pb-28">
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-2 grid grid-cols-2 gap-2">
        {[
          { value: 'price-check' as const, label: 'เช็กราคา', icon: ListFilter },
          { value: 'estimate' as const, label: 'คำนวณ', icon: Calculator },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-black transition-all ${
                isActive
                  ? 'bg-[#142D95] text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Icon size={17} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'price-check' ? (
        <PriceCaptureList products={products} />
      ) : (
        <>
          <PricingForm
            products={products}
            isLoading={isLoading}
            onAddProduct={addProduct}
          />
          <PricingResult
            result={result}
            onRemoveItem={removeItem}
            onUpdateQuantity={updateItemQuantity}
          />
        </>
      )}

      {activeTab === 'estimate' && (
        <p className="px-1 text-xs leading-relaxed text-gray-400">
          ราคานี้เป็นการประเมินเบื้องต้นเท่านั้น ราคาจริงอาจเปลี่ยนตามระยะทาง และเงื่อนไขหน้าร้าน
        </p>
      )}
    </div>
  );
};

export default PricingCalculatorPage;
