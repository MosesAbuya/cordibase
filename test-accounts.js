fetch("http://localhost:3000/api/emailing/accounts", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "Test Account",
    fromName: "Test",
    fromEmail: "test@test.com",
    smtpHost: "smtp.gmail.com",
    smtpPort: "587",
    smtpUser: "test@test.com",
    smtpPassword: "password"
  })
}).then(r => r.json()).then(console.log).catch(console.error);
