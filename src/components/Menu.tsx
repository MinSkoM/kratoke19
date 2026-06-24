import { useState, useMemo } from 'react';
import type { FC } from 'react';
import { Product } from '../types';
import { ChevronRight, ArrowLeft, Package, Plus, Minus } from 'lucide-react';
import { getProductImage } from '../utils/productImage';
import { getCategoryTheme } from '../App';

interface MenuProps {
  products: Product[];
  isLoading: boolean;
  addToCart: (product: Product, quantity: number) => void;
}

const Menu: FC<MenuProps> = ({ products, isLoading, addToCart }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedName,     setSelectedName]     = useState<string | null>(null);

  const categories = useMemo(() =>
    Array.from(new Set(products.map(p => p.category))).filter(Boolean),
    [products]);

  const namesInCategory = useMemo(() => {
    if (!selectedCategory) return [];
    return Array.from(new Set(products.filter(p => p.category === selectedCategory).map(p => p.name)));
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
    <div className="text-center py-20 text-gray-400">
      <Package size={44} className="mx-auto mb-3 opacity-30 animate-pulse"/>
      <p className="text-lg font-medium">กำลังโหลดรายการสินค้า...</p>
    </div>
  );

  return (
    <div className="pb-6">

      {/* Breadcrumb */}
      {selectedCategory && (
        <div className="flex items-center gap-2 mb-5">
          <button onClick={goBack}
            className="flex items-center gap-1.5 bg-white border border-gray-200 text-blue-600 font-bold text-sm px-3 py-2 rounded-full shadow-sm active:scale-95 transition-transform">
            <ArrowLeft size={16}/> ย้อนกลับ
          </button>
          <span className="text-gray-400 text-sm">›</span>
          <span className="text-gray-700 font-semibold text-sm truncate">{selectedCategory}</span>
          {selectedName && <>
            <span className="text-gray-400 text-sm">›</span>
            <span className="text-gray-900 font-bold text-sm truncate">{selectedName}</span>
          </>}
        </div>
      )}

      {/* Page 1 — Category grid */}
      {!selectedCategory && (
        <div>
          <h2 className="text-2xl font-black text-gray-900 mb-5">หมวดหมู่สินค้า</h2>
          <div className="grid grid-cols-2 gap-3">
            {categories.map(cat => {
              const theme   = getCategoryTheme(cat);
              const sample  = products.find(p => p.category === cat);
              const count   = products.filter(p => p.category === cat).length;
              return (
                <button key={cat} onClick={() => setSelectedCategory(cat)}
                  className={`${theme.bg} border ${theme.border} rounded-3xl overflow-hidden shadow-sm active:scale-95 transition-transform text-left`}>
                  <div className="relative">
                    <img
                      src={sample ? getProductImage(sample) : ''}
                      alt={cat}
                      className="w-full h-28 object-cover"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"/>
                  </div>
                  <div className="px-3 py-3">
                    <p className="font-black text-gray-900 text-base leading-tight">{cat}</p>
                    <p className="text-xs text-gray-500 mt-0.5 font-medium">{count} รายการ</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Page 2 — Product names */}
      {selectedCategory && !selectedName && (
        <div>
          <h2 className="text-xl font-black text-gray-900 mb-4">{selectedCategory}</h2>
          <div className="space-y-3">
            {namesInCategory.map(name => {
              const productVariants = products.filter(p => p.name === name && p.category === selectedCategory);
              const first = productVariants[0];
              if (productVariants.length === 1) return <SingleItemCard key={name} variant={first} onAdd={addToCart}/>;
              return (
                <button key={name} onClick={() => setSelectedName(name)}
                  className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 active:scale-[0.98] transition-transform text-left">
                  <img src={getProductImage(first)} alt={name}
                    className="w-16 h-16 object-cover rounded-xl shrink-0 bg-gray-100"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}/>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-base leading-tight">{name}</p>
                    <p className="text-sm text-blue-500 font-semibold mt-1">{productVariants.length} ตัวเลือก</p>
                  </div>
                  <ChevronRight size={20} className="text-gray-300 shrink-0"/>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Page 3 — Variants */}
      {selectedName && (
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-black text-gray-900 leading-tight">{selectedName}</h2>
            <p className="text-sm text-gray-500 mt-1">เลือกขนาดหรือสเปกที่ต้องการ</p>
          </div>
          <div className="space-y-3">
            {variants.map(v => <VariantCard key={v.id} variant={v} onAdd={addToCart}/>)}
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Single item card (1 variant) ──────────────────────────────────────── */
const SingleItemCard: FC<{ variant: Product; onAdd: (p: Product, q: number) => void }> = ({ variant, onAdd }) => {
  const [qty, setQty] = useState<number | string>(1);
  const numQty = Number(qty) || 1;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex gap-4 p-4 items-start">
        <img src={getProductImage(variant)} alt={variant.name}
          className="w-18 h-18 w-[72px] h-[72px] object-cover rounded-xl shrink-0 bg-gray-100"
          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}/>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-base leading-tight">{variant.name}</p>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-sm text-gray-500 mt-1.5">
            {variant.size      && <span>ขนาด <strong className="text-gray-800">{variant.size}</strong></span>}
            {variant.thickness && <span>หนา <strong className="text-gray-800">{variant.thickness}</strong></span>}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-100">
        <span className="text-2xl font-black text-orange-500">{variant.price}฿</span>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-gray-200 rounded-full overflow-hidden">
            <button onClick={() => setQty(q => Math.max(1, Number(q) - 1))} className="px-3 py-2 text-gray-400 active:text-blue-600"><Minus size={15}/></button>
            <input type="number" min="1" value={qty}
              onChange={e => { const v = e.target.value; if (v === '') setQty(''); else { const n = parseInt(v,10); if (!isNaN(n) && n > 0) setQty(n); }}}
              onBlur={() => { if (!qty || Number(qty) < 1) setQty(1); }}
              className="w-9 text-center font-bold text-gray-800 text-base bg-transparent focus:outline-none [&::-webkit-inner-spin-button]:appearance-none"
              style={{ MozAppearance: 'textfield' }}/>
            <button onClick={() => setQty(q => Number(q) + 1)} className="px-3 py-2 text-gray-400 active:text-blue-600"><Plus size={15}/></button>
          </div>
          <button onClick={() => { onAdd(variant, numQty); setQty(1); }}
            className="bg-blue-600 text-white px-4 py-2.5 rounded-full font-bold text-sm shadow-sm active:scale-95 transition-transform">
            เพิ่ม
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Variant card (multi-spec product) ─────────────────────────────────── */
const VariantCard: FC<{ variant: Product; onAdd: (p: Product, q: number) => void }> = ({ variant, onAdd }) => {
  const [qty, setQty] = useState<number | string>(1);
  const numQty = Number(qty) || 1;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-4 pt-4 pb-3">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
          {variant.size      && <p className="text-gray-500">ขนาด <span className="font-bold text-gray-900">{variant.size}</span></p>}
          {variant.thickness && <p className="text-gray-500">หนา <span className="font-bold text-gray-900">{variant.thickness}</span></p>}
          {variant.weight    && <p className="text-gray-500">น้ำหนัก <span className="font-bold text-gray-900">{variant.weight}</span></p>}
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-100">
        <span className="text-2xl font-black text-orange-500">{variant.price}฿</span>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-gray-200 rounded-full overflow-hidden">
            <button onClick={() => setQty(q => Math.max(1, Number(q) - 1))} className="px-3 py-2 text-gray-400 active:text-blue-600"><Minus size={15}/></button>
            <input type="number" min="1" value={qty}
              onChange={e => { const v = e.target.value; if (v === '') setQty(''); else { const n = parseInt(v,10); if (!isNaN(n) && n > 0) setQty(n); }}}
              onBlur={() => { if (!qty || Number(qty) < 1) setQty(1); }}
              className="w-9 text-center font-bold text-gray-800 text-base bg-transparent focus:outline-none [&::-webkit-inner-spin-button]:appearance-none"
              style={{ MozAppearance: 'textfield' }}/>
            <button onClick={() => setQty(q => Number(q) + 1)} className="px-3 py-2 text-gray-400 active:text-blue-600"><Plus size={15}/></button>
          </div>
          <button onClick={() => { onAdd(variant, numQty); setQty(1); }}
            className="bg-blue-600 text-white px-4 py-2.5 rounded-full font-bold text-sm shadow-sm active:scale-95 transition-transform">
            เพิ่ม
          </button>
        </div>
      </div>
    </div>
  );
};

export default Menu;
