import { useMemo, useState } from 'react';
import type { FC } from 'react';
import { ArrowLeft, Calculator, Package } from 'lucide-react';
import type { Product } from '../../../types';
import { getProductImage } from '../../../utils/productImage';
import { ProductCard } from '../../products/components/Menu';

interface PricingFormProps {
  products: Product[];
  isLoading: boolean;
  onAddProduct: (product: Product, quantity: number) => void;
}

const PricingForm: FC<PricingFormProps> = ({
  products,
  isLoading,
  onAddProduct,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [expandedName, setExpandedName] = useState<string | null>(null);

  const groups = useMemo(
    () => Array.from(new Set(products.map(product => product.id?.charAt(0).toUpperCase()).filter(Boolean))).sort(),
    [products],
  );

  const namesInGroup = useMemo(() => {
    if (!selectedGroup) return [];
    return Array.from(new Set(
      products
        .filter(product => product.id?.charAt(0).toUpperCase() === selectedGroup)
        .map(product => product.name),
    ));
  }, [products, selectedGroup]);

  if (isLoading) {
    return (
      <div className="text-center py-20 text-gray-400">
        <Package size={44} className="mx-auto mb-3 opacity-30 animate-pulse" />
        <p className="text-lg font-medium">กำลังโหลดรายการสินค้า...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {!selectedGroup && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Calculator size={22} className="text-[#142D95]" />
            <h2 className="text-2xl font-black text-gray-900">เลือกสินค้าเพื่อคำนวณ</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {groups.map(group => {
              const groupProducts = products.filter(product => product.id?.charAt(0).toUpperCase() === group);
              const previews = Array.from(new Map(groupProducts.map(product => [product.name, product])).values()).slice(0, 4);
              return (
                <button
                  key={group}
                  type="button"
                  onClick={() => {
                    setSelectedGroup(group);
                    setExpandedName(null);
                  }}
                  className="relative h-40 rounded-2xl overflow-hidden shadow-sm active:scale-95 transition-transform text-left bg-gray-100"
                >
                  <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                    {[0, 1, 2, 3].map(index => (
                      <div key={index} className="overflow-hidden bg-gray-200">
                        {previews[index] && (
                          <img
                            src={getProductImage(previews[index])}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={event => { (event.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute top-3 left-3.5 w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <span className="text-white font-black text-lg leading-none">{group}</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3.5">
                    <p className="text-white/70 text-xs font-medium">{groupProducts.length} รายการ</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {selectedGroup && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <button
              type="button"
              onClick={() => {
                setSelectedGroup(null);
                setExpandedName(null);
              }}
              className="flex items-center gap-1.5 bg-white border border-gray-200 text-[#142D95] font-bold text-sm px-3.5 py-2 rounded-full shadow-sm active:scale-95 transition-transform shrink-0"
            >
              <ArrowLeft size={15} /> ย้อนกลับ
            </button>
            <span className="text-sm font-semibold text-gray-600">กลุ่ม {selectedGroup}</span>
          </div>

          <div className="space-y-2.5">
            {namesInGroup.map(name => {
              const variants = products.filter(
                product => product.name === name && product.id?.charAt(0).toUpperCase() === selectedGroup,
              );
              return (
                <ProductCard
                  key={name}
                  name={name}
                  variants={variants}
                  isExpanded={expandedName === name}
                  onToggle={() => setExpandedName(previous => previous === name ? null : name)}
                  onAdd={(product, quantity) => {
                    onAddProduct(product, quantity);
                    setExpandedName(null);
                  }}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingForm;
