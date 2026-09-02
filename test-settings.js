fetch("http://localhost:3000/api/emailing/settings", {
  method: "PUT",
  headers: { "Content-Type": "application/json", "x-org-id": "org_1" },
  body: JSON.stringify({
    defaultSignatureHtml: "<p>Test signature</p>"
  })
}).then(r => r.json()).then(console.log).catch(console.error);
