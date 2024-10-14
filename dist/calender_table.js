"use strict";
const topicColors = {
    "Digital": "#737373",
    "Analog": "#C7561E",
    "Device": "#536CA6",
    "BroadScope": "#65AD89",
    "Design": "#AD2D2D",
    "Manufacturing": "#972DA9",
    "Transducer": "#E0C240", // WhiteSmoke
};
async function fetchData() {
    const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets/1Yk5buzpmd9QBQdL5xf1HB6ozU6zmXko6-ZbdwU8Ty54/values/EventTable?key=AIzaSyC-UgJmYBZ8tYGuBhTefFykSCqR4nemueY');
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
            conferenceType: event["ConferenceType"],
            deadline: event["Deadline"],
            mainTopic: event["MainTopic"],
            acceptanceNotification: event["Acceptance Notification"],
            cfp: event["CFP"],
            link: event["Link"],
            topics: event["Topics"]
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
        const link = document.createElement('a');
        link.textContent = event.conferenceName;
        link.href = event.link;
        nameCell.appendChild(link);
        row.appendChild(nameCell);
        // 研究分野のセルを作成
        const topicCell = document.createElement('td');
        topicCell.style.color = "#FFFFFF";
        topicCell.style.backgroundColor = topicColors[event.conferenceType] || "#FFFFFF";
        // テキスト部分にポップアップを適用するためのコンテナを作成
        const popupContainer = document.createElement('div');
        popupContainer.classList.add('popup');
        // テキスト（Deviceなどの内容）を作成
        const textNode = (event.mainTopic) ? document.createTextNode(event.mainTopic) : document.createTextNode(event.conferenceType);
        // ポップアップのテキスト（event.topics）を作成
        const popupText = document.createElement('div');
        popupText.textContent = event.topics; // event.topics の内容をポップアップに表示
        popupText.classList.add('popuptext');
        // popupContainerにテキストとポップアップを追加
        popupContainer.appendChild(textNode);
        popupContainer.appendChild(popupText);
        // topicCellにpopupContainerを追加
        topicCell.appendChild(popupContainer);
        // 行にセルを追加
        row.appendChild(topicCell);
        // 投稿締め切り
        // 今日の日付を取得
        const today = new Date();
        const tommorow = new Date();
        tommorow.setDate(tommorow.getDate() - 1);
        const seven_days_before = new Date();
        seven_days_before.setDate(seven_days_before.getDate() + 7);
        const deadlineDate = new Date(event.deadline);
        // 締め切りまでの時間（ミリ秒）を取得
        const timeRemaining = deadlineDate.getTime() - today.getTime();
        const daysRemaining = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
        // 締め切りセルを作成
        const deadlineCell = document.createElement('td');
        deadlineCell.textContent = event.deadline;
        // スタイル変更のロジック
        if (deadlineDate.getTime() < tommorow.getTime()) {
            // 今日+1日より後の場合、灰色で打ち消し線
            deadlineCell.style.color = 'gray';
            deadlineCell.style.textDecoration = 'line-through';
        }
        else if (deadlineDate.getTime() < seven_days_before.getTime()) {
            // 今日-7日より後の場合、赤字で表示し、マウスオーバーで締め切りまでの時間を表示
            deadlineCell.style.color = 'red';
        }
        else {
            // それ以外は黒字で表示し、マウスオーバーで締め切りまでの時間を表示
            deadlineCell.style.color = 'black';
        }
        // 行にセルを追加
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
    if (columnIndex == 2) {
        rows.sort((a, b) => {
            const aText = a.cells[columnIndex].style.backgroundColor || "";
            const bText = b.cells[columnIndex].style.backgroundColor || "";
            if (aText < bText)
                return order === 'asc' ? -1 : 1;
            if (aText > bText)
                return order === 'asc' ? 1 : -1;
            return 0;
        });
    }
    else {
        rows.sort((a, b) => {
            const aText = a.cells[columnIndex].textContent || "";
            const bText = b.cells[columnIndex].textContent || "";
            if (aText < bText)
                return order === 'asc' ? -1 : 1;
            if (aText > bText)
                return order === 'asc' ? 1 : -1;
            return 0;
        });
    }
    // ソート後の行をテーブルに追加
    rows.forEach(row => tbody.appendChild(row));
}
(async () => {
    const events = await fetchData();
    createTable(events);
})();
// テーブルをクリアする関数
function clearTable() {
    const tableContainer = document.getElementById('tableContainer');
    if (tableContainer) {
        tableContainer.innerHTML = ''; // テーブルコンテナ内のHTMLをクリア
    }
}
// フィルタリングされたイベントを表示する関数
function filterEvents(events, filterText) {
    const filteredEvents = events.filter(event => {
        // フィルタテキストが topics に含まれるかチェック
        return event.topics.toLowerCase().includes(filterText.toLowerCase());
    });
    // テーブルを再描画
    clearTable();
    createTable(filteredEvents);
}
// イベントを作成し、フィルタリングのためにリスナーを追加
(async () => {
    const events = await fetchData();
    // フィルタ入力に対するリスナーを設定
    const filterInput = document.getElementById('topicFilter');
    filterInput.addEventListener('input', () => {
        const filterText = filterInput.value;
        filterEvents(events, filterText);
    });
})();
