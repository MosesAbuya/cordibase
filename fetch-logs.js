fetch("http://localhost:3000/api/emailing/logs")
  .then(res => res.text())
  .then(console.log)
  .catch(console.error);
