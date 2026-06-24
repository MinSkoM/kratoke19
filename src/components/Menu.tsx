import { useState, useMemo } from 'react';
import type { FC } from 'react';
import { Product } from '../types';
import { ChevronRight, ArrowLeft, Package, Plus, Minus } from 'lucide-react';
import { getProductImage } from '../utils/productImage';

interface MenuProps {
  products: Product[];
  isLoading: boolean;
  addToCart: (product: Product, quantity: number) => void;
}

const Menu: FC<MenuProps> = ({ products, isLoading, addToCart }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);

  const categories = useMemo(() => (
    Array.from(new Set(products.map(p => p.category))).filter(Boolean)
  ), [products]);

  const productNamesInCategory = useMemo(() => {
    if (!selectedCategory) return [];
    return Array.from(new Set(
      products.filter(p => p.category === selectedCategory).map(p => p.name)
    ));
  }, [products, selectedCategory]);

  const variants = useMemo(() => {
    if (!selectedName || !selectedCategory) return [];
    return products.filter(p => p.name === selectedName && p.category === selectedCategory);
  }, [products, selectedName, selectedCategory]);

  const goBack = () => {
    if (selectedName) setSelectedName(null);
    else if (selectedCategory) setSelectedCategory(null);
  };

  if (isLoading) return (
    <div className="text-center py-16 text-gray-400">
      <Package size={40} className="mx-auto mb-3 animate-pulse" />
      <p className="text-lg">กำลังโหลดรายการสินค้า...</p>
    </div>
  );

  return (
    <div className="pb-24">
      {/* Breadcrumb */}
      {selectedCategory && (
        <div className="flex items-center gap-2 mb-4">
          <button onClick={goBack} className="flex items-center gap-1 text-blue-600 font-bold text-base py-2 pr-2">
            <ArrowLeft size={20} /> ย้อนกลับ
          </button>
          <span className="text-gray-300">›</span>
          <span className="text-gray-600 font-semibold text-base truncate">{selectedCategory}</span>
          {selectedName && (
            <>
              <span className="text-gray-300">›</span>
              <span className="text-gray-800 font-bold text-base truncate">{selectedName}</span>
            </>
          )}
        </div>
      )}

      {/* Page 1: Categories */}
      {!selectedCategory && (
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">หมวดหมู่สินค้า</h2>
          {categories.map(cat => {
            const sample = products.find(p => p.category === cat);
            return (
              <div
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 active:bg-gray-50 transition-colors cursor-pointer"
              >
                {sample && (
                  <img
                    src={getProductImage(sample)}
                    alt={cat}
                    className="w-16 h-16 object-cover rounded-xl border border-gray-100 shrink-0"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
                <div className="flex-1">
                  <span className="font-bold text-gray-800 text-lg">{cat}</span>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {products.filter(p => p.category === cat).length} รายการ
                  </p>
                </div>
                <ChevronRight size={22} className="text-gray-300 shrink-0" />
              </div>
            );
          })}
        </div>
      )}

      {/* Page 2: Product names in category */}
      {selectedCategory && !selectedName && (
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-gray-700 mb-2">{selectedCategory}</h2>
          {productNamesInCategory.map(name => {
            const productVariants = products.filter(p => p.name === name && p.category === selectedCategory);
            const firstItem = productVariants[0];

            if (productVariants.length === 1) {
              return <SingleItemCard key={name} variant={firstItem} onAdd={addToCart} />;
            }

            return (
              <div
                key={name}
                onClick={() => setSelectedName(name)}
                className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 active:bg-gray-50 transition-colors cursor-pointer"
              >
                <img
                  src={getProductImage(firstItem)}
                  alt={name}
                  className="w-16 h-16 object-cover rounded-xl border border-gray-100 shrink-0"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <div className="flex-1">
                  <div className="font-bold text-gray-800 text-lg leading-tight">{name}</div>
                  <div className="text-sm text-blue-500 mt-1 font-semibold">{productVariants.length} ตัวเลือก</div>
                </div>
                <ChevronRight size={22} className="text-gray-300 shrink-0" />
              </div>
            );
          })}
        </div>
      )}

      {/* Page 3: Variants */}
      {selectedName && (
        <div className="space-y-4">
          <div className="px-1 mb-2">
            <h2 className="text-2xl font-bold text-gray-800 leading-tight">{selectedName}</h2>
            <p className="text-base text-gray-500 mt-1">เลือกขนาดหรือสเปกที่ต้องการ</p>
          </div>
          {variants.map(variant => (
            <VariantCard key={variant.id} variant={variant} onAdd={addToCart} />
          ))}
        </div>
      )}
    </div>
  );
};

const SingleItemCard: FC<{ variant: Product; onAdd: (p: Product, q: number) => void }> = ({ variant, onAdd }) => {
  const [qty, setQty] = useState<number | string>(1);

  const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') { setQty(''); return; }
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0) setQty(num);
  };

  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex gap-4 items-start mb-3">
        <img
          src={getProductImage(variant)}
          alt={variant.name}
          className="w-20 h-20 object-cover rounded-xl border border-gray-100 shadow-sm shrink-0"
          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <div className="flex-1">
          <div className="font-bold text-gray-800 text-lg leading-tight">{variant.name}</div>
          <div className="text-sm text-gray-500 mt-1 space-x-2">
            {variant.size && <span>ขนาด: <strong>{variant.size}</strong></span>}
            {variant.thickness && <span>หนา: <strong>{variant.thickness}</strong></span>}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
        <div className="text-2xl font-black text-blue-600">{variant.price}.-</div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 overflow-hidden">
            <button onClick={() => setQty(q => q === '' ? 1 : Math.max(1, Number(q) - 1))} className="px-3 py-2 text-gray-500 hover:bg-gray-200 transition-colors">
              <Minus size={16} />
            </button>
            <input
              type="number" min="1" value={qty}
              onChange={handleQtyChange}
              onBlur={() => { if (qty === '' || Number(qty) < 1) setQty(1); }}
              className="w-10 text-center font-bold text-gray-700 text-base bg-transparent focus:outline-none [&::-webkit-inner-spin-button]:appearance-none"
              style={{ MozAppearance: 'textfield' }}
            />
            <button onClick={() => setQty(q => q === '' ? 2 : Number(q) + 1)} className="px-3 py-2 text-gray-500 hover:bg-gray-200 transition-colors">
              <Plus size={16} />
            </button>
          </div>
          <button
            onClick={() => { onAdd(variant, Number(qty) || 1); setQty(1); }}
            className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-base shadow-sm active:scale-95 transition-all"
          >
            เพิ่ม
          </button>
        </div>
      </div>
    </div>
  );
};

