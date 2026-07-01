import { useEffect, useMemo, useRef, useState } from 'react';
import type { FC } from 'react';
import { Check, ChevronDown, ListFilter, Search, X } from 'lucide-react';
import type { Product } from '../../../types';
import { getProductCategoryGroup, getVisibleCategoryGroups } from '../categoryGroups';
import { searchProduct } from '../searchProducts';

interface PriceCaptureListProps {
  products: Product[];
}

const CAPTURE_PAGE_SIZE = 12;
const LAST_SELECTED_PRICE_CHECK_NAME_KEY = 'kratoke_price_check_last_name';

const PriceCaptureList: FC<PriceCaptureListProps> = ({ products }) => {
  const names = useMemo(
    () => uniqueInSheetOrder(products.map(product => stringValue(product.name))),
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
      return uniqueInSheetOrder(matchedProducts.map(product => stringValue(product.name)));
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
      .filter(product => stringValue(product.name) === visibleActiveName),
    [products, visibleActiveName],
  );
  const detailOptions = useMemo(() => uniqueDisplayValues(baseVariants, 'detail'), [baseVariants]);
  const sizeOptions = useMemo(() => uniqueDisplayValues(baseVariants, 'size'), [baseVariants]);
  const thicknessOptions = useMemo(() => uniqueDisplayValues(baseVariants, 'thickness'), [baseVariants]);
  const filterControls = [
    detailOptions.length > 1 ? { label: 'รายละเอียด', value: detailFilter, options: detailOptions, onChange: setDetailFilter } : null,
    sizeOptions.length > 1 ? { label: 'ขนาด', value: sizeFilter, options: sizeOptions, onChange: setSizeFilter } : null,
    thicknessOptions.length > 1 ? { label: 'หนา', value: thicknessFilter, options: thicknessOptions, onChange: setThicknessFilter } : null,
  ].filter(Boolean) as FilterSelectProps[];

  const variants = useMemo(
    () => baseVariants.filter(product => {
      const fields = getDisplayFields(product);
      return (!detailFilter || fields.detail === detailFilter)
        && (!sizeFilter || fields.size === sizeFilter)
        && (!thicknessFilter || fields.thickness === thicknessFilter);
    }),
    [baseVariants, detailFilter, sizeFilter, thicknessFilter],
  );
  const pageCount = Math.max(1, Math.ceil(variants.length / CAPTURE_PAGE_SIZE));
  const visibleVariants = variants.slice(page * CAPTURE_PAGE_SIZE, (page + 1) * CAPTURE_PAGE_SIZE);
  const priceUnitLabel = useMemo(() => {
    const units = uniqueInSheetOrder(baseVariants.map(productUnit));
    return units.length === 1 ? units[0] : 'หน่วย';
  }, [baseVariants]);
  const visibleColumns = useMemo(() => {
    const fields = baseVariants.map(getDisplayFields);
    return {
      detail: fields.some(field => Boolean(field.detail)),
      size: fields.some(field => Boolean(field.size)),
      thickness: fields.some(field => Boolean(field.thickness)),
    };
  }, [baseVariants]);
  const tableGridClass = getTableGridClass(visibleColumns);

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
      <div className="bg-[#1F2937] px-5 py-4 text-white">
        <div className="flex items-center gap-2">
          <ListFilter size={20} className="text-[#F59E0B]" />
          <h2 className="text-lg font-black">เช็กราคาตามชื่อสินค้า</h2>
        </div>
        <p className="text-[0.75rem] font-semibold text-[#EEF2F3] mt-1">ราคาสินค้าจากทางบริษัทอาจมีการเปลี่ยนแปลงได้ตามราคาตลาด</p>
      </div>

      <div className="p-4">
        <div className="relative mb-4">
          <div className="flex items-center justify-between mb-1.5 px-0.5">
            <label className="text-sm font-black text-gray-600">เลือกสินค้า</label>
            <span className="text-sm font-bold text-gray-600">แตะเพื่อเลือกหรือค้นหา</span>
          </div>
          <div
            className={`relative flex items-center overflow-hidden bg-white border-2 rounded-2xl shadow-sm transition-all ${
              isNamePickerOpen ? 'border-[#1F2937] ring-2 ring-[#64748B]/20' : 'border-gray-200'
            }`}
          >
            <Search size={17} className="absolute left-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              disabled={names.length === 0}
              placeholder="เลือกสินค้าที่ต้องการ"
              value={isNamePickerOpen ? searchTerm : visibleActiveName}
              onFocus={() => {
                setSearchTerm('');
                setIsNamePickerOpen(true);
              }}
              onChange={event => {
                setSearchTerm(event.target.value);
                setIsNamePickerOpen(true);
              }}
              className={`w-full pl-10 pr-20 py-3.5 text-base bg-transparent outline-none placeholder:text-gray-300 ${
                searchTerm || visibleActiveName ? 'font-black text-gray-900' : 'font-semibold text-gray-400'
              }`}
            />
            {(searchTerm || selectedName) && (
              <button
                type="button"
                aria-label="ล้างสินค้า"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedName('');
                  localStorage.removeItem(LAST_SELECTED_PRICE_CHECK_NAME_KEY);
                  setIsNamePickerOpen(false);
                }}
                className="absolute right-12 top-1/2 -translate-y-1/2 w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center"
              >
                <X size={14} className="text-gray-500" />
              </button>
            )}
            <button
              type="button"
              aria-label="เปิดรายการสินค้า"
              disabled={names.length === 0}
              onClick={() => {
                setSearchTerm('');
                setIsNamePickerOpen(previous => !previous);
              }}
              className={`w-11 self-stretch flex items-center justify-center border-l transition-colors disabled:bg-gray-50 ${
                isNamePickerOpen ? 'bg-[#EEF2F3] border-[#64748B]/40' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <ChevronDown
                size={22}
                className={`text-[#1F2937] shrink-0 transition-transform ${isNamePickerOpen ? 'rotate-180' : ''}`}
              />
            </button>
          </div>

          {isNamePickerOpen && (
            <div className="absolute z-30 left-0 right-0 mt-2 max-h-80 overflow-y-auto rounded-2xl border-2 border-[#1F2937]/20 bg-white shadow-2xl">
              {selectableNames.length > 0 ? (
                groupedNames.map(group => (
                  <div key={group.id} className="border-b border-gray-100 last:border-0">
                    <p className="sticky top-0 bg-[#EEF2F3] px-4 py-2 text-sm font-black text-[#1F2937]">
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
                            setSearchTerm('');
                            localStorage.setItem(LAST_SELECTED_PRICE_CHECK_NAME_KEY, name);
                            setIsNamePickerOpen(false);
                          }}
                          className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-left ${
                            isSelected ? 'bg-[#F3E7E2]' : 'bg-white'
                          }`}
                        >
                          <span className={`text-sm font-bold ${isSelected ? 'text-gray-950' : 'text-gray-800'}`}>
                            {name}
                          </span>
                          {isSelected && <Check size={17} className="text-[#1F2937] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-base font-semibold text-gray-600">
                  ไม่พบสินค้าที่ค้นหา
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {filterControls.map((filter, index) => (
            <FilterSelect
              key={filter.label}
              {...filter}
              className={filterControls.length === 3 && index === 0 ? 'col-span-2' : filterControls.length === 1 ? 'col-span-2' : ''}
            />
          ))}
        </div>

        <div className="rounded-2xl border border-gray-100 overflow-hidden">
          <div className="bg-[#EEF2F3] px-4 py-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-base font-black text-[#1F2937] leading-tight">{visibleActiveName || 'เลือกสินค้า'}</p>
              <p className="text-xs font-semibold text-gray-500 mt-0.5">
                {visibleActiveName ? `${variants.length} จาก ${baseVariants.length} รายการ${pageCount > 1 ? ` · หน้า ${page + 1}/${pageCount}` : ''}` : 'กรุณาเลือกสินค้าเพื่อดูราคา'}
              </p>
            </div>
            <p className="text-xs font-black text-gray-500 whitespace-nowrap">ราคา/{priceUnitLabel}</p>
          </div>

          <div className={`grid ${tableGridClass} bg-gray-50 px-3 py-2.5 text-xs font-black text-gray-500`}>
            {visibleColumns.detail && <span>รายละเอียด</span>}
            {visibleColumns.size && <span>ขนาด</span>}
            {visibleColumns.thickness && <span>หนา</span>}
            <span className="text-right">ราคา</span>
          </div>

          <div className="divide-y divide-gray-100">
            {!visibleActiveName ? (
              <div className="px-4 py-8 text-center text-sm font-semibold text-gray-500">
                กรุณาเลือกสินค้า
              </div>
            ) : visibleVariants.length > 0 ? (
              visibleVariants.map(product => {
                const fields = getDisplayFields(product);
                return (
                  <div key={product.id} className={`grid min-h-[50px] ${tableGridClass} gap-2 px-3 py-3 items-center`}>
                    {visibleColumns.detail && <p className="text-sm font-bold text-gray-900 leading-snug">{fields.detail || '-'}</p>}
                    {visibleColumns.size && <p className="text-sm font-bold text-gray-700 leading-snug">{fields.size || '-'}</p>}
                    {visibleColumns.thickness && <p className="text-sm font-bold text-gray-700 leading-snug">{fields.thickness || '-'}</p>}
                    <p className="text-base font-black text-[#C2410C] text-right whitespace-nowrap">{numberText(product.price)}</p>
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center text-sm font-semibold text-gray-500">
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
                className={`px-3.5 py-2 rounded-full text-xs font-black border-2 whitespace-nowrap ${
                  page === index
                    ? 'bg-[#1F2937] text-white border-[#1F2937]'
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

interface FilterSelectProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  className?: string;
}

const FilterSelect: FC<FilterSelectProps> = ({ label, value, options, onChange, className = '' }) => (
  <label className={`rounded-2xl border border-[#CBD5E1] bg-[#F7F8F6] px-3 py-2 ${className}`}>
    <span className="mb-1 block text-xs font-black text-gray-500 leading-tight">{label}</span>
    <div className="relative min-w-0 flex-1">
      <select
        value={value}
        onChange={event => onChange(event.target.value)}
        className="min-h-10 w-full appearance-none rounded-xl border border-gray-200 bg-white px-3 pr-9 text-sm font-black text-gray-900 outline-none transition-colors focus:border-[#1F2937]"
      >
        <option value="">ทั้งหมด</option>
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      <ChevronDown
        size={17}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#1F2937]"
      />
    </div>
  </label>
);

type DisplayFieldKey = 'detail' | 'size' | 'thickness';
type VisibleColumns = Record<DisplayFieldKey, boolean>;

function uniqueDisplayValues(products: Product[], key: DisplayFieldKey): string[] {
  return uniqueInSheetOrder(products.map(product => getDisplayFields(product)[key])).sort(compareNumericOption);
}

function getDisplayFields(product: Product): Record<DisplayFieldKey, string> {
  const detail = stringValue(product.detail);
  const size = stringValue(product.size);
  const thickness = stringValue(product.thickness);

  if (!size && looksLikeSize(detail)) {
    return { detail: '', size: detail, thickness };
  }

  return { detail, size, thickness };
}

function looksLikeSize(value: string): boolean {
  return /(\d+\s*(?:["x×*]|นิ้ว)|["x×*]\s*\d+|\d+\s*มม\.?)/i.test(value);
}

function getTableGridClass(columns: VisibleColumns): string {
  const count = Number(columns.detail) + Number(columns.size) + Number(columns.thickness);
  if (count === 0) return 'grid-cols-[1fr]';
  if (count === 1) return 'grid-cols-[1fr_0.8fr]';
  if (count === 2) return 'grid-cols-[1fr_1fr_0.85fr]';
  return 'grid-cols-[0.9fr_1.15fr_1fr_0.95fr]';
}

function getGroupedNames(products: Product[], names: string[]) {
  const nameSet = new Set(names);
  return getVisibleCategoryGroups(products)
    .map(group => ({
      id: group.id,
      title: group.title,
      names: uniqueInSheetOrder(
        products
          .filter(product => nameSet.has(stringValue(product.name)) && getProductCategoryGroup(product).id === group.id)
          .map(product => stringValue(product.name)),
      ),
    }))
    .filter(group => group.names.length > 0);
}

function uniqueInSheetOrder(values: string[]): string[] {
  const seen = new Set<string>();
  return values
    .map(stringValue)
    .filter(value => {
      if (!value || seen.has(value)) return false;
      seen.add(value);
      return true;
    });
}

function productUnit(product: Product): string {
  return stringValue(product.unit) || 'หน่วย';
}

function numberText(value: number): string {
  return value.toLocaleString('en-US');
}

function compareNumericOption(a: string, b: string): number {
  const aNumbers = extractSortableNumbers(a);
  const bNumbers = extractSortableNumbers(b);
  const count = Math.min(aNumbers.length, bNumbers.length);

  for (let index = 0; index < count; index += 1) {
    if (aNumbers[index] !== bNumbers[index]) return aNumbers[index] - bNumbers[index];
  }

  if (aNumbers.length !== bNumbers.length) return aNumbers.length - bNumbers.length;
  return a.localeCompare(b, 'th', { numeric: true });
}

function extractSortableNumbers(value: string): number[] {
  const normalized = value.replace(/,/g, '');
  const numbers: number[] = [];
  const pattern = /(\d+)\.(\d+)\/(\d+)|(\d+)\/(\d+)|\d+(?:\.\d+)?/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(normalized)) !== null) {
    if (match[1] && match[2] && match[3]) {
      numbers.push(Number(match[1]) + Number(match[2]) / Number(match[3]));
    } else if (match[4] && match[5]) {
      numbers.push(Number(match[4]) / Number(match[5]));
    } else {
      numbers.push(Number(match[0]));
    }
  }

  return numbers;
}

function stringValue(value: unknown): string {
  return String(value ?? '').trim();
}

function getStoredSelectedName(): string {
  return localStorage.getItem(LAST_SELECTED_PRICE_CHECK_NAME_KEY) || '';
}

export default PriceCaptureList;
