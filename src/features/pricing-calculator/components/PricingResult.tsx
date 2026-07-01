import { useEffect, useState } from 'react';
import type { FC } from 'react';
import type { PricingResult as PricingResultData } from '../pricingTypes';
import { fmt } from '../../../utils/fmt';
import { Download, Eye, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { submitQuotation } from '../../../lib/gasClient';

interface PricingResultProps {
  result: PricingResultData;
  onRemoveItem: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
}

const PricingResult: FC<PricingResultProps> = ({ result, onRemoveItem, onUpdateQuantity }) => {
  const hasItems = result.items.length > 0;
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  const handleSaveEstimate = async () => {
    if (isSaving) return;
    if (!window.confirm('ยืนยันบันทึกใบเสนอราคาใช่ไหม?')) return;

    try {
      setIsSaving(true);
      await saveEstimateImage(result);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'ไม่สามารถบันทึกใบเสนอราคาได้');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!hasItems || !isPreviewOpen) {
      setPreviewUrl('');
      return;
    }

    let nextUrl = '';
    let isCancelled = false;
    createEstimateImageBlob(result, getPreviewQuoteNo())
      .then(blob => {
        if (isCancelled) return;
        nextUrl = URL.createObjectURL(blob);
        setPreviewUrl(nextUrl);
      })
      .catch(() => {
        if (!isCancelled) setPreviewUrl('');
      });

    return () => {
      isCancelled = true;
      if (nextUrl) URL.revokeObjectURL(nextUrl);
    };
  }, [hasItems, isPreviewOpen, result]);

  return (
    <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-5">
      <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-3">
        <ShoppingBag size={20} className="text-[#1F2937]" />
        <h3 className="text-lg font-black text-gray-900">รายการคำนวณ</h3>
      </div>

      {!hasItems ? (
        <div className="text-center py-8 text-gray-600">
          <ShoppingBag size={36} className="mx-auto mb-2 opacity-30" />
          <p className="text-base font-semibold">ยังไม่มีสินค้าในรายการ</p>
        </div>
      ) : (
        <div className="space-y-3 mb-4">
          {result.items.map(item => (
            <div key={item.id} className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-gray-900">{item.product.name}</p>
        <p className="text-sm text-[#1F2937] font-semibold mt-0.5">
                  {formatSpecs(item.product)}
                </p>
                <p className="text-sm font-black text-[#C2410C] mt-1">{fmt(item.subtotal)}</p>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onRemoveItem(item.id)}
                  className="w-8 h-8 rounded-full bg-[#F3E7E2] text-[#C2410C] flex items-center justify-center"
                >
                  <Trash2 size={15} />
                </button>
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full overflow-hidden">
                  <button
                    type="button"
                    aria-label="ลดจำนวนสินค้า"
                    disabled={item.quantity <= 1}
                    onClick={() => onUpdateQuantity(item.id, -1)}
                    className="px-2.5 py-1.5 text-gray-400 active:text-[#C2410C] disabled:cursor-not-allowed disabled:text-gray-200 disabled:active:text-gray-200"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-gray-800">{item.quantity}</span>
                  <button
                    type="button"
                    aria-label="เพิ่มจำนวนสินค้า"
                    onClick={() => onUpdateQuantity(item.id, 1)}
                    className="px-2.5 py-1.5 text-gray-400 active:text-[#1F2937]"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end justify-between border-t border-dashed border-gray-200 mt-4 pt-4">
        <span className="text-base font-black text-gray-700">ยอดรวมสินค้า</span>
        <span className="text-3xl font-black text-[#C2410C]">{fmt(result.total)}</span>
      </div>

      {hasItems && (
        <>
          <button
            type="button"
            onClick={() => setIsPreviewOpen(previous => !previous)}
            className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#F3E7E2] text-[#1F2937] text-base font-black shadow-sm active:scale-95 transition-transform"
          >
            <Eye size={18} /> {isPreviewOpen ? 'ซ่อนตัวอย่างใบเสนอราคา' : 'ดูตัวอย่างใบเสนอราคา'}
          </button>

          {isPreviewOpen && (
            <div className="mt-3 rounded-2xl border border-gray-100 bg-gray-50 p-2">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="ตัวอย่างใบเสนอราคา"
                  className="w-full rounded-xl bg-white shadow-sm"
                />
              ) : (
                <div className="py-10 text-center text-base font-semibold text-gray-600">
                  กำลังสร้างตัวอย่าง...
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSaveEstimate}
            className="mt-3 w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#1F2937] text-white text-base font-black shadow-sm active:scale-95 transition-transform disabled:cursor-wait disabled:bg-gray-300 disabled:active:scale-100"
          >
            <Download size={18} /> {isSaving ? 'กำลังบันทึก...' : 'บันทึกใบเสนอราคา'}
          </button>
        </>
      )}
    </div>
  );
};

function formatSpecs(product: PricingResultData['items'][number]['product']): string {
  return [
    product.detail,
    product.size && `ขนาด ${product.size}`,
    product.thickness && `หนา ${product.thickness}`,
  ].filter(Boolean).join(' · ') || product.id;
}

async function saveEstimateImage(result: PricingResultData) {
  const { quoteId: quoteNo } = await submitQuotation({
    items: result.items.map(item => ({
      id: item.product.id,
      name: item.product.name,
      detail: item.product.detail,
      size: item.product.size,
      thickness: item.product.thickness,
      unit: productUnit(item.product),
      quantity: item.quantity,
      price: item.unitPrice,
    })),
    totalQuantity: result.items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: result.total,
  });
  const blob = await createEstimateImageBlob(result, quoteNo);
  const file = new File([blob], 'ใบเสนอราคา_เหล็กกระโทก.png', { type: 'image/png' });

  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      files: [file],
      title: 'บริษัท กระโทก จำกัด',
      text: 'ใบเสนอราคา',
    });
    return;
  }

  if (isLineBrowser()) {
    await openImageSavePage(blob);
    return;
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'ใบเสนอราคา_เหล็กกระโทก.png';
  link.click();
  URL.revokeObjectURL(url);
}

function isLineBrowser(): boolean {
  return /\bLine\//i.test(navigator.userAgent);
}

async function openImageSavePage(blob: Blob): Promise<void> {
  const imageDataUrl = await blobToDataUrl(blob);
  const page = new Blob([`<!doctype html>
<html lang="th">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>ใบเสนอราคา</title>
    <style>
      body {
        margin: 0;
        background: #F7F8F6;
        color: #1F2937;
        font-family: K2D, Sarabun, Arial, sans-serif;
      }
      .wrap {
        max-width: 920px;
        margin: 0 auto;
        padding: 16px;
      }
      .note {
        background: #F3E7E2;
        border-radius: 18px;
        padding: 14px 16px;
        font-size: 16px;
        font-weight: 700;
        line-height: 1.55;
        margin-bottom: 12px;
      }
      img {
        display: block;
        width: 100%;
        height: auto;
        background: white;
        border-radius: 12px;
      }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="note">กดค้างที่รูปใบเสนอราคา แล้วเลือกบันทึกรูปภาพ หรือส่งต่อให้ลูกค้า</div>
      <img src="${imageDataUrl}" alt="ใบเสนอราคา" />
    </div>
  </body>
</html>`], { type: 'text/html' });
  window.location.href = URL.createObjectURL(page);
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('ไม่สามารถแสดงรูปใบเสนอราคาได้'));
    reader.readAsDataURL(blob);
  });
}

