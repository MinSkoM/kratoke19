import type { FC } from 'react';
import type { Product } from '../../../types';
import PriceCaptureList from './PriceCaptureList';
import PricingForm from './PricingForm';
import PricingResult from './PricingResult';
import { usePricingCalculator } from '../usePricingCalculator';

interface PricingCalculatorPageProps {
  products: Product[];
  isLoading: boolean;
}

const PricingCalculatorPage: FC<PricingCalculatorPageProps> = ({ products, isLoading }) => {
  const {
    result,
    addProduct,
    removeItem,
    updateItemQuantity,
  } = usePricingCalculator();

  return (
    <div className="space-y-4 pb-28">
      <PriceCaptureList products={products} />
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
      <p className="px-1 text-xs leading-relaxed text-gray-400">
        ราคานี้เป็นการประเมินเบื้องต้นเท่านั้น ราคาจริงอาจเปลี่ยนตามสต็อก น้ำหนัก ระยะทาง และเงื่อนไขหน้าร้าน
      </p>
    </div>
  );
};

export default PricingCalculatorPage;
