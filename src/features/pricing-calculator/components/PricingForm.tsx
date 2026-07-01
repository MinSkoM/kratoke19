import { useMemo, useState } from 'react';
import type { FC } from 'react';
import { ArrowLeft, Calculator, Package, Search, X } from 'lucide-react';
import type { Product } from '../../../types';
import { getProductImage, handleProductImageError } from '../../../utils/productImage';
import { ProductCard } from '../../products/components/Menu';
import { getProductCategoryGroup, getVisibleCategoryGroups } from '../categoryGroups';
import { normalizeSearch, searchProduct } from '../searchProducts';

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
  const [searchTerm, setSearchTerm] = useState('');

  const groups = useMemo(
    () => getVisibleCategoryGroups(products),
    [products],
  );

  const namesInGroup = useMemo(() => {
    if (!selectedGroup) return [];
    return Array.from(new Set(
      products
        .filter(product => getProductCategoryGroup(product).id === selectedGroup)
        .map(product => product.name),
    ));
  }, [products, selectedGroup]);

  const groupedSearch = useMemo(() => {
    const normalized = searchTerm.trim();
    if (!normalized) return [];
    const filtered = products.filter(product =>
      searchProduct(product, normalized),
    );
    const map: Record<string, { name: string; variants: Product[] }> = {};
    filtered.forEach(product => {
      const key = `${product.category}|${product.name}`;
      if (!map[key]) map[key] = { name: product.name, variants: [] };
      map[key].variants.push(product);
    });
    return Object.values(map);
  }, [products, searchTerm]);

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
      <div className="relative">
        <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="ค้นหาชื่อสินค้า"
          value={searchTerm}
          onChange={event => {
            setSearchTerm(event.target.value);
            setSelectedGroup(null);
            setExpandedName(null);
          }}
          className="w-full pl-10 pr-10 py-3 text-base bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#64748B] placeholder:text-gray-300"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setExpandedName(null);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center"
          >
            <X size={14} className="text-gray-500" />
          </button>
        )}
      </div>

      {searchTerm ? (
        <div className="space-y-2.5">
          <p className="text-sm font-semibold text-gray-500 px-0.5">
            พบ <strong className="text-gray-900">{groupedSearch.reduce((sum, group) => sum + group.variants.length, 0)}</strong> รายการ
          </p>
          {groupedSearch.length > 0 ? groupedSearch.map(group => (
            <ProductCard
              key={group.name}
              name={group.name}
              variants={group.variants}
              isExpanded={expandedName === group.name}
              onToggle={() => setExpandedName(previous => previous === group.name ? null : group.name)}
              onAdd={(product, quantity) => {
                onAddProduct(product, quantity);
                setExpandedName(null);
              }}
            />
          )) : (
            <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <Search size={34} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-400 text-base font-semibold">ไม่พบสินค้าที่ค้นหา</p>
            </div>
          )}
        </div>
      ) : !selectedGroup && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Calculator size={22} className="text-[#1F2937]" />
            <h2 className="text-2xl font-black text-gray-900">เลือกสินค้าเพื่อคำนวณ</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {groups.map(group => {
              const groupProducts = products.filter(product => getProductCategoryGroup(product).id === group.id);
              const previews = Array.from(new Map(groupProducts.map(product => [product.name, product])).values()).slice(0, 4);
              return (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => {
                    setSelectedGroup(group.id);
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
                            onError={handleProductImageError}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute top-3 left-3.5 w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <span className="text-white font-black text-lg leading-none">{groups.indexOf(group) + 1}</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3.5">
                    <p className="text-white font-black text-sm leading-snug mb-1">{group.title}</p>
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
              className="flex items-center gap-1.5 bg-white border border-gray-200 text-[#1F2937] font-bold text-sm px-3.5 py-2 rounded-full shadow-sm active:scale-95 transition-transform shrink-0"
            >
              <ArrowLeft size={15} /> ย้อนกลับ
            </button>
            <span className="text-sm font-semibold text-gray-600">{groups.find(group => group.id === selectedGroup)?.title}</span>
          </div>

          <div className="space-y-2.5">
            {namesInGroup.map(name => {
              const variants = products.filter(
                product => product.name === name && getProductCategoryGroup(product).id === selectedGroup,
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
