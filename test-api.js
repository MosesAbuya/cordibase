async function testApi() {
    try {
        const res = await fetch("http://localhost:3002/api/crm/dashboard/summary", {
            headers: { "x-org-id": "1bjfjMklsluxkUkBLYrFoSnFY7DpohVG" }
        });
        console.log("Status:", res.status);
        console.log("Body:", await res.text());
    } catch (e) {
        console.error(e);
    }
}
testApi();
