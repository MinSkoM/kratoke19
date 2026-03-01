import { useState, useMemo } from 'react';
import type { FC } from 'react';
import { Product } from '../types';
import { ChevronRight, ArrowLeft, Package, Plus, Minus } from 'lucide-react';

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

      {/* หน้า 2: เลือกชื่อรายการ */}
      {selectedCategory && !selectedName && (
        <div className="space-y-3">
          <h2 className="font-bold text-lg text-gray-500 px-1">{selectedCategory}</h2>
          {productNamesInCategory.map((name) => {
            // ดึงสเปกทั้งหมดของสินค้านี้มาเช็ค
            const productVariants = products.filter(p => p.name === name && p.category === selectedCategory);
            const firstItem = productVariants[0];

            // 🟢 เงื่อนไข: ถ้ามีแค่ 1 แบบ ให้แสดงแบบ "ไม่ต้องกดเข้าไป" (โชว์ปุ่มเพิ่มเลย)
            if (productVariants.length === 1) {
              return <SingleItemCard key={name} variant={firstItem} onAdd={addToCart} />;
            }

            // 🟠 เงื่อนไข: ถ้ามีหลายแบบ ให้แสดงแบบให้กดเข้าไปดูสเปก (หน้า 3)
            return (
              <div key={name} onClick={() => setSelectedName(name)} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 active:bg-gray-50 transition-colors">
                {firstItem?.image && (
                  <img src={firstItem.image} className="w-16 h-16 object-cover rounded-xl border border-gray-100" alt={name} />
                )}
                <div className="flex-1">
                   <div className="font-bold text-gray-800">{name}</div>
                   <div className="text-xs text-blue-500 mt-1">มี {productVariants.length} ตัวเลือก</div>
                </div>
                <ChevronRight className="text-gray-400" />
              </div>
            );
          })}
        </div>
      )}

      {/* หน้า 3: แสดงสเปกพร้อม ID รายตัว (กรณีสินค้ามีหลายสเปก) */}
      {selectedName && (
        <div className="space-y-4">
          <div className="px-1">
            <h2 className="font-bold text-xl text-gray-800 leading-tight">{selectedName}</h2>
            <p className="text-sm text-gray-500">เลือกขนาดหรือสเปกที่ต้องการ</p>
          </div>
          
          {variants.map((variant) => (
            <VariantCard key={variant.id} variant={variant} onAdd={addToCart} />
          ))}
        </div>
      )}
    </div>
  );
};

// --- Component ใหม่: สำหรับสินค้าที่มีแบบเดียว (รวมหน้า 2 และ 3 ไว้ด้วยกัน) ---
const SingleItemCard: FC<{ variant: Product; onAdd: (p: Product, q: number) => void }> = ({ variant, onAdd }) => {
  const [qty, setQty] = useState<number | string>(1);

  const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      setQty(''); // ยอมให้ลบช่องว่างเพื่อพิมพ์เลขใหม่ได้
    } else {
      const num = parseInt(val, 10);
      if (!isNaN(num) && num > 0) setQty(num);
    }
  };

  const handleBlur = () => {
    if (qty === '' || Number(qty) < 1) setQty(1); // ถ้าปล่อยว่างหรือเลขผิด ให้กลับเป็น 1
  };

  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex gap-4 items-start mb-3">
        {variant.image && (
          <img src={variant.image} className="w-16 h-16 object-cover rounded-xl border border-gray-100 shadow-sm" alt={variant.name} />
        )}
        <div className="flex-1">
          <div className="font-bold text-gray-800 text-base">{variant.name}</div>
          
          {/* แสดงรายละเอียดเสริมถ้าระบุไว้ */}
          <div className="text-xs text-gray-500 mt-1 space-x-2">
            {variant.size && <span>ขนาด: {variant.size}</span>}
            {variant.thickness && <span>หนา: {variant.thickness}</span>}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-gray-50 pt-3">
        <div className="text-lg font-black text-blue-600">{variant.price}.-</div>
        
        <div className="flex items-center gap-2">
          {/* 🟢 ตัวเลือกจำนวนแบบพิมพ์ได้ */}
          <div className="flex items-center border rounded-lg bg-gray-50 overflow-hidden">
            <button 
              onClick={() => setQty(q => q === '' ? 1 : Math.max(1, Number(q) - 1))} 
              className="p-1.5 text-gray-400 active:text-blue-600"
            >
              <Minus size={16} />
            </button>
            <input 
              type="number"
              min="1"
              value={qty}
              onChange={handleQtyChange}
              onBlur={handleBlur}
              className="w-8 text-center font-bold text-gray-700 bg-transparent focus:outline-none [&::-webkit-inner-spin-button]:appearance-none"
              style={{ MozAppearance: 'textfield' }} // ลบลูกศรขึ้นลงแบบ default ของ browser
            />
            <button 
              onClick={() => setQty(q => q === '' ? 2 : Number(q) + 1)} 
              className="p-1.5 text-gray-400 active:text-blue-600"
            >
              <Plus size={16} />
            </button>
          </div>

          <button
            onClick={() => {
              onAdd(variant, Number(qty) || 1);
              setQty(1);
            }}
            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold text-xs shadow-sm active:scale-95 transition-all"
          >
            เพิ่ม
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Component เดิม: สำหรับสินค้าที่มีหลายสเปก (หน้า 3) ---
const VariantCard: FC<{ variant: Product; onAdd: (p: Product, q: number) => void }> = ({ variant, onAdd }) => {
  const [qty, setQty] = useState<number | string>(1);

  const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      setQty('');
    } else {
      const num = parseInt(val, 10);
      if (!isNaN(num) && num > 0) setQty(num);
    }
  };

  const handleBlur = () => {
    if (qty === '' || Number(qty) < 1) setQty(1);
  };

  return (
    <div className="bg-white p-4 rounded-2xl border-2 border-transparent shadow-sm hover:border-blue-100 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
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
        <div className="text-l font-black text-blue-600">{variant.price}.-</div>
        
        <div className="flex items-center gap-3">
          {/* 🟢 ตัวเลือกจำนวนแบบพิมพ์ได้ */}
          <div className="flex items-center border rounded-xl bg-gray-50 overflow-hidden">
            <button 
              onClick={() => setQty(q => q === '' ? 1 : Math.max(1, Number(q) - 1))} 
              className="p-2 text-gray-400 active:text-blue-600"
            >
              <Minus size={16} />
            </button>
            <input 
              type="number"
              min="1"
              value={qty}
              onChange={handleQtyChange}
              onBlur={handleBlur}
              className="w-10 text-center font-bold text-gray-700 bg-transparent focus:outline-none [&::-webkit-inner-spin-button]:appearance-none"
              style={{ MozAppearance: 'textfield' }}
            />
            <button 
              onClick={() => setQty(q => q === '' ? 2 : Number(q) + 1)} 
              className="p-2 text-gray-400 active:text-blue-600"
            >
              <Plus size={16} />
            </button>
          </div>

          <button
            onClick={() => {
              onAdd(variant, Number(qty) || 1);
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