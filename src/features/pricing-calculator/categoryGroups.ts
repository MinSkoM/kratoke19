import type { Product } from '../../types';

export interface ProductCategoryGroup {
  id: string;
  title: string;
  keywords: string[];
}

export const PRODUCT_CATEGORY_GROUPS: ProductCategoryGroup[] = [
  {
    id: 'structure',
    title: 'เหล็กรูปพรรณและโครงสร้าง',
    keywords: ['แป๊บแบนดำ', 'แป๊บกลมดำ', 'แป๊บเหลี่ยมดำ', 'ตัวซี', 'เหล็กฉาก', 'รางน้ำ', 'เอชบีม', 'ไวด์แฟรงค์', 'แปสำเร็จ', 'ฉากรู'],
  },
  {
    id: 'plate',
    title: 'เหล็กแผ่น เพลท และเหล็กแบน',
    keywords: ['เหล็กแผ่น', 'เหล็กแผ่นลาย', 'เพลท', 'เพลท เจาะรู', 'แบนรีด', 'แบนตัด'],
  },
  {
    id: 'rebar',
    title: 'เหล็กเส้นและตะแกรง',
    keywords: ['เหล็กเส้นกลม', 'เหล็กเส้นข้ออ้อย', 'เพลา', 'สี่เหลี่ยมตัน', 'ลวดมัดเหล็ก', 'ปลอกเสา', 'ปลอกคาน', 'ไวร์เมช', 'ตะแกรงฉีก', 'ตาข่ายเบอร์ 12'],
  },
  {
    id: 'special-pipe',
    title: 'ท่อและเหล็กกัลวาไนซ์',
    keywords: ['ท่อไอเสีย', 'ท่อสเตย์', 'ท่อเฟอร์นิเจอร์', 'ประปาคาดเหลือง', 'ประปาคาดน้ำเงิน', 'ประปาปลายเรียบ', 'เหล็กกัลวาไนซ์'],
  },
  {
    id: 'paint',
    title: 'สี เคมีภัณฑ์ และอุปกรณ์ทาสี',
    keywords: ['ทินเนอร์', 'น้ำมันสน', 'สีกันสนิม', 'สีน้ำมัน', '4 in 1 ดำ - บรอนซ์', 'สีสเปรย์', 'สีสเปรย์กัลวาไนซ์', 'แปรงทาสี'],
  },
  {
    id: 'tools',
    title: 'เครื่องมือช่างและอุปกรณ์ยึดติด',
    keywords: ['ลวดเชื่อมโกเบ', 'ใบเจียร', 'ใบตัด', 'น็อต', 'ปุ๊ก', 'แผ่นเหล็ก'],
  },
];

export const FALLBACK_CATEGORY_GROUP: ProductCategoryGroup = {
  id: 'other',
  title: 'สินค้าอื่นๆ',
  keywords: [],
};

export function getProductCategoryGroup(product: Product): ProductCategoryGroup {
  const normalizedName = normalizeCategoryText(product.name);
  const match = PRODUCT_CATEGORY_GROUPS.find(group =>
    group.keywords.some(keyword => {
      const normalizedKeyword = normalizeCategoryText(keyword);
      return normalizedName.includes(normalizedKeyword) || normalizedKeyword.includes(normalizedName);
    }),
  );
  return match ?? FALLBACK_CATEGORY_GROUP;
}

export function getVisibleCategoryGroups(products: Product[]): ProductCategoryGroup[] {
  const visibleIds = new Set(products.map(product => getProductCategoryGroup(product).id));
  const ordered = PRODUCT_CATEGORY_GROUPS.filter(group => visibleIds.has(group.id));
  return visibleIds.has(FALLBACK_CATEGORY_GROUP.id) ? [...ordered, FALLBACK_CATEGORY_GROUP] : ordered;
}

export function normalizeCategoryText(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[()"'.\-–—_/]/g, '')
    .replace(/ดำ$/g, '');
}
