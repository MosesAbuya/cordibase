const fs = require('fs');

let file = 'apps/web/src/app/dashboard/emailing/compose/page.tsx';
let content = fs.readFileSync(file, 'utf-8');

// Remove the old attachment picker
content = content.replace(
  `<div className="pb-4">
                <AttachmentPicker 
                  attachments={formData.attachments}
                  onChange={(att) => setFormData({ ...formData, attachments: att })}
                />
              </div>`,
  ''
);

// Inject it below the ReactQuill div
const replaceTarget = `</ReactQuill>
              </div>
            </div>`;
            
if (content.includes(`onChange={(val) => setFormData({ ...formData, html: val })}`)) {
  // It's a bit tricky to replace exactly after ReactQuill because of the modules block. Let's do string splitting.
  const parts = content.split('<ReactQuill');
  const tail = parts[1].split('</div>\n          </form>');
  
  // Actually, let's use a simpler replace
  content = content.replace(
    '</form>',
    `<div className="mt-4 pt-4 border-t border-[#EAECF0] dark:border-slate-700">
                <label className="block text-sm font-medium text-[#344054] dark:text-slate-300 mb-2">Attachments</label>
                <AttachmentPicker 
                  attachments={formData.attachments}
                  onChange={(att) => setFormData({ ...formData, attachments: att })}
                />
              </div>
          </form>`
  );
  fs.writeFileSync(file, content);
  console.log("Moved AttachmentPicker in compose/page.tsx");
}
