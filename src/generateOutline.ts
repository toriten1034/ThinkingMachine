function CreateIndex() {
    const toc = document.getElementById("toc");
    const headers = document.querySelectorAll("h1, h2");

    if (!toc) return;

    let currentUl = toc;
    let previousLevel = 1;

    let h1_index=0,  h2_index=0; 
    headers.forEach((header, index) => {
        const prefix = header.tagName.toLowerCase() === "h1" ? "h1-" : "h2-";
        if(header.tagName.toLowerCase() == "h1"){
            h1_index +=1;
        }else if(header.tagName.toLowerCase() == "h2"){
            h2_index +=1;
        }

        const id = `${prefix}${header.tagName.toLowerCase() === "h1" ? h1_index : h2_index}`;
        header.id = id;

        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = `#${id}`;
        a.textContent = header.textContent;
        li.appendChild(a);

        const level = parseInt(header.tagName.substring(1));

        if (level > previousLevel) {
            const newUl = document.createElement("ul");
            currentUl.appendChild(newUl);
            currentUl = newUl;
        } else if (level < previousLevel) {
            currentUl = toc;  // ネストを戻す場合はtocに戻す
        }

        currentUl.appendChild(li);
        previousLevel = level;
    });
}