const VariantCard: FC<{ variant: Product; onAdd: (p: Product, q: number) => void }> = ({ variant, onAdd }) => {
  const [qty, setQty] = useState<number | string>(1);

  const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') { setQty(''); return; }
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0) setQty(num);
  };

  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-base mb-4">
        {variant.size && (
          <p className="text-gray-500">ขนาด: <span className="text-gray-900 font-bold">{variant.size}</span></p>
        )}
        {variant.thickness && (
          <p className="text-gray-500">หนา: <span className="text-gray-900 font-bold">{variant.thickness}</span></p>
        )}
        {variant.weight && (
          <p className="text-gray-500">น้ำหนัก: <span className="text-gray-900 font-bold">{variant.weight}</span></p>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-dashed border-gray-200 pt-4">
        <div className="text-2xl font-black text-blue-600">{variant.price}.-</div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 overflow-hidden">
            <button onClick={() => setQty(q => q === '' ? 1 : Math.max(1, Number(q) - 1))} className="px-3 py-2 text-gray-500 hover:bg-gray-200 transition-colors">
              <Minus size={16} />
            </button>
            <input
              type="number" min="1" value={qty}
              onChange={handleQtyChange}
              onBlur={() => { if (qty === '' || Number(qty) < 1) setQty(1); }}
              className="w-10 text-center font-bold text-gray-700 text-base bg-transparent focus:outline-none [&::-webkit-inner-spin-button]:appearance-none"
              style={{ MozAppearance: 'textfield' }}
            />
            <button onClick={() => setQty(q => q === '' ? 2 : Number(q) + 1)} className="px-3 py-2 text-gray-500 hover:bg-gray-200 transition-colors">
              <Plus size={16} />
            </button>
          </div>
          <button
            onClick={() => { onAdd(variant, Number(qty) || 1); setQty(1); }}
            className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-base shadow-md active:scale-95 transition-all"
          >
            เพิ่ม
          </button>
        </div>
      </div>
    </div>
  );
};

export default Menu;
