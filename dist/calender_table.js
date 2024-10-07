"use strict";
const topicColors = {
    "デジタル": "#D81B60",
    "アナログ": "#C0CA33",
    "デバイス": "#F4511E",
    "設計": "#039BE5",
    "総合": "#B39DDB", // WhiteSmoke
};
async function fetchData() {
    const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets/1d0fHb8z1cdq0WVVsFRFrqfx2fMK9dBNdPWeWa7VyzEU/values/Events?key=AIzaSyC-UgJmYBZ8tYGuBhTefFykSCqR4nemueY');
    const data = await response.json();
    const values = data.values;
    const headers = values[0];
    const events = [];
    for (let i = 1; i < values.length; i++) {
        const event = {};
        for (let j = 0; j < headers.length; j++) {
            const key = headers[j];
            event[key] = values[i][j] || "";
        }
        events.push({
            start: event["Start"],
            end: event["End"],
            conferenceName: event["ConferenceName"],
            topic: event["Topic"],
            deadline: event["Deadline"],
            acceptanceNotification: event["Acceptance Notification"],
            cfp: event["CFP"],
        });
    }
    return events;
}
function createTable(events) {
    const table = document.createElement('table');
    table.id = "eventsTable";
    // ヘッダーの作成
    const headers = ["開始日〜終了日", "学会名", "研究分野", "投稿締め切り", "採択通知", "CFPへのリンク"];
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headers.forEach((headerText, index) => {
        const th = document.createElement('th');
        const headerDiv = document.createElement('div');
        headerDiv.style.display = 'flex';
        headerDiv.style.alignItems = 'center';
        const headerLabel = document.createElement('span');
        headerLabel.textContent = headerText;
        headerDiv.appendChild(headerLabel);
        // ソート機能の追加（CFPへのリンク以外）
        if (headerText !== "CFPへのリンク") {
            const sortButtonsDiv = document.createElement('div');
            sortButtonsDiv.style.display = 'flex';
            sortButtonsDiv.style.flexDirection = 'column';
            sortButtonsDiv.style.marginLeft = '5px';
            // 昇順ボタン
            const ascButton = document.createElement('button');
            ascButton.textContent = "▲";
            ascButton.style.padding = '0';
            ascButton.style.border = 'none';
            ascButton.style.background = 'none';
            ascButton.style.cursor = 'pointer';
            ascButton.style.lineHeight = '1';
            ascButton.addEventListener('click', () => sortTable(index, 'asc'));
            sortButtonsDiv.appendChild(ascButton);
            // 降順ボタン
            const descButton = document.createElement('button');
            descButton.textContent = "▼";
            descButton.style.padding = '0';
            descButton.style.border = 'none';
            descButton.style.background = 'none';
            descButton.style.cursor = 'pointer';
            descButton.style.lineHeight = '1';
            descButton.addEventListener('click', () => sortTable(index, 'desc'));
            sortButtonsDiv.appendChild(descButton);
            headerDiv.appendChild(sortButtonsDiv);
        }
        th.appendChild(headerDiv);
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);
    // ボディの作成
    const tbody = document.createElement('tbody');
    events.forEach(event => {
        const row = document.createElement('tr');
        // 開始日〜終了日
        const dateCell = document.createElement('td');
        dateCell.textContent = `${event.start}〜${event.end}`;
        row.appendChild(dateCell);
        // 学会名
        const nameCell = document.createElement('td');
        nameCell.textContent = event.conferenceName;
        row.appendChild(nameCell);
        // 研究分野
        const topicCell = document.createElement('td');
        topicCell.textContent = event.topic;
        // 「研究分野」のセルのみ色付け
        topicCell.style.backgroundColor = topicColors[event.topic] || "#FFFFFF";
        row.appendChild(topicCell);
        // 投稿締め切り
        const deadlineCell = document.createElement('td');
        deadlineCell.textContent = event.deadline;
        row.appendChild(deadlineCell);
        // 採択通知
        const notificationCell = document.createElement('td');
        notificationCell.textContent = event.acceptanceNotification;
        row.appendChild(notificationCell);
        // CFPへのリンク
        const cfpCell = document.createElement('td');
        const linkButton = document.createElement('button');
        linkButton.textContent = "CFP";
        linkButton.addEventListener('click', () => {
            window.open(event.cfp, '_blank');
        });
        cfpCell.appendChild(linkButton);
        row.appendChild(cfpCell);
        tbody.appendChild(row);
    });
    table.appendChild(tbody);
    document.getElementById('tableContainer').appendChild(table);
}
function sortTable(columnIndex, order) {
    const table = document.getElementById('eventsTable');
    const tbody = table.tBodies[0];
    const rows = Array.from(tbody.rows);
    rows.sort((a, b) => {
        const aText = a.cells[columnIndex].textContent || "";
        const bText = b.cells[columnIndex].textContent || "";
        if (aText < bText)
            return order === 'asc' ? -1 : 1;
        if (aText > bText)
            return order === 'asc' ? 1 : -1;
        return 0;
    });
    // ソート後の行をテーブルに追加
    rows.forEach(row => tbody.appendChild(row));
}
function createLegend() {
    const legendContainer = document.getElementById('topicLegend');
    for (const topic in topicColors) {
        const listItem = document.createElement('li');
        const colorBox = document.createElement('span');
        // ColorBoxのスタイル設定
        colorBox.style.display = 'inline-block';
        colorBox.style.width = '80px'; // 必要に応じて調整
        colorBox.style.height = '20px';
        colorBox.style.backgroundColor = topicColors[topic];
        colorBox.style.border = '1px solid black';
        colorBox.style.marginRight = '8px';
        colorBox.style.textAlign = 'center';
        colorBox.style.lineHeight = '20px';
        colorBox.style.color = 'white';
        colorBox.style.fontWeight = 'bold';
        // ColorBox内にテキストを追加
        colorBox.textContent = topic;
        // ColorBoxをリストアイテムに追加
        listItem.appendChild(colorBox);
        legendContainer.appendChild(listItem);
    }
}
(async () => {
    const events = await fetchData();
    createTable(events);
    createLegend();
})();
