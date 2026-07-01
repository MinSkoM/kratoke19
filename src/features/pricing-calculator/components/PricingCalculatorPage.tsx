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
  const [activeTab, setActiveTab] = useState<CalculatorTab>('estimate');
  const {
    result,
    addProduct,
    removeItem,
    updateItemQuantity,
  } = usePricingCalculator();

  return (
    <div className="space-y-4 pb-32">
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

      <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-[#F7F8F6] via-[#F7F8F6]/95 to-transparent pt-5 pb-safe">
        <div className="max-w-md mx-auto px-4 pb-3">
          <nav className="grid grid-cols-2 gap-2 rounded-3xl border-2 border-[#1F2937]/20 bg-white p-2 shadow-[0_10px_30px_rgba(31,41,55,0.24)]">
            {[
              { value: 'estimate' as const, label: 'คำนวณราคา', icon: Calculator },
              { value: 'price-check' as const, label: 'เช็กราคา', icon: ListFilter },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveTab(tab.value)}
                  className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-sm font-black transition-colors ${
                    isActive
                      ? 'bg-[#1F2937] text-white shadow-sm'
                      : 'bg-white text-[#1F2937] hover:bg-[#EEF2F3]'
                  }`}
                >
                  <Icon size={20} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default PricingCalculatorPage;
