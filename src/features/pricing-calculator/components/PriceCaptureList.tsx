import { useEffect, useMemo, useRef, useState } from 'react';
import type { FC } from 'react';
import { Check, ChevronDown, ListFilter, Search, X } from 'lucide-react';
import type { Product } from '../../../types';
import { fmt } from '../../../utils/fmt';
import { getProductCategoryGroup, getVisibleCategoryGroups } from '../categoryGroups';
import { searchProduct } from '../searchProducts';

interface PriceCaptureListProps {
  products: Product[];
}

const CAPTURE_PAGE_SIZE = 12;
const LAST_SELECTED_PRICE_CHECK_NAME_KEY = 'kratoke_price_check_last_name';

const PriceCaptureList: FC<PriceCaptureListProps> = ({ products }) => {
  const names = useMemo(
    () => Array.from(new Set(products.map(product => stringValue(product.name)).filter(Boolean))).sort(compareThaiText),
    [products],
  );
  const [selectedName, setSelectedName] = useState(() => getStoredSelectedName());
  const [searchTerm, setSearchTerm] = useState('');
  const [detailFilter, setDetailFilter] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [thicknessFilter, setThicknessFilter] = useState('');
  const [isNamePickerOpen, setIsNamePickerOpen] = useState(false);
  const [page, setPage] = useState(0);
  const selectedOptionRef = useRef<HTMLButtonElement | null>(null);
  const filteredNames = useMemo(
    () => {
      const query = searchTerm.trim();
      if (!query) return names;
      const matchedProducts = products.filter(product => searchProduct(product, query));
      return Array.from(new Set(matchedProducts.map(product => stringValue(product.name)).filter(Boolean))).sort(compareThaiText);
    },
    [names, products, searchTerm],
  );
  const selectableNames = filteredNames;
  const visibleActiveName = selectedName && (!searchTerm.trim() || selectableNames.includes(selectedName)) ? selectedName : '';
  const groupedNames = useMemo(
    () => getGroupedNames(products, selectableNames),
    [products, selectableNames],
  );

  const baseVariants = useMemo(
    () => products
      .filter(product => stringValue(product.name) === visibleActiveName)
      .sort((a, b) => compareThaiText(stringValue(a.id), stringValue(b.id))),
    [products, visibleActiveName],
  );
  const detailOptions = useMemo(() => uniqueValues(baseVariants, 'detail'), [baseVariants]);
  const sizeOptions = useMemo(() => uniqueValues(baseVariants, 'size'), [baseVariants]);
  const thicknessOptions = useMemo(() => uniqueValues(baseVariants, 'thickness'), [baseVariants]);

  const variants = useMemo(
    () => baseVariants.filter(product =>
      (!detailFilter || product.detail === detailFilter)
      && (!sizeFilter || product.size === sizeFilter)
      && (!thicknessFilter || product.thickness === thicknessFilter),
    ),
    [baseVariants, detailFilter, sizeFilter, thicknessFilter],
  );
  const pageCount = Math.max(1, Math.ceil(variants.length / CAPTURE_PAGE_SIZE));
  const visibleVariants = variants.slice(page * CAPTURE_PAGE_SIZE, (page + 1) * CAPTURE_PAGE_SIZE);

  useEffect(() => {
    if (selectedName && !names.includes(selectedName)) {
      setSelectedName('');
      localStorage.removeItem(LAST_SELECTED_PRICE_CHECK_NAME_KEY);
    }
  }, [names, selectedName]);

  useEffect(() => {
    if (!isNamePickerOpen) return;
    window.setTimeout(() => {
      selectedOptionRef.current?.scrollIntoView({ block: 'center' });
    }, 0);
  }, [isNamePickerOpen, visibleActiveName]);

  useEffect(() => {
    setDetailFilter('');
    setSizeFilter('');
    setThicknessFilter('');
    setPage(0);
  }, [visibleActiveName]);

  useEffect(() => {
    setPage(0);
  }, [detailFilter, sizeFilter, thicknessFilter]);

  if (names.length === 0) return null;

  return (
    <section className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
      <div className="bg-[#142D95] px-5 py-4 text-white">
        <div className="flex items-center gap-2">
          <ListFilter size={20} className="text-[#FCEF74]" />
          <h2 className="text-lg font-black">เช็กราคาตามชื่อสินค้า</h2>
        </div>
        <p className="text-xs text-[#AFC7FF] mt-1">ราคาสินค้าจากทางบริษัทอาจมีการเปลี่ยนแปลงได้ตามราคาตลาด</p>
      </div>

      <div className="p-4">
        <div className="relative mb-3">
          <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="ค้นหาชื่อสินค้า..."
            value={searchTerm}
            onChange={event => {
              setSearchTerm(event.target.value);
              setIsNamePickerOpen(false);
            }}
            className="w-full pl-10 pr-10 py-3 text-base bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6A9DF7] placeholder:text-gray-300"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setIsNamePickerOpen(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center"
            >
              <X size={14} className="text-gray-500" />
            </button>
          )}
        </div>

        <div className="relative mb-4">
          <div className="flex items-center justify-between mb-1.5 px-0.5">
            <label className="text-sm font-black text-gray-600">เลือกสินค้า</label>
            <span className="text-xs font-bold text-gray-400">แตะเพื่อเปิดรายการ</span>
          </div>
          <button
            type="button"
            disabled={selectableNames.length === 0}
            onClick={() => setIsNamePickerOpen(previous => !previous)}
            className={`w-full flex items-stretch justify-between gap-3 overflow-hidden bg-white border-2 rounded-2xl shadow-sm text-left transition-all disabled:bg-gray-50 disabled:text-gray-300 ${
              isNamePickerOpen ? 'border-[#142D95] ring-2 ring-[#6A9DF7]/20' : 'border-gray-200'
            }`}
          >
            <span className={`flex-1 px-4 py-3.5 text-base font-black truncate ${visibleActiveName ? 'text-gray-900' : 'text-gray-300'}`}>
              {visibleActiveName || 'เลือกสินค้า'}
            </span>
            <span className={`w-12 flex items-center justify-center border-l transition-colors ${
              isNamePickerOpen ? 'bg-[#F0F4FF] border-[#6A9DF7]/40' : 'bg-gray-50 border-gray-200'
            }`}>
              <ChevronDown
                size={22}
                className={`text-[#142D95] shrink-0 transition-transform ${isNamePickerOpen ? 'rotate-180' : ''}`}
              />
            </span>
          </button>

          {isNamePickerOpen && selectableNames.length > 0 && (
            <div className="absolute z-30 left-0 right-0 mt-2 max-h-80 overflow-y-auto rounded-2xl border-2 border-[#142D95]/20 bg-white shadow-2xl">
              {groupedNames.map(group => (
                <div key={group.id} className="border-b border-gray-100 last:border-0">
                  <p className="sticky top-0 bg-[#F0F4FF] px-4 py-2 text-xs font-black text-[#142D95]">
                    {group.title}
                  </p>
                  {group.names.map(name => {
                    const isSelected = name === visibleActiveName;
                    return (
                      <button
                        key={name}
                        type="button"
                        ref={isSelected ? selectedOptionRef : undefined}
                        onClick={() => {
                          setSelectedName(name);
                          localStorage.setItem(LAST_SELECTED_PRICE_CHECK_NAME_KEY, name);
                          setIsNamePickerOpen(false);
                        }}
                        className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-left ${
                          isSelected ? 'bg-[#FFF4A8]' : 'bg-white'
                        }`}
                      >
                        <span className={`text-sm font-bold ${isSelected ? 'text-gray-950' : 'text-gray-800'}`}>
                          {name}
                        </span>
                        {isSelected && <Check size={17} className="text-[#142D95] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3 mb-4">
          {detailOptions.length > 1 && (
            <FilterChips label="รายละเอียด" value={detailFilter} options={detailOptions} onChange={setDetailFilter} />
          )}
          {sizeOptions.length > 1 && (
            <FilterChips label="ขนาด" value={sizeFilter} options={sizeOptions} onChange={setSizeFilter} />
          )}
          {thicknessOptions.length > 1 && (
            <FilterChips label="หนา" value={thicknessFilter} options={thicknessOptions} onChange={setThicknessFilter} />
          )}
        </div>

        <div className="rounded-2xl border border-gray-100 overflow-hidden">
          <div className="bg-[#F0F4FF] px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-base font-black text-[#142D95]">{visibleActiveName || 'เลือกสินค้า'}</p>
              <p className="text-xs font-semibold text-gray-400">
                {visibleActiveName ? `${variants.length} จาก ${baseVariants.length} รายการ${pageCount > 1 ? ` · หน้า ${page + 1}/${pageCount}` : ''}` : 'กรุณาเลือกสินค้าเพื่อดูราคา'}
              </p>
            </div>
            <p className="text-xs font-bold text-gray-400">ราคา/ชิ้น</p>
          </div>

          <div className="grid grid-cols-[1.3fr_1fr_0.8fr_1fr] bg-gray-50 px-3 py-2 text-[11px] font-black text-gray-400">
            <span>รายละเอียด</span>
            <span>ขนาด</span>
            <span>หนา</span>
            <span className="text-right">ราคา</span>
          </div>

          <div className="divide-y divide-gray-100">
            {!visibleActiveName ? (
              <div className="px-4 py-8 text-center text-sm font-semibold text-gray-400">
                กรุณาเลือกสินค้า
              </div>
            ) : visibleVariants.length > 0 ? (
              visibleVariants.map(product => (
                <div key={product.id} className="grid grid-cols-[1.3fr_1fr_0.8fr_1fr] gap-2 px-3 py-2.5 items-center">
                  <p className="text-xs font-bold text-gray-900 leading-snug">{product.detail || '-'}</p>
                  <p className="text-xs font-bold text-gray-700 leading-snug">{product.size || '-'}</p>
                  <p className="text-xs font-bold text-gray-700 leading-snug">{product.thickness || '-'}</p>
                  <p className="text-sm font-black text-orange-500 text-right whitespace-nowrap">{fmt(product.price)}</p>
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-sm font-semibold text-gray-400">
                ไม่พบราคาตามตัวกรองที่เลือก
              </div>
            )}
          </div>
        </div>

        {pageCount > 1 && (
          <div className="flex gap-2 overflow-x-auto pt-3">
            {Array.from({ length: pageCount }).map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setPage(index)}
                className={`px-3 py-2 rounded-full text-xs font-black border-2 whitespace-nowrap ${
                  page === index
                    ? 'bg-[#142D95] text-white border-[#142D95]'
                    : 'bg-white text-gray-500 border-gray-200'
                }`}
              >
                หน้า {index + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

interface FilterChipsProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

const FilterChips: FC<FilterChipsProps> = ({ label, value, options, onChange }) => (
  <div>
    <p className="text-xs font-black text-gray-400 mb-2">{label}</p>
    <div className="flex gap-2 overflow-x-auto pb-1">
      <button
        type="button"
        onClick={() => onChange('')}
        className={`px-3 py-1.5 rounded-full text-xs font-black border-2 whitespace-nowrap ${
          value === ''
            ? 'bg-[#142D95] text-white border-[#142D95]'
            : 'bg-white text-gray-500 border-gray-200'
        }`}
      >
        ทั้งหมด
      </button>
      {options.map(option => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`px-3 py-1.5 rounded-full text-xs font-black border-2 whitespace-nowrap ${
            value === option
              ? 'bg-[#142D95] text-white border-[#142D95]'
              : 'bg-white text-gray-500 border-gray-200'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  </div>
);

function uniqueValues(products: Product[], key: 'detail' | 'size' | 'thickness'): string[] {
  return Array.from(new Set(products.map(product => stringValue(product[key])).filter(Boolean))).sort(compareThaiText);
}

function getGroupedNames(products: Product[], names: string[]) {
  const nameSet = new Set(names);
  return getVisibleCategoryGroups(products)
    .map(group => ({
      id: group.id,
      title: group.title,
      names: Array.from(new Set(
        products
          .filter(product => nameSet.has(stringValue(product.name)) && getProductCategoryGroup(product).id === group.id)
          .map(product => stringValue(product.name)),
      )).sort(compareThaiText),
    }))
    .filter(group => group.names.length > 0);
}

function stringValue(value: unknown): string {
  return String(value ?? '').trim();
}

function compareThaiText(a: string, b: string): number {
  return a.localeCompare(b, 'th');
}

function getStoredSelectedName(): string {
  return localStorage.getItem(LAST_SELECTED_PRICE_CHECK_NAME_KEY) || '';
}

export default PriceCaptureList;
