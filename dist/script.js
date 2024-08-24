function CreateIndex() {
    const toc = document.getElementById("toc");
    const headers = document.querySelectorAll("h1, h2");

    let currentUl = toc;
    const ulStack = [currentUl];
    let previousLevel = 1;

    headers.forEach((header, index) => {
        const id = `header-${index}`;
        header.id = id;

        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = `#${id}`;
        a.textContent = header.textContent;
        li.appendChild(a);

        const level = parseInt(header.tagName.substring(1));
        if (level > previousLevel) {
            // ネストを増やす
            const newUl = document.createElement("ul");
            ulStack[ulStack.length - 1].appendChild(newUl);
            ulStack.push(newUl);
        } else if (level < previousLevel) {
            // ネストを下げる
            ulStack.pop();
        }
        currentUl = ulStack[ulStack.length - 1];
        currentUl.appendChild(li);

        previousLevel = level;
    });
}