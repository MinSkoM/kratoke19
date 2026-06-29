import { useState, useMemo } from 'react';
import type { FC } from 'react';
import { Product } from '../../../types';
import { ChevronDown, ArrowLeft, Package, Plus, Minus } from 'lucide-react';
import { getProductImage, handleProductImageError } from '../../../utils/productImage';
import { fmt } from '../../../utils/fmt';

interface MenuProps {
  products: Product[];
  isLoading: boolean;
  addToCart: (product: Product, quantity: number) => void;
}

const VARIANT_FIELDS: { key: keyof Product; label: string }[] = [
  { key: 'detail',    label: 'รายละเอียด' },
  { key: 'size',      label: 'ขนาด' },
  { key: 'thickness', label: 'ความหนา' },
];

/* Fields that actually differ across this product's variants */
function varyingFields(variants: Product[]) {
  return VARIANT_FIELDS.filter(({ key }) => {
    const vals = new Set(variants.map(v => String(v[key] ?? '')).filter(Boolean));
    return vals.size > 1;
  });
}

const Menu: FC<MenuProps> = ({ products, isLoading, addToCart }) => {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [expandedName,  setExpandedName]  = useState<string | null>(null);

  /* Level 1: major groups A–E derived from first char of product id */
  const groups = useMemo(() =>
    Array.from(new Set(products.map(p => p.id?.charAt(0).toUpperCase()).filter(Boolean))).sort(),
    [products]);

  /* Level 2: unique product names within the selected group */
  const namesInGroup = useMemo(() => {
    if (!selectedGroup) return [];
    return Array.from(new Set(
      products.filter(p => p.id?.charAt(0).toUpperCase() === selectedGroup).map(p => p.name)
    ));
  }, [products, selectedGroup]);

  const handleToggle = (name: string) =>
    setExpandedName(prev => prev === name ? null : name);

  if (isLoading) return (
    <div className="text-center py-20 text-gray-400">
      <Package size={44} className="mx-auto mb-3 opacity-30 animate-pulse"/>
      <p className="text-lg font-medium">กำลังโหลดรายการสินค้า...</p>
    </div>
  );

  return (
    <div className="pb-6">

      {/* ── Level 1: A–E group cards ───────────────────────────────────── */}
      {!selectedGroup && (
        <div>
          <h2 className="text-2xl font-black text-gray-900 mb-4">หมวดหมู่สินค้า</h2>
          <div className="grid grid-cols-2 gap-3">
            {groups.map(grp => {
              const grpProducts = products.filter(p => p.id?.charAt(0).toUpperCase() === grp);
              const count = grpProducts.length;
              /* unique names → one image per product type, up to 4 */
              const previews = Array.from(
                new Map(grpProducts.map(p => [p.name, p])).values()
              ).slice(0, 4);
              return (
                <button key={grp} onClick={() => { setSelectedGroup(grp); setExpandedName(null); }}
                  className="relative h-40 rounded-2xl overflow-hidden shadow-sm active:scale-95 transition-transform text-left bg-gray-100">
                  {/* 2×2 image mosaic */}
                  <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                    {[0,1,2,3].map(i => (
                      <div key={i} className="overflow-hidden bg-gray-200">
                        {previews[i] && (
                          <img src={getProductImage(previews[i])} alt=""
                            className="w-full h-full object-cover"
                            onError={handleProductImageError}/>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"/>
                  <div className="absolute top-3 left-3.5 w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <span className="text-white font-black text-lg leading-none">{grp}</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3.5">
                    <p className="text-white/70 text-xs font-medium">{count} รายการ</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Level 2: flat product list for the group ───────────────────── */}
      {selectedGroup && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <button onClick={() => { setSelectedGroup(null); setExpandedName(null); }}
              className="flex items-center gap-1.5 bg-white border border-gray-200 text-[#142D95] font-bold text-sm px-3.5 py-2 rounded-full shadow-sm active:scale-95 transition-transform shrink-0">
              <ArrowLeft size={15}/> ย้อนกลับ
            </button>
            <span className="text-sm font-semibold text-gray-600">กลุ่ม {selectedGroup}</span>
          </div>

          <div className="space-y-2.5">
            {namesInGroup.map(name => {
              const variants = products.filter(
                p => p.name === name && p.id?.charAt(0).toUpperCase() === selectedGroup
              );
              return (
                <ProductCard
                  key={name}
                  name={name}
                  variants={variants}
                  isExpanded={expandedName === name}
                  onToggle={() => handleToggle(name)}
                  onAdd={(p, q) => { addToCart(p, q); setExpandedName(null); }}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Shared qty stepper ─────────────────────────────────────────────────── */
const QtyControl: FC<{ qty: number | string; setQty: (v: number | string) => void }> = ({ qty, setQty }) => (
  <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full overflow-hidden">
    <button onClick={() => setQty(Math.max(1, Number(qty) - 1))}
      className="px-3 py-2 text-gray-400 active:text-[#142D95] transition-colors">
      <Minus size={14}/>
    </button>
    <input type="number" min="1" value={qty}
      onChange={e => { const v = e.target.value; if (v === '') { setQty(''); return; } const n = parseInt(v, 10); if (!isNaN(n) && n > 0) setQty(n); }}
      onBlur={() => { if (!qty || Number(qty) < 1) setQty(1); }}
      className="w-8 text-center font-bold text-gray-800 text-base bg-transparent focus:outline-none [&::-webkit-inner-spin-button]:appearance-none"
      style={{ MozAppearance: 'textfield' }}/>
    <button onClick={() => setQty(Number(qty) + 1)}
      className="px-3 py-2 text-gray-400 active:text-[#142D95] transition-colors">
      <Plus size={14}/>
    </button>
  </div>
);

/* ── Product card ───────────────────────────────────────────────────────── */
export const ProductCard: FC<{
  name: string;
  variants: Product[];
  isExpanded: boolean;
  onToggle: () => void;
  onAdd: (p: Product, q: number) => void;
}> = ({ name, variants, isExpanded, onToggle, onAdd }) => {
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>({});
  const [qty, setQty] = useState<number | string>(1);

  const first    = variants[0];
  const fields   = useMemo(() => varyingFields(variants), [variants]);
  const isSingle = variants.length === 1;

  const filteredVariants = useMemo(() =>
    variants.filter(v =>
      Object.entries(selectedAttrs).every(([k, val]) => String(v[k as keyof Product] ?? '') === val)
    ), [variants, selectedAttrs]);

  const exactVariant = useMemo(() => {
    if (filteredVariants.length === 0) return null;
    if (filteredVariants.length === 1) return filteredVariants[0];
    const selectedKeys = new Set(Object.keys(selectedAttrs));
    const remaining = fields.filter(f => !selectedKeys.has(f.key));
    const allUnique = remaining.every(f => {
      const vals = new Set(filteredVariants.map(v => String(v[f.key] ?? '')).filter(Boolean));
      return vals.size <= 1;
    });
    return allUnique ? filteredVariants[0] : null;
  }, [filteredVariants, fields, selectedAttrs]);

  const handlePick = (fieldKey: string, value: string) => {
    const idx = fields.findIndex(f => f.key === fieldKey);
    const next: Record<string, string> = {};
    fields.slice(0, idx).forEach(f => { if (selectedAttrs[f.key]) next[f.key] = selectedAttrs[f.key]; });
    next[fieldKey] = value;
    setSelectedAttrs(next);
    setQty(1);
  };

  const handleToggle = () => { setSelectedAttrs({}); setQty(1); onToggle(); };

  /* ── Single-variant: same compact collapsed row as multi ── */
  if (isSingle) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <button onClick={handleToggle}
          className="w-full flex items-center gap-3.5 p-4 text-left active:bg-gray-50 transition-colors">
          <img src={getProductImage(first)} alt={first.name}
            className="w-[60px] h-[60px] object-cover rounded-xl shrink-0 bg-gray-100"
            onError={handleProductImageError}/>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-base leading-snug">{first.name}</p>
            <p className="text-sm text-[#6A9DF7] font-semibold mt-1">
              {isExpanded ? 'กำลังเลือก...' : fmt(first.price)}
            </p>
          </div>
          <ChevronDown size={18}
            className={`text-gray-300 shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}/>
        </button>

        {isExpanded && (
          <div className="border-t border-gray-100 px-4 pt-3 pb-4">
            <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
              {first.detail    && <span className="text-sm text-gray-500">รายละเอียด <strong className="text-gray-800">{first.detail}</strong></span>}
              {first.size      && <span className="text-sm text-gray-500">ขนาด <strong className="text-gray-800">{first.size}</strong></span>}
              {first.thickness && <span className="text-sm text-gray-500">หนา <strong className="text-gray-800">{first.thickness}</strong></span>}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-[#142D95]">{fmt(first.price)}</span>
              <div className="flex items-center gap-2">
                <QtyControl qty={qty} setQty={setQty}/>
                <button onClick={() => { onAdd(first, Number(qty) || 1); setQty(1); handleToggle(); }}
                  className="bg-[#E3CE54] text-[#142D95] px-5 py-2 rounded-full font-bold text-sm shadow-sm active:scale-95 transition-transform">
                  เพิ่ม
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ── Multi-variant: cascading chip selection ── */
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button onClick={handleToggle}
        className="w-full flex items-center gap-3.5 p-4 text-left active:bg-gray-50 transition-colors">
        <img src={getProductImage(first)} alt={name}
          className="w-[60px] h-[60px] object-cover rounded-xl shrink-0 bg-gray-100"
          onError={handleProductImageError}/>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-base leading-snug">{name}</p>
          <p className="text-sm text-[#6A9DF7] font-semibold mt-1">
            {isExpanded ? 'กำลังเลือก...' : `${variants.length} ตัวเลือก • กดเพื่อเลือก`}
          </p>
        </div>
        <ChevronDown size={18}
          className={`text-gray-300 shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}/>
      </button>

      {isExpanded && (
        <div className="border-t border-gray-100 px-4 pt-3 pb-4 space-y-4">
          {fields.map(({ key, label }, fieldIdx) => {
            const prevSelected = fields.slice(0, fieldIdx).every(f => selectedAttrs[f.key]);
            if (!prevSelected) return null;
            // hide this row if it hasn't been chosen yet AND an exact match is already determined
            if (exactVariant && !selectedAttrs[key]) return null;
            const pool = variants.filter(v =>
              fields.slice(0, fieldIdx).every(f => String(v[f.key] ?? '') === selectedAttrs[f.key])
            );
            const options = [...new Set(pool.map(v => String(v[key] ?? '')).filter(Boolean))];
            return (
              <div key={key}>
                {fieldIdx > 0 && <p className="text-xs text-gray-400 font-semibold mb-2 uppercase tracking-wide">{label}</p>}
                <div className="flex flex-wrap gap-2">
                  {options.map(val => (
                    <button key={val} onClick={() => handlePick(key, val)}
                      className={`px-3.5 py-1.5 rounded-full text-sm font-bold border-2 transition-all active:scale-95 ${
                        selectedAttrs[key] === val
                          ? 'bg-[#142D95] text-white border-[#142D95] shadow-sm'
                          : 'bg-white text-gray-600 border-gray-200'
                      }`}>
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          {exactVariant && (
            <div className="pt-1 border-t border-gray-100">
              <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
                {exactVariant.size      && <span className="text-sm text-gray-500">ขนาด <strong className="text-gray-800">{exactVariant.size}</strong></span>}
                {exactVariant.thickness && <span className="text-sm text-gray-500">หนา <strong className="text-gray-800">{exactVariant.thickness}</strong></span>}
              </div>
              <div className="flex items-center justify-between">
                {exactVariant.price ? <span className="text-2xl font-black text-[#142D95]">{fmt(exactVariant.price)}</span> : <span/>}
                <div className="flex items-center gap-2">
                  <QtyControl qty={qty} setQty={setQty}/>
                  <button onClick={() => { onAdd(exactVariant, Number(qty) || 1); setQty(1); handleToggle(); }}
                    className="bg-[#E3CE54] text-[#142D95] px-5 py-2 rounded-full font-bold text-sm shadow-sm active:scale-95 transition-transform">
                    เพิ่ม
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Menu;
