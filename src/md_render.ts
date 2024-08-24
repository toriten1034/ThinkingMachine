class LineManage {
    private lines: string[]; 
    private currentIndex: number; 

    constructor(text: string) {
        this.lines = text.split(/\r?\n/);
        this.currentIndex = 0;
    }

    getLine(): string  {
        return this.lines[this.currentIndex];
        
    }

    next(): boolean {
        if (this.currentIndex < this.lines.length) {
            this.currentIndex++;
            return true
        } else {
            return false;
        }
    }

    isLast(): boolean {
        console.log(this.currentIndex);
        return this.currentIndex >= this.lines.length;
    }
}

function markup(rawTxt: string): string {
    const replaceMarkdown = (text: string, markdown: string, htmlTag: string): string => {
        let count = (text.match(new RegExp(markdown.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g')) || []).length;
    

        let currentCount = 0;
        const escapedMarkdown = markdown.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'); 
        const regex = new RegExp(escapedMarkdown, 'g'); 
        return text.replace(regex, () => {
            currentCount++;
            if (count % 2 === 1 && currentCount === count) {
                return markdown;
            }
            return currentCount % 2 === 1 ? `<${htmlTag}>` : `</${htmlTag}>`;
        });
    };

    let formattedText = rawTxt;
    formattedText = replaceMarkdown(formattedText, '**', 'b'); // Bold
    formattedText = replaceMarkdown(formattedText, '*', 'i');  // Italic
    formattedText = replaceMarkdown(formattedText, '~', 's');  // break

    const markdownMdLinkWithTitleRegex = /\[([^\]]+)\]\(([^)]+\.md)\s+"([^"]+)"\)/g;
    const markdownMdLinkWithoutTitleRegex = /\[([^\]]+)\]\(([^)]+\.md)\)/g;
    formattedText = formattedText.replace(markdownMdLinkWithTitleRegex, '<a href="main.html?mdname=$2" title="$3">$1</a>');
    formattedText = formattedText.replace(markdownMdLinkWithoutTitleRegex, '<a href="main.html?mdname=$2">$1</a>');

    const markdownLinkWithTitleRegex = /\[([^\]]+)\]\(([^)]+)\s+"([^"]+)"\)/g;
    const markdownLinkWithoutTitleRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    formattedText = formattedText.replace(markdownLinkWithTitleRegex, '<a href="$2" title="$3">$1</a>');
    formattedText = formattedText.replace(markdownLinkWithoutTitleRegex, '<a href="$2">$1</a>');


    return formattedText;
}

function md2html(md_text: string, contentBody:HTMLElement) {
    const matches = md_text.match(new RegExp('```', 'g'));
    const count =  matches ? matches.length : 0
    
    const blockParts =  md_text.split('```');

    
    for(let i = 0; i < blockParts.length; i++){
        if(i % 2 == 1){
            console.log(`odd Part ${i}: ${blockParts[i]}`);
            const preTag = document.createElement('pre');
            const codeElement = document.createElement('code');

            let codeText =  blockParts[i];
            const lines = codeText.split('\n');

            console.log(`fist line ${codeText}`);
            const languageName = lines[0];
            codeText = lines.slice(1).join("\n");
             
            codeElement.textContent = `${codeText}`;
            console.log(codeElement.textContent);
            codeElement.className = `language-${languageName} `;
            preTag.appendChild(codeElement);
            contentBody.appendChild(preTag);
        }else{
            blockProcess(contentBody,blockParts[i]);
        }
    }
}



