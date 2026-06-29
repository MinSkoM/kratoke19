import { useEffect, useMemo, useState } from 'react';
import type { FC } from 'react';
import { ListFilter } from 'lucide-react';
import type { Product } from '../../../types';
import { fmt } from '../../../utils/fmt';

interface PriceCaptureListProps {
  products: Product[];
}

const CAPTURE_PAGE_SIZE = 12;

const PriceCaptureList: FC<PriceCaptureListProps> = ({ products }) => {
  const names = useMemo(
    () => Array.from(new Set(products.map(product => product.name).filter(Boolean))).sort(),
    [products],
  );
  const [selectedName, setSelectedName] = useState('');
  const [detailFilter, setDetailFilter] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [thicknessFilter, setThicknessFilter] = useState('');
  const [page, setPage] = useState(0);
  const activeName = selectedName || names[0] || '';

  const baseVariants = useMemo(
    () => products
      .filter(product => product.name === activeName)
      .sort((a, b) => a.id.localeCompare(b.id, 'th')),
    [activeName, products],
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
    setDetailFilter('');
    setSizeFilter('');
    setThicknessFilter('');
    setPage(0);
  }, [activeName]);

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
        <p className="text-xs text-[#AFC7FF] mt-1">เลือกชื่อสินค้าเพื่อดูราคาทุกขนาดสำหรับแคปหน้าจอ</p>
      </div>

      <div className="p-4">
        <select
          value={activeName}
          onChange={event => setSelectedName(event.target.value)}
          className="input-field mb-4"
        >
          {names.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>

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
              <p className="text-base font-black text-[#142D95]">{activeName}</p>
              <p className="text-xs font-semibold text-gray-400">
                {variants.length} จาก {baseVariants.length} รายการ{pageCount > 1 ? ` · ชุด ${page + 1}/${pageCount}` : ''}
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
            {visibleVariants.length > 0 ? (
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
                ชุด {index + 1}
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
  return Array.from(new Set(products.map(product => product[key]).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'th'));
}

export default PriceCaptureList;
