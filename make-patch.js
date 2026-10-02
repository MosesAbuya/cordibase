const fs = require('fs');
let c = fs.readFileSync('apps/service-accounting/src/routes.ts', 'utf8');

c = c.replace(/const setData: any = \{\};\s+if \(body\.status !== undefined\) setData\.status = body\.status;\s+if \(body\.description !== undefined\) setData\.description = body\.description;\s+if \(body\.notes !== undefined\) setData\.notes = body\.notes;/, 
`const setData: any = {};
    if (body.status !== undefined) setData.status = body.status;
    if (body.description !== undefined) setData.description = body.description;
    if (body.notes !== undefined) setData.notes = body.notes;
    if (body.type !== undefined) setData.type = body.type;
    if (body.amount !== undefined) setData.amount = body.amount;
    if (body.currency !== undefined) setData.currency = body.currency;
    if (body.categoryId !== undefined) setData.categoryId = body.categoryId === '' ? null : body.categoryId;
    if (body.vendorOrSource !== undefined) setData.vendorOrSource = body.vendorOrSource;
    if (body.date !== undefined) setData.date = new Date(body.date);`);

fs.writeFileSync('apps/service-accounting/src/routes.ts', c);
