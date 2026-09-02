with open('apps/web/src/app/select-organization/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

import re

# We know the two buttons are for 'business' and 'personal' and they have broken className attributes.
# Let's just fix them directly.
# The classNames got totally corrupted by PowerShell string interpolation stripping the backticks and variable names.

replacement1 = '''className={"flex flex-col items-center justify-center p-4 rounded-xl border transition-all " + (orgType === 'business' ? 'bg-white border-thread shadow-sm text-thread ring-1 ring-thread/20' : 'bg-transparent border-ink/10 text-ink/60 hover:bg-ink/5')}'''

replacement2 = '''className={"flex flex-col items-center justify-center p-4 rounded-xl border transition-all " + (orgType === 'personal' ? 'bg-white border-thread shadow-sm text-thread ring-1 ring-thread/20' : 'bg-transparent border-ink/10 text-ink/60 hover:bg-ink/5')}'''

# Instead of regex, since the content might be weirdly formatted, let's just do a manual replace of the broken block
broken_button_block = '''            <div>
              <label className="block text-sm font-medium text-ink mb-2">Account Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setOrgType('business')}'''
                  
# Wait, let's just use Python regex to replace the entire grid-cols-2 div
# Because the broken string could literally be anything.

start_str = '<label className="block text-sm font-medium text-ink mb-2">Account Type</label>'
end_str = '<label className="block text-sm font-medium text-ink mb-2">Workspace Name</label>'

fixed_middle = '''
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setOrgType('business')}
                  className={"flex flex-col items-center justify-center p-4 rounded-xl border transition-all " + (orgType === 'business' ? 'bg-white border-thread shadow-sm text-thread ring-1 ring-thread/20' : 'bg-transparent border-ink/10 text-ink/60 hover:bg-ink/5')}
                >
                  <Briefcase size={24} className="mb-2" />
                  <span className="text-sm font-semibold">Business</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOrgType('personal')}
                  className={"flex flex-col items-center justify-center p-4 rounded-xl border transition-all " + (orgType === 'personal' ? 'bg-white border-thread shadow-sm text-thread ring-1 ring-thread/20' : 'bg-transparent border-ink/10 text-ink/60 hover:bg-ink/5')}
                >
                  <User size={24} className="mb-2" />
                  <span className="text-sm font-semibold">Personal</span>
                </button>
              </div>
            </div>

            <div>
              '''

new_content = content[:content.find(start_str) + len(start_str)] + fixed_middle + content[content.find(end_str):]

with open('apps/web/src/app/select-organization/page.tsx', 'w', encoding='utf-8') as f:
    f.write(new_content)
