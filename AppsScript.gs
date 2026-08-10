function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    // Gunakan lock service untuk mencegah tabrakan data jika diakses bersamaan
    lock.waitLock(10000); 
    
    // Parse JSON data dari payload POST
    var jsonString = e.postData.contents;
    var data = JSON.parse(jsonString);
    
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
    
    // Inisialisasi baris sesuai urutan kolom di sheet 'Bot'
    var rowDataBot = [
      data["Nama Pemilik"] || "",
      data["Nama Outlet"] || "",
      data["Aplikasi"] || "",
      data["Nama Akses Manager Custom"] || "",
      data["Go Email FoodMaster1"] || "",
      data["Go Email FoodMaster2"] || "",
      (data["Aplikasi"] === "GrabFood") ? (data["Gr Username"] || "") : "",
      (data["Aplikasi"] === "GrabFood") ? (data["Gr Kata Sandi"] || "") : "",
      data["S Nama Portal"] || "",
      data["S Nomor HP Akses Pemilik"] || "",
      data["S Username Akses Pemilik"] || "",
      data["S Kata Sandi Akses Pemilik"] || "",
      (data["Aplikasi"] === "ShopeeFood") ? (data["Shopee Username"] || "") : "",
      (data["Aplikasi"] === "ShopeeFood") ? (data["Shopee Password"] || "") : "",
      data["BD"] || ""
    ];
    
    // Tulis ke sheet Bot
    if (sheetBot) {
      var colBValues = sheetBot.getRange("B:B").getValues();
      var trueLastRow = 0;
      for (var r = colBValues.length - 1; r >= 0; r--) {
        if (colBValues[r][0] && colBValues[r][0].toString().trim() !== "") {
          trueLastRow = r + 1;
          break;
        }
      }
      var insertRow = trueLastRow + 1;
      sheetBot.getRange(insertRow, 1, 1, rowDataBot.length).setValues([rowDataBot]);
    }
    
    // ===== LOGIKA PENULISAN KE SHEET CREDENTIAL =====
    if (sheetCredential) {
      var rowDataCred = [];
      for (var i = 0; i < 34; i++) {
        rowDataCred.push("");
      }
      
      // Identitas Umum
      rowDataCred[0] = data["Nama Pemilik"] || "";     // Kolom A
      rowDataCred[1] = data["Nama Outlet"] || "";    // Kolom B
      rowDataCred[3] = data["Aplikasi"] || ""; // Kolom D
      rowDataCred[12] = data["Portal"] || ""; // Kolom M
      rowDataCred[32] = data["BD"] || "";       // Kolom AG
      rowDataCred[33] = "Live";              // Kolom AH
      
      var aplikatorLower = (data["Aplikasi"] || "").toLowerCase();
      
      if (aplikatorLower.indexOf("shopee") !== -1) {
        rowDataCred[22] = data["S Nama Portal"] || "";   // Kolom W
        rowDataCred[26] = data["Shopee Username"] || "";       // Kolom AA
        rowDataCred[28] = data["Shopee Password"] || "";       // Kolom AC
        rowDataCred[29] = "Staff";                             // Kolom AD
        
        // Owner access Shopee
        rowDataCred[16] = data["S Username Akses Pemilik"] || ""; // Kolom Q
        rowDataCred[17] = data["S Nomor HP Akses Pemilik"] || "";       // Kolom R
        rowDataCred[18] = data["S Kata Sandi Akses Pemilik"] || ""; // Kolom S
        rowDataCred[19] = "Owner";                    // Kolom T
        
      } else if (aplikatorLower.indexOf("grab") !== -1 || aplikatorLower === "gr") {
        rowDataCred[26] = data["Gr Username"] || ""; // Kolom AA
        rowDataCred[28] = data["Gr Kata Sandi"] || ""; // Kolom AC
        
      } else if (aplikatorLower.indexOf("gofood") !== -1 || aplikatorLower === "go") {
        rowDataCred[24] = data["Go Email FoodMaster1"] || ""; // Kolom Y
        rowDataCred[25] = data["Go Email FoodMaster2"] || ""; // Kolom Z
      }
      
      // Cari baris terakhir di sheet Credential
      var colBCred = sheetCredential.getRange("B:B").getValues();
      var trueLastRowCred = 0;
      for (var r = colBCred.length - 1; r >= 0; r--) {
        if (colBCred[r][0] && colBCred[r][0].toString().trim() !== "") {
          trueLastRowCred = r + 1;
          break;
        }
      }
      
      var insertRowCred = trueLastRowCred + 1;
      sheetCredential.getRange(insertRowCred, 1, 1, rowDataCred.length).setValues([rowDataCred]);
    }
    
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