function getPreviewQuoteNo(): string {
  const year = String(new Date().getFullYear()).slice(-2);
  return `K${year}00000`;
}

async function createEstimateImageBlob(result: PricingResultData, quoteNo: string): Promise<Blob> {
  const width = 1600;
  const margin = 72;
  const rowHeight = 66;
  const headerHeight = 330;
  const footerHeight = 300;
  const height = Math.max(980, headerHeight + result.items.length * rowHeight + footerHeight);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Cannot create image.');

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#1F2937';
  ctx.textBaseline = 'alphabetic';

  const dateText = formatThaiDate(new Date());
  const rightBlockX = width - 540;

  ctx.font = font(30, 700);
  ctx.fillText('บริษัท กระโทก จำกัด', margin, 82);
  ctx.font = font(25, 400);
  ctx.fillText('222 หมู่ 10 ต.โชคชัย อ.โชคชัย จ.นครราชสีมา 30190', margin, 122);
  ctx.fillText('โทร. 081-9678272, 081-9678273, 086-6491969', margin, 160);

  ctx.font = font(38, 700);
  drawLetterSpacedText(ctx, 'ใบเสนอราคา', width - 310, 92, 8, 'center');
  ctx.textAlign = 'left';

  ctx.font = font(25, 500);
  drawMetaRow(ctx, 'เลขที่', quoteNo, rightBlockX, 154);
  drawMetaRow(ctx, 'วันที่', dateText, rightBlockX, 194);
  drawMetaRow(ctx, 'พนักงานขาย', 'ออนไลน์', rightBlockX, 234);

  ctx.font = font(25, 500);
  ctx.fillText('ลูกค้า', margin, 226);
  ctx.font = font(25, 400);
  ctx.fillText('................................................................................................', margin + 86, 226);
  
  const tableTop = headerHeight;
  const tableLeft = margin;
  const tableRight = width - margin;
  drawRule(ctx, tableLeft, tableTop - 46, tableRight, '#1F2937', 1.2);
  drawRule(ctx, tableLeft, tableTop + 22, tableRight, '#1F2937', 1.2);

  const col = {
    no: tableLeft + 28,
    desc: tableLeft + 150,
    qty: width - 600,
    unit: width - 390,
    amount: width - 105,
  };

  ctx.fillStyle = '#1F2937';
  ctx.font = font(25, 600);
  ctx.fillText('ลำดับ', col.no, tableTop);
  ctx.fillText('รหัสสินค้า/รายละเอียด', col.desc, tableTop);
  ctx.textAlign = 'right';
  ctx.fillText('จำนวน', col.qty, tableTop);
  ctx.fillText('ราคาต่อหน่วย', col.unit, tableTop);
  ctx.fillText('จำนวนเงิน', col.amount, tableTop);
  ctx.textAlign = 'left';

  let y = tableTop + 78;
  result.items.forEach((item, index) => {
    const desc = `${item.product.name} ${formatSpecs(item.product)}`;
    const rowTop = y - 38;
    if (index % 2 === 1) {
      ctx.fillStyle = '#F7F8F6';
      ctx.fillRect(tableLeft, rowTop, tableRight - tableLeft, rowHeight);
    }
    drawRule(ctx, tableLeft, rowTop + rowHeight, tableRight, '#CBD5E1', 0.8);

    ctx.fillStyle = '#1F2937';
    ctx.font = font(25, 400);
    ctx.fillText(String(index + 1), col.no + 18, y);
    drawFittedText(ctx, desc, col.desc, y, col.qty - col.desc - 52, 25, 400);
    ctx.textAlign = 'right';
    ctx.fillText(`${item.quantity.toFixed(2)} ${productUnit(item.product)}`, col.qty, y);
    ctx.fillText(moneyText(item.unitPrice), col.unit, y);
    ctx.fillText(moneyText(item.subtotal), col.amount, y);
    ctx.textAlign = 'left';
    y += rowHeight;
  });

  const footerLineY = height - 250;
  drawRule(ctx, tableLeft, footerLineY, tableRight, '#1F2937', 1.2);

  ctx.fillStyle = '#1F2937';
  ctx.font = font(24, 400);
  ctx.fillText(`(${thaiBahtText(result.total)})`, margin + 26, footerLineY + 54);
  ctx.fillText('หมายเหตุ  ราคานี้รวมภาษีมูลค่าเพิ่มแล้ว', margin + 26, footerLineY + 100);

  const totalBoxX = width - 560;
  const totalBoxY = footerLineY + 26;
  ctx.font = font(26, 600);
  ctx.fillText('ยอดรวมสุทธิ', totalBoxX + 24, totalBoxY + 48);
  ctx.textAlign = 'right';
  ctx.fillText(moneyText(result.total), width - margin, totalBoxY + 48);
  ctx.textAlign = 'left';

  ctx.font = font(24, 400);
  ctx.fillText('เสนอราคาในนาม  บริษัท กระโทก จำกัด', totalBoxX, totalBoxY + 118);
  
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error('Cannot create image file.'));
    }, 'image/png');
  });
}