function header(contentBody:HTMLElement, lineManager: LineManage){
    let headLine = lineManager.getLine();
    lineManager.next();
    const match = headLine.match( /^(#+) +/);
    let cnt =  match ? match[1].length : 0;
    const headerTag = document.createElement(`h${cnt}`);
    headerTag.innerHTML = markup(headLine.replace( /^(#+) +/, ''));
    contentBody.appendChild(headerTag);
}

function table(contentBody:HTMLElement, lineManager: LineManage){
    let firstLine = lineManager.getLine();
    lineManager.next();
    let secondLine = lineManager.getLine();
    lineManager.next();
    if(lineType(firstLine) == LineType.TABLE_CONTENT && lineType(secondLine) == LineType.TABLE_BORDER){
        const tableTag = document.createElement('table');

        const theadTag = document.createElement('thead');
        const headerTrTag  = document.createElement('tr');
        
        const headList = firstLine.split('|');
        for(let i = 1; i < headList.length-1; i++){
            const tdTag = document.createElement('td');
            tdTag.innerHTML = markup(headList[i]);
            console.log("tdTag :",tdTag);
            headerTrTag.appendChild(tdTag);
        }
        theadTag.appendChild(headerTrTag);
        tableTag.appendChild(theadTag);
        
        while(lineType(lineManager.getLine()) == LineType.TABLE_CONTENT){
            const currentLine = lineManager.getLine();
            lineManager.next();
            const tbodyTag = document.createElement('tbody');
            const bodyList = currentLine.split('|');
            const bodyTrTag  = document.createElement('tr');

            for(let i = 1; i < bodyList.length-1; i++){
                const  tdTag = document.createElement('td');
                tdTag.innerHTML = markup(bodyList[i]);
                bodyTrTag.appendChild(tdTag);
            }
            tbodyTag.appendChild(bodyTrTag);
            tableTag.appendChild(tbodyTag);
        }

        contentBody.appendChild(tableTag);
    }else{

    }
}

function paragraph(contentBody:HTMLElement,lineManager: LineManage, textString: string){
    let textList: Array<string> = [];
 
    if(textString != ""){
        textList.push(textString);
    }

    while(lineManager.isLast() == false && lineType(lineManager.getLine()) == LineType.PARAGRAPH ){
        textList.push(lineManager.getLine());
        lineManager.next();
    }
    const paragraphTag = document.createElement('p')
    
    const markupText = textList.map(line => markup(line)).join('<br>');
    paragraphTag.innerHTML = markupText;
    contentBody.appendChild(paragraphTag);
}

enum LineType{
    HEADER,
    PARAGRAPH,
    ITEMIZE,
    ENUMERATE,
    BLANKLINE,
    TABLE_BORDER,
    TABLE_CONTENT,
    IMAGE,
    HLINE
}

function lineType(lineText: string):LineType{
    console.log(lineText);
    const itemizeRegex = /^\s*-\s.*$/;
    const enumRegex = /^\s*\d+\.\s.*$/;
    const tableBorderRegrex = /^\|(-{2,}\|)+$/;
    const tableContentRegrex = /^\|(.*\|)+$/;
    const blankLineRegrex = /^\s*$/;
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;

    if(lineText[0] == "#"){
        return LineType.HEADER;
    }else if(itemizeRegex.test(lineText)){
        return LineType.ITEMIZE;
    }else if(enumRegex.test(lineText)){
        return LineType.ENUMERATE;
    }else if(tableBorderRegrex.test(lineText)){
        return LineType.TABLE_BORDER;
    }else if(tableContentRegrex.test(lineText)){
        return LineType.TABLE_CONTENT;
    }else if(blankLineRegrex.test(lineText)){
        return LineType.BLANKLINE;
    }else if(imageRegex.test(lineText)){
        return LineType.IMAGE;
    }if(lineText == "***" || lineText == "---"|| lineText == "___"){
        return LineType.HLINE;
    }else{
        return LineType.PARAGRAPH;
    }
}


function itemize(contentBody:HTMLElement, lineManager: LineManage, parentNestLevel: number){
    const checkboxHtml = (text: string): string => {
        const trimmedText = text.replace(/^\s*/, '');
        if (trimmedText.startsWith("[x]")) {
            return `<li><input type="checkbox" checked>${trimmedText.slice(3).trim()}</li>`;
        } else if (trimmedText.startsWith("[ ]")) {
            return `<li><input type="checkbox">${trimmedText.slice(3).trim()}</li>`;
        } else {
            return `<li>${trimmedText}</li>`;
        }
    };


    let ulTag = document.createElement('ul');
    let firstLiTag = document.createElement('li');
    
    firstLiTag.innerHTML = checkboxHtml(markup(lineManager.getLine().split("-")[1]));
    const match = lineManager.getLine().match(/^(\s*)/);
    ulTag.appendChild(firstLiTag);
    console.log("firstLi",ulTag);


    let currentNestLevel = match ? match[1].length : 0;

    lineManager.next();

    while(lineManager.isLast() == false){
        if(lineType(lineManager.getLine()) == LineType.ITEMIZE){
            const match = lineManager.getLine().match(/^(\s*)/);
            let nestLevel = match ? match[1].length : 0;        
            nestLevel = Math.floor(nestLevel/2)

            if(nestLevel > currentNestLevel){
                itemize(ulTag, lineManager,0);
            }else if(nestLevel < currentNestLevel){
                contentBody.appendChild(ulTag)
                return;
            }else {
                let liTag = document.createElement('li');
                liTag.innerHTML = checkboxHtml(markup(lineManager.getLine().split("-")[1]));
                ulTag.appendChild(liTag);
                console.log(ulTag);
                const match = lineManager.getLine().match(/^(\s*)/);
                lineManager.next();
            }
        }else if(lineType(lineManager.getLine()) == LineType.ENUMERATE){
            enumerate(ulTag, lineManager,0);        
        }else{
            contentBody.appendChild(ulTag);
            return;
        }
    }
    contentBody.appendChild(ulTag);
}


function enumerate(contentBody:HTMLElement, lineManager: LineManage, parentNestLevel: number){

    let ulTag = document.createElement('ol');
    let firstLiTag = document.createElement('li');
    
    const matchContent = lineManager.getLine().match(/(\d+)\.\s*(.*)/);
    if(matchContent){
        firstLiTag.innerHTML = markup(matchContent[2]);    
    }
            
    const match = lineManager.getLine().match(/^(\s*)/);
    ulTag.appendChild(firstLiTag);
    console.log("firstLi",ulTag);


    let currentNestLevel = match ? match[1].length : 0;

    lineManager.next();

    while(lineManager.isLast() == false){
        if(lineType(lineManager.getLine()) == LineType.ENUMERATE){
            const match = lineManager.getLine().match(/^(\s*)/);
            let nestLevel = match ? match[1].length : 0;        
            nestLevel = Math.floor(nestLevel/2)

            if(nestLevel > currentNestLevel){
                itemize(ulTag, lineManager,0);
            }else if(nestLevel < currentNestLevel){
                contentBody.appendChild(ulTag);
                return;
            }else {
                let liTag = document.createElement('li');
                const matchContent = lineManager.getLine().match(/(\d+)\.\s*(.*)/);
                if(matchContent){
                    liTag.innerHTML = markup(matchContent[2]);    
                }
                ulTag.appendChild(liTag);
                console.log(ulTag);
                const match = lineManager.getLine().match(/^(\s*)/);
                lineManager.next();
            }
        }else if(lineType(lineManager.getLine()) == LineType.ITEMIZE){
            itemize(ulTag, lineManager,0);        
        }else{
            contentBody.appendChild(ulTag);
            return;
        }
    }
    contentBody.appendChild(ulTag);
}

function imageBlock(contentBody: HTMLElement, lineManager: LineManage) {
    let imageText = lineManager.getLine();
    lineManager.next();

    const imageWithTitleRegex = /!\[([^\]]*)\]\(([^)]+)\s+"([^"]+)"\)/;
    const imageWithoutTitleRegex = /!\[([^\]]*)\]\(([^)]+)\)/;

    const matchTitle = imageText.match(imageWithTitleRegex);

    const brTag = document.createElement('br');

    if (matchTitle) {
        const altText = matchTitle[1];
        const imageUrl = matchTitle[2];
        const title = matchTitle[3];

        const imgTag = document.createElement('img');
        if(imageUrl.startsWith("http") ){
            imgTag.src = imageUrl;
        }else{
            imgTag.src = "markdown/"+imageUrl;
        }
        imgTag.alt = altText;
        imgTag.title = title; 
        contentBody.appendChild(imgTag);

    } else {
        const matchNoTitle = imageText.match(imageWithoutTitleRegex);

        if (matchNoTitle) {
            const altText = matchNoTitle[1];
            const imageUrl = matchNoTitle[2];

            const imgTag = document.createElement('img');
            if(imageUrl.startsWith("http") ){
                imgTag.src = imageUrl;
            }else{
                imgTag.src = "markdown/"+imageUrl;
            }
            imgTag.alt = altText;

            contentBody.appendChild(imgTag);
        }
    }
    contentBody.appendChild(brTag);
}

function horizonalLine(contentBody:HTMLElement, lineManager: LineManage){
    let hrTag = document.createElement('hr');
    lineManager.next();
    contentBody.appendChild(hrTag);
}

function blockProcess(contentBody:HTMLElement, blockText: string){
    let lineManager = new LineManage(blockText);
    while(lineManager.isLast() == false){
        const currentLine = lineType(lineManager.getLine());
        if(currentLine == LineType.HEADER){
            header(contentBody, lineManager);
        }else if(currentLine == LineType.TABLE_CONTENT){
            table(contentBody, lineManager);
        }else if(currentLine == LineType.ITEMIZE){
            itemize(contentBody, lineManager,0);
        }else if(currentLine == LineType.ENUMERATE){
            enumerate(contentBody, lineManager,0);
        }else if(currentLine == LineType.PARAGRAPH){
            paragraph(contentBody, lineManager,"");
        }else if(currentLine == LineType.IMAGE){
            imageBlock(contentBody, lineManager);
        }else if(currentLine == LineType.HLINE){
            horizonalLine(contentBody, lineManager);
        }else{
            lineManager.next();
        }
    }

}
