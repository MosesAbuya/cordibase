const fs = require('fs');
const path = require('path');
const src = 'apps/web/src/app/dashboard/accounting/tracker/new/page.tsx';
const destDir = 'apps/web/src/app/dashboard/accounting/tracker/[id]/edit';
fs.mkdirSync(destDir, { recursive: true });
let c = fs.readFileSync(src, 'utf8');

c = c.replace(
  'export default function AddTransaction() {',
  `import { useParams } from 'next/navigation';
export default function EditTransaction() {
  const params = useParams();
  const id = params?.id;
  const isEdit = !!id && id !== 'new';`
);

c = c.replace(
  'const [loading, setLoading] = useState(false);',
  `const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      fetch(\`/api/accounting/transactions/\${id}\`)
        .then(res => res.json())
        .then(data => {
          if (data) {
            const t = data;
            setForm({
              type: t.type || "expense",
              date: t.date ? new Date(t.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
              amount: t.amount?.toString() || "",
              currency: t.currency || "KES",
              categoryId: t.categoryId || "",
              description: t.description || "",
              vendorOrSource: t.vendorOrSource || "",
              notes: t.notes || "",
              status: t.status || "paid",
              aiExtracted: t.aiExtracted || false
            });
            // If there's an activeTab state for expense/income toggle, you might set it here too if needed
          }
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);`
);

c = c.replace('method: "POST"', 'method: isEdit ? "PATCH" : "POST"');
c = c.replace(
  'fetch("/api/accounting/transactions"',
  'fetch(isEdit ? `/api/accounting/transactions/${id}` : "/api/accounting/transactions"'
);
c = c.replace('{loading ? "Saving..." : "Save Transaction"}', '{loading ? "Saving..." : isEdit ? "Update Transaction" : "Save Transaction"}');
c = c.replace('>Add Transaction<', '>{isEdit ? "Edit Transaction" : "Add Transaction"}<');

fs.writeFileSync(path.join(destDir, 'page.tsx'), c);
console.log('Edit page created');
