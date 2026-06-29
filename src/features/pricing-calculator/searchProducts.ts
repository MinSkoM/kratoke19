import type { Product } from '../../types';

const SYNONYM_GROUPS = [
  ['แป๊บ', 'แป๊ป', 'แปบ', 'ท่อ', 'pipe'],
  ['แป๊บกลม', 'แป๊บกลมดำ', 'ท่อกลม', 'กลมดำ'],
  ['แป๊บเหลี่ยม', 'แป๊บเหลี่ยมดำ', 'ท่อเหลี่ยม', 'กล่อง', 'box'],
  ['แป๊บแบน', 'แป๊บแบนดำ', 'ท่อแบน', 'แบนดำ', 'กล่อง'],
  ['ตัวซี', 'ซี', 'cchannel', 'c-channel', 'c channel'],
  ['เหล็กฉาก', 'ฉาก', 'angle'],
  ['รางน้ำ', 'ราง', 'channel'],
  ['เอชบีม', 'hbeam', 'h-beam', 'h beam'],
  ['ไวด์แฟรงค์', 'ไวแฟรงค์', 'wideflange', 'wide-flange', 'wide flange', 'wf'],
  ['แปสำเร็จ', 'แป', 'แปหลังคา'],
  ['ฉากรู', 'ฉากเจาะรู'],
  ['เหล็กแผ่น', 'แผ่นเหล็ก', 'แผ่น', 'plate'],
  ['เหล็กแผ่นลาย', 'แผ่นลาย', 'ลาย'],
  ['เพลท', 'เพลทเหล็ก', 'เพลทเจาะรู'],
  ['แบนรีด', 'flatbar', 'flat bar'],
  ['แบนตัด', 'ตัดแบน'],
  ['เหล็กเส้นกลม', 'เส้นกลม', 'rb', 'roundbar', 'round bar'],
  ['เหล็กเส้นข้ออ้อย', 'ข้ออ้อย', 'db', 'deformedbar', 'deformed bar'],
  ['เพลา', 'เหล็กเพลา', 'shaft'],
  ['สี่เหลี่ยมตัน', 'เหลี่ยมตัน', 'squarebar', 'square bar'],
  ['ลวดมัดเหล็ก', 'ลวดมัด', 'ลวดผูกเหล็ก'],
  ['ปลอกเสา', 'ปลอกคาน', 'ปลอก'],
  ['ไวร์เมช', 'ไวเมท', 'wiremesh', 'wire mesh'],
  ['ท่อไอเสีย', 'ท่อไอเสียรถ'],
  ['ท่อสเตย์', 'สเตย์'],
  ['ท่อเฟอร์นิเจอร์', 'เฟอร์นิเจอร์'],
  ['ประปา', 'ท่อประปา'],
  ['ประปาคาดเหลือง', 'คาดเหลือง'],
  ['ประปาคาดน้ำเงิน', 'คาดน้ำเงิน'],
  ['ประปาปลายเรียบ', 'ปลายเรียบ'],
  ['เหล็กกัลวาไนซ์', 'เหล็กชุบ', 'เหล็กซุบ', 'เหล็กซิงค์', 'ชุบ', 'ซุบ', 'ซิงค์', 'galvanizedsteel', 'galvanized steel', 'gi'],
  ['ตะแกรงฉีก', 'ตะแกรง', 'expandedmetal', 'expanded metal'],
  ['ตาข่ายเบอร์12', 'ตาข่ายเบอร์ 12', 'ตาข่าย', 'mesh'],
  ['ทินเนอร์', 'thinner'],
  ['น้ำมันสน'],
  ['สีกันสนิม', 'กันสนิม'],
  ['สีน้ำมัน'],
  ['4in1', '4 in 1', 'โฟร์อินวัน'],
  ['สีสเปรย์', 'สเปรย์'],
  ['สีสเปรย์กัลวาไนซ์', 'สเปรย์กัลวาไนซ์'],
  ['แปรงทาสี', 'แปรง'],
  ['ลวดเชื่อมโกเบ', 'ลวดเชื่อม', 'โกเบ', 'kobe'],
  ['ใบเจียร', 'เจียร'],
  ['ใบตัด', 'ตัด'],
  ['น็อต', 'น๊อต', 'นอต', 'bolt'],
  ['ปุ๊ก', 'พุก', 'anchor'],
];

export function normalizeSearch(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[()"'.\-–—_/]/g, '');
}

export function searchProduct(product: Product, rawQuery: string): boolean {
  const query = normalizeSearch(rawQuery);
  if (!query) return true;

  const queryTerms = expandSynonyms(query);
  const nameHaystack = buildNameSearchText(product);
  if (queryTerms.some(term => nameHaystack.includes(term))) {
    return true;
  }

  // Avoid broad words such as "ท่อ" matching unrelated rows through variant
  // specs. Search specs only for concrete size/code-like queries.
  if (!isSpecSearch(query)) {
    return false;
  }

  const specHaystack = buildSpecSearchText(product);
  return specHaystack.includes(query);
}

function buildNameSearchText(product: Product): string {
  return [
    product.id,
    product.name,
  ].map(value => normalizeSearch(String(value ?? ''))).filter(Boolean).join('|');
}

function buildSpecSearchText(product: Product): string {
  return [
    product.detail,
    product.size,
    product.thickness,
    product.color,
    product.weight,
  ].map(value => normalizeSearch(String(value ?? ''))).filter(Boolean).join('|');
}

function isSpecSearch(query: string): boolean {
  return /\d/.test(query) || /มม|นิ้ว|หุน|x/.test(query);
}

function expandSynonyms(term: string): string[] {
  const normalized = normalizeSearch(term);
  const expanded = new Set([normalized]);

  SYNONYM_GROUPS.forEach(group => {
    const normalizedGroup = group.map(normalizeSearch);
    const matchesGroup = normalizedGroup.some(alias =>
      normalized.includes(alias) || alias.includes(normalized),
    );
    if (matchesGroup) {
      normalizedGroup.forEach(alias => expanded.add(alias));
    }
  });

  return Array.from(expanded).filter(Boolean);
}
