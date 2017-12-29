function onOpen() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var entries = [
    {
      name : "フィルマークの映画一覧取得",
      functionName : "myFunction"
    }
  ];
  sheet.addMenu("スクリプト実行", entries);
};

function myFunction () {
  var sheetData = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  var userId = sheetData.getRange(1, 2).getValue();

  var pageLenght = getPageCount(userId);

  var index = 2;
  for(var page = 1; page <= pageLenght; ++page)
  {
    var url = 'https://filmarks.com/users/' + userId + '?page=' + page;

    Logger.log(url);
    
    var response = UrlFetchApp.fetch(url);
    var myRegexp = /<h3 class=\"c-movie-card__title\">([\s\S]*?)<\/span><\/p><\/div><div class=\"c-movie-card__right\">/gi;
    var elems = response.getContentText().match(myRegexp);

    for(var i in elems) {
      var elem = elems[i];
      var col = parseInt(index);
      sheetData.getRange(col, 1).setValue(getRegexpedText(elem,/<h3 class=\"c-movie-card__title\">([\s\S]*?)<span>/gi));
      sheetData.getRange(col, 2).setValue(getRegexpedText(elem,/<span>([\s\S]*?)<\/span>/gi));
      sheetData.getRange(col, 3).setValue(getRegexpedText(elem,/<div class=\"c-rating__score\">([\s\S]*?)<\/div>/gi));
      sheetData.getRange(col, 4).setValue(getRegexpedText(elem,/<p class=\"c-movie-card__review\"><span>([\s\S]*?)<\/span>/gi));
      ++index;
    }
  }
}

function getRegexpedText(text, regexp)
{
  Logger.log(text)
  var elems = text.match(regexp);
  var regexpedText = elems[0];  
  regexpedText = removeTags(regexpedText);
  return regexpedText;
}

function getPageCount(userId)
{
  var url = 'https://filmarks.com/users/' + userId;
  
  var response = UrlFetchApp.fetch(url);
  var myRegexp = /<span class=\"p-users-navi__count\">([\s\S]*?)<\/span>/gi;
  var elems = response.getContentText().match(myRegexp);

  var itemCount = elems[0];
  itemCount = removeTags(itemCount)
  var pageCount = Math.ceil(parseInt(itemCount) / 36);
  return pageCount;
}

function removeTags(text)
{
  text = text.replace(/(^\s+)|(\s+$)/g, "");
  text = text.replace(/<\/?[^>]+>/gi, "");
  return text;
}