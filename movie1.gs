function fetchAndWriteMovieData(sheet, url, baseUrl, startRow) {
  if (!url) { // 檢查 URL 是否有效
    Logger.log("提供的 URL 無效，跳過调用。");
    return; // 如果 URL 無效，返回
  }
  Logger.log("開始调用 fetchAndWriteMovieData: URL = " + url + ", 開始行 = " + startRow); // Log at the start
  var response = UrlFetchApp.fetch(url);

  if (response.getResponseCode() == 200) {
    var content = response.getContentText();
    // Log fetching success
    Logger.log("成功獲取内容: " + url);
    
    var imgRegex = /<img class="img-responsive "[^>]*src="([^"]+)"[^>]*>/g;
    var titleRegex = /<div class="box1-body-content-title">[\s\S]*?<div style="display:inline;">([\s\S]*?)<\/div>/g;
    var scheduleRegex = /<table class="table table-condensed M-T-T ">[\s\S]*?<\/tbody>/g;

    var titles = [], imgUrls = [];
    var match;

    while ((match = imgRegex.exec(content)) !== null) {
      var imgUrl = match[1];
      if (!imgUrl.startsWith('http://') && !imgUrl.startsWith('https://')) {
        imgUrl = baseUrl + imgUrl;
      }
      imgUrls.push(imgUrl);
    }

    var rowData = [];
    while ((match = titleRegex.exec(content)) !== null) {
      var title = match[1].trim();
      titles.push(title); // Assuming you want to log each title

      var scheduleContent = scheduleRegex.exec(content)[0];
      var dateTimeRegex = /<td>(\d+\/\d+)<\/td>\s*<td>\((.*?)\)<\/td>\s*<td>(.*?)<\/td>/g;
      var times = [];
      var timeMatch;
      
      while ((timeMatch = dateTimeRegex.exec(scheduleContent)) !== null) {
        var date = timeMatch[1];
        var day = timeMatch[2];
        var time = timeMatch[3].replace(/&nbsp;/g, ' ');
        var formattedDateTime = date + ' (' + day + ') ' + time;
        times.push(formattedDateTime);
      }

      // Ensure we don't have more times than columns
      while(times.length < 6) {
        times.push('');
      }

      rowData.push([title, imgUrls.shift()].concat(times));
      Logger.log("處理电影: " + title + ", 時間: " + times.join(", ")); // Log each movie processing
    }

    // Append data to the sheet starting from the specified row
    for (var i = 0; i < rowData.length; i++, startRow++) {
      sheet.getRange(startRow, 1, 1, rowData[i].length).setValues([rowData[i]]);
      Logger.log("寫入數據到行: " + startRow); // Log data writing to the sheet
    }
  } else {
    Logger.log("無法獲取内容: " + url + ", 響應碼: " + response.getResponseCode()); // Log failure
  }
}

function fetchMovieDataAndWriteToSheet() {
  Logger.log("開始 fetchMovieDataAndWriteToSheet");
  var baseUrl = 'https://www.ilanmovie.com/';
  var sheetId = '你的google sheet';
  var spreadsheet = SpreadsheetApp.openById(sheetId);
  var sheetName = '日新戲院';
  var sheet = spreadsheet.getSheetByName(sheetName) || spreadsheet.insertSheet(sheetName);

  sheet.clear();
  var titlesRow = ["電影名稱", "圖片URL", "時間1", "時間2", "時間3", "時間4", "時間5", "時間6"];
  sheet.appendRow(titlesRow);
  
  Logger.log("調用第一個URL");
  fetchAndWriteMovieData(sheet, baseUrl + 'index2.php', baseUrl, 2);
  Logger.log("調用第二個URL");
  fetchAndWriteMovieData(sheet, baseUrl + 'index3.php', baseUrl, 10);
  Logger.log("完成 fetchMovieDataAndWriteToSheet");

  // 在所有操作完成後，觸發 calculateDifferencesAndNotify 函數
  calculateDifferencesAndNotify();
}
