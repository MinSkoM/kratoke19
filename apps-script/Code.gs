const SHEET_PRODUCTS = 'Products';
const SHEET_MEMBERS = 'Members';
const SHEET_ORDERS = 'Orders';
const SHEET_QUOTATION = 'Quotation';

function doGet(e) {
  try {
    const action = e.parameter.action;
    if (action === 'getProducts') return responseJSON(getProducts());
    else if (action === 'checkMember') return responseJSON(checkMember(e.parameter.lineId));
    else if (action === 'getHistory') return responseJSON(getHistory(e.parameter.lineId));

    return responseJSON({ error: 'Invalid action' });
  } catch (error) {
    return responseJSON({ error: error.message });
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    if (action === 'register') return responseJSON(registerMember(data.payload));
    else if (action === 'submitOrder') return responseJSON(submitOrder(data.payload));
    else if (action === 'submitQuotation') return responseJSON(submitQuotation(data.payload));

    return responseJSON({ error: 'Invalid action' });
  } catch (error) {
    return responseJSON({ error: error.message });
  }
}

function getProducts() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_PRODUCTS);
  const data = sheet.getDataRange().getValues();
  data.shift();

  const products = data
    .filter(row => row[0] && row[2])
    .map(row => ({
      id: row[0],
      category: row[1] || 'ทั่วไป',
      name: row[2],
      detail: row[3] || '',
      size: row[4] || '',
      thickness: row[5] || '',
      color: row[6] || '',
      weight: row[7] || '',
      unit: row[8] || 'หน่วย',
      price: row[9] || 0,
    }));

  return { status: 'success', data: products };
}

function checkMember(lineId) {
  if (!lineId) throw new Error('Missing LINE ID');
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_MEMBERS);
  const data = sheet.getDataRange().getValues();
  const memberRow = data.find(row => row[0] === lineId);

  if (memberRow) {
    return {
      status: 'success',
      isMember: true,
      data: { name: memberRow[1], address: memberRow[2], phone: memberRow[3] },
    };
  }

  return { status: 'success', isMember: false };
}

function registerMember(payload) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_MEMBERS);
  const data = sheet.getDataRange().getValues();
  const rowIndex = data.findIndex(row => row[0] === payload.lineId);

  if (rowIndex !== -1) {
    sheet.getRange(rowIndex + 1, 2, 1, 3).setValues([[payload.name, payload.address, payload.phone]]);
    return { status: 'success', message: 'Updated' };
  }

  sheet.appendRow([payload.lineId, payload.name, payload.address, payload.phone, new Date()]);
  return { status: 'success', message: 'Registered' };
}

function submitOrder(payload) {
  const sheetOrders = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_ORDERS);
  const orderId = getNextRunningId(sheetOrders, 'ORD-' + Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyMM') + '-', 4);
  const readableCart = payload.cart.map(item => {
    const specs = [item.detail, item.size, item.thickness].filter(Boolean);
    const specText = specs.length > 0 ? ` (${specs.join(', ')})` : '';
    const unit = item.unit || 'หน่วย';
    return `- [${item.id}] ${item.name}${specText} x${item.quantity} ${unit} [${item.price * item.quantity}.-]`;
  }).join('\n');

  sheetOrders.appendRow([
    orderId,
    payload.lineId,
    readableCart,
    payload.totalPrice,
    payload.shippingMethod,
    'รอคอนเฟิร์ม',
    new Date(),
    JSON.stringify(payload.cart),
  ]);

  return { status: 'success', orderId: orderId };
}

function submitQuotation(payload) {
  const sheetQuotation = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_QUOTATION);
  if (!sheetQuotation) throw new Error('Missing Quotation sheet');
  if (!payload || !Array.isArray(payload.items) || payload.items.length === 0) {
    throw new Error('Quotation has no items');
  }

  const year = Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yy');
  const quoteId = getNextRunningId(sheetQuotation, 'K' + year, 5);
  const readableItems = payload.items.map(item => {
    const specs = [item.detail, item.size, item.thickness].filter(Boolean);
    const specText = specs.length > 0 ? ` (${specs.join(', ')})` : '';
    const lineTotal = Number(item.price || 0) * Number(item.quantity || 0);
    const unit = item.unit || 'หน่วย';
    return `- [${item.id}] ${item.name}${specText} x${item.quantity} ${unit} [${lineTotal}.-]`;
  }).join('\n');

  sheetQuotation.appendRow([
    quoteId,
    readableItems,
    payload.totalPrice,
    new Date(),
  ]);

  return { status: 'success', quoteId: quoteId };
}

function getNextRunningId(sheet, prefix, digits) {
  let maxSeq = 0;
  const lastRow = sheet.getLastRow();

  if (lastRow > 1) {
    const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
    ids.forEach(value => {
      const id = String(value || '');
      if (!id.startsWith(prefix)) return;
      const seqNumber = parseInt(id.slice(prefix.length), 10);
      if (!isNaN(seqNumber) && seqNumber > maxSeq) maxSeq = seqNumber;
    });
  }

  const nextSeq = maxSeq + 1;
  return prefix + String(nextSeq).padStart(digits, '0');
}

function getHistory(lineId) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_ORDERS);
  const data = sheet.getDataRange().getValues();
  data.shift();

  const history = data
    .filter(row => row[1] === lineId)
    .map(row => ({
      orderId: row[0],
      items: (() => { try { return JSON.parse(row[7]); } catch { return row[2]; } })(),
      total: row[3],
      shippingMethod: row[4],
      status: row[5],
      date: row[6],
    }));

  return { status: 'success', data: history };
}

function responseJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
