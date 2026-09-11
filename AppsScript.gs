function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    // Gunakan lock service untuk mencegah tabrakan data jika diakses bersamaan (timeout dinaikkan ke 30 detik)
    lock.waitLock(30000); 
    
    // Parse JSON data dari payload POST
    var jsonString = e.postData.contents;
    var data = JSON.parse(jsonString);
    
    // Mendukung pengiriman batch (Array) maupun single (Object)
    var items = Array.isArray(data) ? data : [data];
    if (items.length === 0) {
      return ContentService.createTextOutput(JSON.stringify({ 
        status: "success", 
        message: "Tidak ada data untuk disimpan." 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    var autoSheetId = "1KGuFkD1vAfSVay-GssS5vXKJbOKD4ngi9LVxjmfGkbk";
    var credSheetId = "14eCb8DAEXhmbYj9MFj2KzC7AhkulbCbSNPltN2m-go0";
    
    var ssAuto = SpreadsheetApp.openById(autoSheetId);
    var ssCred = SpreadsheetApp.openById(credSheetId);
    
    var sheetBot = ssAuto.getSheetByName("Bot");
    var sheetCredential = ssCred.getSheetByName("Credential");
    
    if (!sheetBot) {
      return ContentService.createTextOutput(JSON.stringify({ 
        status: "error", 
        message: "Nama sheet 'Bot' tidak ditemukan!" 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    var batchRowsBot = [];
    var batchRowsCred = [];
    
    for (var k = 0; k < items.length; k++) {
      var item = items[k];
      
      // Inisialisasi baris sesuai urutan kolom di sheet 'Bot'
      var rowDataBot = [
        item["Nama Pemilik"] || "",
        item["Nama Outlet"] || "",
        item["Aplikasi"] || "",
        item["Nama Akses Manager Custom"] || "",
        item["Go Email FoodMaster1"] || "",
        item["Go Email FoodMaster2"] || "",
        (item["Aplikasi"] === "GrabFood") ? (item["Gr Username"] || "") : "",
        (item["Aplikasi"] === "GrabFood") ? (item["Gr Kata Sandi"] || "") : "",
        item["S Nama Portal"] || "",
        item["S Nomor HP Akses Pemilik"] || "",
        item["S Username Akses Pemilik"] || "",
        item["S Kata Sandi Akses Pemilik"] || "",
        (item["Aplikasi"] === "ShopeeFood") ? (item["Shopee Username"] || "") : "",
        (item["Aplikasi"] === "ShopeeFood") ? (item["Shopee Password"] || "") : "",
        item["BD"] || ""
      ];
      batchRowsBot.push(rowDataBot);
      
      // Inisialisasi baris di sheet 'Credential'
      if (sheetCredential) {
        var rowDataCred = [];
        for (var i = 0; i < 34; i++) {
          rowDataCred.push("");
        }
        
        // Identitas Umum
        rowDataCred[0] = item["Nama Pemilik"] || "";     // Kolom A
        rowDataCred[1] = item["Nama Outlet"] || "";    // Kolom B
        rowDataCred[3] = item["Aplikasi"] || ""; // Kolom D
        rowDataCred[12] = item["Portal"] || ""; // Kolom M
        rowDataCred[32] = item["BD"] || "";       // Kolom AG
        rowDataCred[33] = "Live";              // Kolom AH
        
        var aplikatorLower = (item["Aplikasi"] || "").toLowerCase();
        
        if (aplikatorLower.indexOf("shopee") !== -1) {
          rowDataCred[22] = item["S Nama Portal"] || "";   // Kolom W
          rowDataCred[26] = item["Shopee Username"] || "";       // Kolom AA
          rowDataCred[28] = item["Shopee Password"] || "";       // Kolom AC
          rowDataCred[29] = "Staff";                             // Kolom AD
          
          // Owner access Shopee
          rowDataCred[16] = item["S Username Akses Pemilik"] || ""; // Kolom Q
          rowDataCred[17] = item["S Nomor HP Akses Pemilik"] || "";       // Kolom R
          rowDataCred[18] = item["S Kata Sandi Akses Pemilik"] || ""; // Kolom S
          rowDataCred[19] = "Owner";                    // Kolom T
          
        } else if (aplikatorLower.indexOf("grab") !== -1 || aplikatorLower === "gr") {
          rowDataCred[26] = item["Gr Username"] || ""; // Kolom AA
          rowDataCred[28] = item["Gr Kata Sandi"] || ""; // Kolom AC
          
        } else if (aplikatorLower.indexOf("gofood") !== -1 || aplikatorLower === "go") {
          rowDataCred[24] = item["Go Email FoodMaster1"] || ""; // Kolom Y
          rowDataCred[25] = item["Go Email FoodMaster2"] || ""; // Kolom Z
        }
        
        batchRowsCred.push(rowDataCred);
      }
    }
    
    // Tulis sekaligus ke sheet Bot
    if (sheetBot && batchRowsBot.length > 0) {
      var colBValues = sheetBot.getRange("B:B").getValues();
      var trueLastRow = 0;
      for (var r = colBValues.length - 1; r >= 0; r--) {
        if (colBValues[r][0] && colBValues[r][0].toString().trim() !== "") {
          trueLastRow = r + 1;
          break;
        }
      }
      var insertRow = trueLastRow + 1;
      sheetBot.getRange(insertRow, 1, batchRowsBot.length, batchRowsBot[0].length).setValues(batchRowsBot);
    }
    
    // Tulis sekaligus ke sheet Credential
    if (sheetCredential && batchRowsCred.length > 0) {
      var colBCred = sheetCredential.getRange("B:B").getValues();
      var trueLastRowCred = 0;
      for (var r = colBCred.length - 1; r >= 0; r--) {
        if (colBCred[r][0] && colBCred[r][0].toString().trim() !== "") {
          trueLastRowCred = r + 1;
          break;
        }
      }
      var insertRowCred = trueLastRowCred + 1;
      sheetCredential.getRange(insertRowCred, 1, batchRowsCred.length, batchRowsCred[0].length).setValues(batchRowsCred);
    }
    
    SpreadsheetApp.flush();
    
    // Kembalikan response sukses CORS-friendly
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "success", 
      message: "Kredensial berhasil disinkronisasi ke Google Sheets!" 
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Kembalikan pesan error jika terjadi kegagalan
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "error", 
      message: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
