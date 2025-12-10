const fs = require('fs');
try {
    const data = JSON.parse(fs.readFileSync('/tmp/toys_dump.json', 'utf8'));
    const items = data.data.items ? data.data.items : data.data;
    const toy = items.find(t => t.name.toLowerCase().includes('hover shot'));
    console.log('STOCK_QUANTITY:', toy ? toy.stockQuantity : 'TOY_NOT_FOUND');
} catch (e) {
    console.error(e);
}
;