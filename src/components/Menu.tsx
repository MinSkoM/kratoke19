import { useState, useMemo } from 'react';
import type { FC } from 'react';
import { Product } from '../types';
import { ChevronRight, ArrowLeft, Package, Plus, Minus, Hash } from 'lucide-react';

interface MenuProps {
  products: Product[];
  isLoading: boolean;
  addToCart: (product: Product, quantity: number) => void;
}

const Menu: FC<MenuProps> = ({ products, isLoading, addToCart }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);

  const categories = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.category))).filter(Boolean);
  }, [products]);

  const productNamesInCategory = useMemo(() => {
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

  if (isLoading) return <div className="text-center py-10 font-medium text-gray-500">กำลังโหลดรายการสินค้า...</div>;

  return (
    <div className="pb-24">
      {/* ส่วนหัวปุ่มย้อนกลับ */}
      {(selectedCategory || selectedName) && (
        <button onClick={goBack} className="flex items-center text-blue-600 mb-4 font-bold p-1">
          <ArrowLeft size={20} className="mr-1" /> ย้อนกลับ
        </button>
      )}

      {/* หน้า 1: เลือกหมวดหมู่ */}
      {!selectedCategory && (
        <div className="space-y-3">
          <h2 className="font-bold text-xl mb-4 text-gray-800">หมวดหมู่สินค้า</h2>
          {categories.map((cat) => (
            <div key={cat} onClick={() => setSelectedCategory(cat)} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center active:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><Package size={20}/></div>
                <span className="font-bold text-gray-700">{cat}</span>
              </div>
              <ChevronRight className="text-gray-400" />
            </div>
          ))}
        </div>
      )}

      {/* หน้า 2: เลือกชื่อรายการ (แสดง ID ตัวอย่างของกลุ่มนั้นๆ และรูปภาพ) */}
      {selectedCategory && !selectedName && (
        <div className="space-y-3">
          <h2 className="font-bold text-lg text-gray-500 px-1">{selectedCategory}</h2>
          {productNamesInCategory.map((name) => {
            // ดึงข้อมูลรายการแรกมาเพื่อเอารูปภาพ
            const firstItem = products.find(p => p.name === name && p.category === selectedCategory);
            return (
              <div key={name} onClick={() => setSelectedName(name)} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 active:bg-gray-50 transition-colors">
                
                {/* 🟢 ย้ายรูปภาพมาไว้ตรงนี้ */}
                {firstItem?.image && (
                  <img src={firstItem.image} className="w-16 h-16 object-cover rounded-xl border border-gray-100" alt={name} />
                )}

                <div className="flex-1">
                   <div className="font-bold text-gray-800">{name}</div>
                </div>
                <ChevronRight className="text-gray-400" />
              </div>
            );
          })}
        </div>
      )}

      {/* หน้า 3: แสดงสเปกพร้อม ID รายตัว */}
      {selectedName && (
        <div className="space-y-4">
          <div className="px-1">
            <h2 className="font-bold text-xl text-gray-800 leading-tight">{selectedName}</h2>
            <p className="text-sm text-gray-500">เลือกขนาดที่ต้องการ (ระบุตามรหัสสินค้า)</p>
          </div>
          
          {variants.map((variant) => (
            <VariantCard key={variant.id} variant={variant} onAdd={addToCart} />
          ))}
        </div>
      )}
    </div>
  );
};

// --- Component ย่อยสำหรับ Variant (เอาการแสดงรูปภาพออกแล้ว) ---
const VariantCard: FC<{ variant: Product; onAdd: (p: Product, q: number) => void }> = ({ variant, onAdd }) => {
  const [qty, setQty] = useState(1);

  return (
    <div className="bg-white p-4 rounded-2xl border-2 border-transparent shadow-sm hover:border-blue-100 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          {/* แสดง ID สินค้าโดดเด่น */}
          <div className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md text-xs font-mono font-bold mb-2">
            <Hash size={12} /> ID: {variant.id}
          </div>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            {/* เช็คว่ามีข้อมูลไหม ถ้ามีถึงจะแสดงผล */}
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
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-dashed pt-4">
        <div className="text-xl font-black text-blue-600">{variant.price}.-</div>
        
        <div className="flex items-center gap-3">
          {/* ตัวเลือกจำนวน */}
          <div className="flex items-center border rounded-xl bg-gray-50">
            <button 
              onClick={() => setQty(q => Math.max(1, q - 1))} 
              className="p-2 text-gray-400 active:text-blue-600"
            >
              <Minus size={16} />
            </button>
            <span className="w-6 text-center font-bold text-gray-700">{qty}</span>
            <button 
              onClick={() => setQty(q => q + 1)} 
              className="p-2 text-gray-400 active:text-blue-600"
            >
              <Plus size={16} />
            </button>
          </div>

          <button
            onClick={() => {
              onAdd(variant, qty);
              setQty(1);
            }}
            className="bg-blue-600 text-white px-5 py-2 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-all"
          >
            เพิ่มลงตะกร้า
          </button>
        </div>
      </div>
    </div>
  );
};

export default Menu;