function drawRule(ctx: CanvasRenderingContext2D, x1: number, y: number, x2: number, color: string, lineWidth: number) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.moveTo(x1, y);
  ctx.lineTo(x2, y);
  ctx.stroke();
  ctx.restore();
}

function drawFittedText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, fontSize: number, weight = 400) {
  ctx.font = font(fontSize, weight);
  let nextText = text;
  while (ctx.measureText(nextText).width > maxWidth && nextText.length > 12) {
    nextText = `${nextText.slice(0, -2)}…`;
  }
  ctx.fillText(nextText, x, y);
}

function font(size: number, weight: number): string {
  return `${weight} ${size}px K2D, Sarabun, Arial, sans-serif`;
}

function drawMetaRow(ctx: CanvasRenderingContext2D, label: string, value: string, x: number, y: number) {
  ctx.textAlign = 'left';
  ctx.fillText(label, x, y);
  ctx.fillText(':', x + 140, y);
  ctx.fillText(value, x + 170, y);
}

function drawLetterSpacedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  spacing: number,
  align: CanvasTextAlign = 'left',
) {
  const widths = Array.from(text).map(char => ctx.measureText(char).width);
  const totalWidth = widths.reduce((sum, width) => sum + width, 0) + spacing * Math.max(0, widths.length - 1);
  let currentX = align === 'center' ? x - totalWidth / 2 : align === 'right' ? x - totalWidth : x;
  Array.from(text).forEach((char, index) => {
    ctx.fillText(char, currentX, y);
    currentX += widths[index] + spacing;
  });
}

