"use strict";
async function fetchMdname(mdname) {
    try {
        if (!mdname) {
            throw new Error('Filename (mdname) is not provided in the URL');
        }
        const response = await fetch("markdown/" + mdname, {
            cache: 'no-cache'
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        return text; // 取得したテキストを返す
    }
    catch (error) {
        console.error('Failed to fetch mdname:', error);
        return ''; // エラー発生時は空文字列を返す
    }
}
async function initialize(mdname) {
    const text = await fetchMdname(mdname);
    setHeader(mdname);
    displayMdname(text); // 取得した内容を表示
}
function displayMdname(text) {
    const contentDiv = document.getElementById('mymd');
    console.log(contentDiv); // contentDivがnullでないことを確認
    if (contentDiv) {
        console.log("text is", text);
        const blocks = md2html(text, contentDiv);
        console.log(blocks);
        console.log(contentDiv);
    }
    else {
        console.error('Element with id "mymd" not found.');
    }
}
async function setHeader(filename) {
    try {
        // 変数の型チェック
        if (typeof filename !== 'string') {
            throw new TypeError("Expected a string for filename, but received " + typeof filename);
        }
        const regex = /^(.+)_([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})\.md$/;
        const match = filename.match(regex);
        console.log("Matched groups:", match);
        if (match) {
            const title = match[1];
            const year = match[2];
            const month = match[3].padStart(2, '0'); // 1桁の月を2桁にする
            const day = match[4].padStart(2, '0'); // 1桁の日を2桁にする
            // タイトル要素
            const titleElement = document.getElementById('title');
            if (titleElement) {
                titleElement.textContent = title;
            }
            else {
                console.error("Title element not found");
            }
            const headerTitleElement = document.getElementById('headerTitle');
            if (headerTitleElement) {
                headerTitleElement.textContent = title;
            }
            else {
                console.error("Title element not found");
            }
            // 年要素
            const yearElement = document.getElementById('year');
            if (yearElement) {
                yearElement.textContent = year;
            }
            else {
                console.error("Year element not found");
            }
            // 日付要素
            const dateElement = document.getElementById('date');
            if (dateElement) {
                dateElement.textContent = `${month}/${day}`;
            }
            else {
                console.error("Date element not found");
            }
        }
        else {
            throw new Error("Filename does not match the expected format");
        }
    }
    catch (error) {
        // エラーのタイプと内容を表示
        if (error instanceof TypeError) {
            console.error("TypeError: " + error.message);
        }
        else if (error instanceof Error) {
            console.error("Error: " + error.message);
        }
        else {
            console.error("Unknown error:", error);
        }
    }
}
async function GetFilename() {
    const url = new URL(window.location.href);
    // URLSearchParamsオブジェクトを作成
    const params = new URLSearchParams(url.search);
    // クエリパラメータ 'mdname' の値を取得し、nullなら空文字列を代入
    const productValue = params.get('mdname');
    let mdname = productValue ?? ''; // 'productValue' が 'null' の場合、空文字を設定する
    let x = await initialize(mdname);
    console.log(document);
}
