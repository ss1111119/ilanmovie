// 定義LINE Notify的Token
var token = "你的權杖"; // 替換為您的LINE Notify Token

function calculateDifferencesAndNotify() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("日新戲院");
  var range = sheet.getDataRange();
  var values = range.getValues();

  if (values.length > 1) {
    for (var i = 1; i < values.length; i++) {
      var row = values[i];
      if (!row[0].trim()) continue; // 如果電影名稱不存在或為空，跳過這次循環

      var imageUrl = row[1].startsWith('http') ? row[1] : `https://www.ilanmovie.com${row[1]}`; // 確保圖片URL是完整的
      
      var message = '\n'+'本周末羅東上映電影\n';
      
      // 根據行號添加不同的標題
      message += i >= 9 ? "日新戲院統一廳\n" : "日新戲院\n";
      
      // 累積消息內容
      message += '電影名稱：' + row[0] + '\n' +
                 '放映時間：' + '\n'+
                  (row[2] || '無') + '\n' +
                  (row[3] || '無') + '\n' +
                  (row[4] || '無') + '\n\n'; // 假設放映時間在第五列

      // 發送LINE通知
      sendLineWithImage(message, token, imageUrl);

      // 假設每條消息之間需要一些延遲以避免速率限制
      Utilities.sleep(1000); // 延遲1秒
    }
  } else {
    var message = '本週沒有播放電影。';
    sendLine(message, token); // 發送沒有電影的通知
  }
}

function sendLineWithImage(message, token, imageUrl) {
  UrlFetchApp.fetch('https://notify-api.line.me/api/notify', {
    'method': 'post',
    'headers': {
      'Authorization': 'Bearer ' + token
    },
    'payload': {
      'message': message,
      'imageThumbnail': imageUrl,
      'imageFullsize': imageUrl
    },
    'muteHttpExceptions': true
  });
}

function sendLine(message, token) {
  // 用於不包含圖片的通知
  UrlFetchApp.fetch('https://notify-api.line.me/api/notify', {
    'method': 'post',
    'headers': {
      'Authorization': 'Bearer ' + token
    },
    'payload': {
      'message': message,
    },
    'muteHttpExceptions': true
  });
}
