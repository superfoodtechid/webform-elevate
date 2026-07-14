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
    // Kolom:
    // 0: Nama Pemilik, 1: Nama Outlet, 2: Aplikasi, 3: Nama Akses Manager Custom,
    // 4: Go Email FoodMaster1, 5: Go Email FoodMaster2, 6: Gr Username, 7: Gr Kata Sandi,
    // 8: S Nama Portal, 9: S Nomor HP Akses Pemilik, 10: S Username Akses Pemilik, 
    // 11: S Kata Sandi Akses Pemilik, 12: BD
    
    var rowDataBot = [
      data["Nama Pemilik"] || "",
      data["Nama Outlet"] || "",
      data["Aplikasi"] || "",
      data["Nama Akses Manager Custom"] || "",
      data["Go Email FoodMaster1"] || "",
      data["Go Email FoodMaster2"] || "",
      data["Gr Username"] || "",
      data["Gr Kata Sandi"] || "",
      data["S Nama Portal"] || "",
      data["S Nomor HP Akses Pemilik"] || "",
      data["S Username Akses Pemilik"] || "",
      data["S Kata Sandi Akses Pemilik"] || "",
      data["BD"] || ""
    ];
    
    // Cari baris terakhir yang benar-benar ada isinya di Kolom B (Nama Outlet)
    var colBValues = sheetBot.getRange("B:B").getValues();
    var trueLastRow = 0;
    for (var r = colBValues.length - 1; r >= 0; r--) {
      if (colBValues[r][0] && colBValues[r][0].toString().trim() !== "") {
        trueLastRow = r + 1;
        break;
      }
    }
    
    // Tulis data tepat 1 baris di bawah outlet terakhir
    var insertRow = trueLastRow + 1;
    sheetBot.getRange(insertRow, 1, 1, rowDataBot.length).setValues([rowDataBot]);
    
    // ===== LOGIKA PENULISAN KE SHEET CREDENTIAL (KHUSUS SHOPEE) =====
    if (sheetCredential && data["Aplikasi"] === "ShopeeFood") {
      var rowDataCred = [];
      for (var i = 0; i < 33; i++) {
        rowDataCred.push("");
      }
      
      // Identitas Baris
      rowDataCred[0] = data["Nama Pemilik"] || "";     // Kolom A
      rowDataCred[1] = data["Nama Outlet"] || "";      // Kolom B
      rowDataCred[3] = data["Aplikasi"] || "";         // Kolom D
      rowDataCred[32] = data["BD"] || "";              // Kolom AG
      
      // Data Shopee
      rowDataCred[22] = data["S Nama Portal"] || "";              // Kolom W
      rowDataCred[16] = data["S Username Akses Pemilik"] || "";   // Kolom Q
      rowDataCred[17] = data["S Nomor HP Akses Pemilik"] || "";   // Kolom R
      rowDataCred[18] = data["S Kata Sandi Akses Pemilik"] || ""; // Kolom S
      rowDataCred[19] = "Owner";                                  // Kolom T
      
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
