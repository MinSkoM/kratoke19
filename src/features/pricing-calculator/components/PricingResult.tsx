import type { FC } from 'react';
import type { PricingResult as PricingResultData } from '../pricingTypes';
import { fmt } from '../../../utils/fmt';
import { Download, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';

interface PricingResultProps {
  result: PricingResultData;
  onRemoveItem: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
}

const PricingResult: FC<PricingResultProps> = ({ result, onRemoveItem, onUpdateQuantity }) => {
  const hasItems = result.items.length > 0;

  return (
    <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-5">
      <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-3">
        <ShoppingBag size={20} className="text-[#142D95]" />
        <h3 className="text-lg font-black text-gray-900">รายการคำนวณ</h3>
      </div>

      {!hasItems ? (
        <div className="text-center py-8 text-gray-400">
          <ShoppingBag size={36} className="mx-auto mb-2 opacity-30" />
          <p className="text-base font-semibold">ยังไม่มีสินค้าในรายการ</p>
        </div>
      ) : (
        <div className="space-y-3 mb-4">
          {result.items.map(item => (
            <div key={item.id} className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-gray-900">{item.product.name}</p>
                <p className="text-xs text-[#6A9DF7] font-semibold mt-0.5">
                  {formatSpecs(item.product)} · {fmt(item.unitPrice)}/ชิ้น
                </p>
                <p className="text-sm font-black text-orange-500 mt-1">{fmt(item.subtotal)}</p>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onRemoveItem(item.id)}
                  className="w-8 h-8 rounded-full bg-red-50 text-red-400 flex items-center justify-center"
                >
                  <Trash2 size={15} />
                </button>
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full overflow-hidden">
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(item.id, -1)}
                    className="px-2.5 py-1.5 text-gray-400 active:text-red-500"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-gray-800">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(item.id, 1)}
                    className="px-2.5 py-1.5 text-gray-400 active:text-[#142D95]"
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
        <span className="text-3xl font-black text-orange-500">{fmt(result.total)}</span>
      </div>

      {hasItems && (
        <button
          type="button"
          onClick={() => saveEstimateImage(result)}
          className="mt-4 w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#142D95] text-white text-base font-black shadow-sm active:scale-95 transition-transform"
        >
          <Download size={18} /> บันทึกเป็นรูป
        </button>
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
  const blob = await createEstimateImageBlob(result);
  const file = new File([blob], 'kratoke-estimate.png', { type: 'image/png' });

  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      files: [file],
      title: 'Kratoke Steel Shop',
      text: 'รายการคำนวณราคา',
    });
    return;
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'kratoke-estimate.png';
  link.click();
  URL.revokeObjectURL(url);
}

async function createEstimateImageBlob(result: PricingResultData): Promise<Blob> {
  const width = 1080;
  const padding = 56;
  const rowHeight = 128;
  const headerHeight = 190;
  const totalHeight = 160;
  const height = headerHeight + result.items.length * rowHeight + totalHeight + padding;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Cannot create image.');

  ctx.fillStyle = '#F5F7FF';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#142D95';
  roundRect(ctx, padding, padding, width - padding * 2, height - padding * 2, 36);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  roundRect(ctx, padding + 18, padding + 18, width - padding * 2 - 36, height - padding * 2 - 36, 28);
  ctx.fill();

  let y = padding + 76;
  ctx.fillStyle = '#142D95';
  ctx.font = '900 42px Prompt, Sarabun, sans-serif';
  ctx.fillText('KRATOKE STEEL SHOP', padding + 52, y);
  y += 46;
  ctx.fillStyle = '#6B7280';
  ctx.font = '700 28px Prompt, Sarabun, sans-serif';
  ctx.fillText('รายการคำนวณราคา', padding + 52, y);
  y += 52;

  result.items.forEach((item, index) => {
    const rowY = y + index * rowHeight;
    ctx.fillStyle = index % 2 === 0 ? '#F8FAFC' : '#FFFFFF';
    roundRect(ctx, padding + 36, rowY - 24, width - padding * 2 - 72, rowHeight - 14, 18);
    ctx.fill();

    ctx.fillStyle = '#111827';
    ctx.font = '900 28px Prompt, Sarabun, sans-serif';
    ctx.fillText(item.product.name, padding + 64, rowY + 10);

    ctx.fillStyle = '#2563EB';
    ctx.font = '700 23px Prompt, Sarabun, sans-serif';
    ctx.fillText(`${formatSpecs(item.product)} · x${item.quantity}`, padding + 64, rowY + 48);

    ctx.fillStyle = '#F97316';
    ctx.font = '900 30px Prompt, Sarabun, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(fmt(item.subtotal), width - padding - 64, rowY + 28);
    ctx.textAlign = 'left';
  });

  y += result.items.length * rowHeight;
  ctx.strokeStyle = '#CBD5E1';
  ctx.setLineDash([12, 10]);
  ctx.beginPath();
  ctx.moveTo(padding + 52, y - 22);
  ctx.lineTo(width - padding - 52, y - 22);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#374151';
  ctx.font = '900 32px Prompt, Sarabun, sans-serif';
  ctx.fillText('ยอดรวมสินค้า', padding + 64, y + 46);
  ctx.fillStyle = '#F97316';
  ctx.font = '900 48px Prompt, Sarabun, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(fmt(result.total), width - padding - 64, y + 50);
  ctx.textAlign = 'left';

  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error('Cannot create image file.'));
    }, 'image/png');
  });
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

export default PricingResult;