function numberText(value: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function moneyText(value: number): string {
  return `${numberText(value)} บาท`;
}

const THAI_DIGITS = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
const THAI_PLACES = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน'];

function thaiBahtText(value: number): string {
  const safeValue = Math.max(0, Math.round(value * 100) / 100);
  const baht = Math.floor(safeValue);
  const satang = Math.round((safeValue - baht) * 100);
  const bahtText = `${thaiNumberText(baht)}บาท`;
  if (satang === 0) return `${bahtText}ถ้วน`;
  return `${bahtText}${thaiNumberText(satang)}สตางค์`;
}

function thaiNumberText(value: number): string {
  if (value === 0) return 'ศูนย์';
  if (value >= 1_000_000) {
    const millions = Math.floor(value / 1_000_000);
    const remainder = value % 1_000_000;
    return `${thaiNumberText(millions)}ล้าน${remainder ? thaiNumberText(remainder) : ''}`;
  }

  const digits = String(value).split('').map(Number);
  const length = digits.length;
  return digits.map((digit, index) => {
    if (digit === 0) return '';
    const place = length - index - 1;
    if (place === 0 && digit === 1 && length > 1) return 'เอ็ด';
    if (place === 1 && digit === 1) return 'สิบ';
    if (place === 1 && digit === 2) return 'ยี่สิบ';
    return `${THAI_DIGITS[digit]}${THAI_PLACES[place]}`;
  }).join('');
}

function formatThaiDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear() + 543).slice(-2);
  return `${day}/${month}/${year}`;
}

function productUnit(product: PricingResultData['items'][number]['product']): string {
  return String(product.unit || '').trim() || 'หน่วย';
}

export default PricingResult;
