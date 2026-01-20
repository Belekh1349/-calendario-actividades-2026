// 1. Crea un nuevo Google Sheet.
// 2. Ve a 'Extensiones' > 'Apps Script'.
// 3. Borra todo el código y pega este:

function doGet(e) {
    var sheet = getDatabaseSheet();
    var data = sheet.getDataRange().getValues();
    var result = {
        records: {},
        profile: {}
    };

    // Procesar registros
    for (var i = 1; i < data.length; i++) {
        var type = data[i][0]; // 'RECORD' o 'PROFILE'
        var key = data[i][1];  // Fecha o campo del perfil
        var value = data[i][2]; // JSON string

        if (type === 'RECORD') {
            result.records[key] = JSON.parse(value);
        } else if (type === 'PROFILE') {
            result.profile[key] = value;
        }
    }

    return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
    var content;
    try {
        content = JSON.parse(e.postData.contents);
    } catch (err) {
        // Fallback for different content types
        content = e.parameter;
    }

    var sheet = getDatabaseSheet();

    if (content && content.action === 'SYNC_ALL') {
        sheet.clear();
        sheet.appendRow(['TYPE', 'KEY', 'VALUE', 'TIMESTAMP']);

        // Guardar Perfil
        if (content.profile) {
            for (var k in content.profile) {
                if (k !== 'sheetsUrl') { // Don't store the URL itself
                    sheet.appendRow(['PROFILE', k, content.profile[k], new Date()]);
                }
            }
        }

        // Guardar Registros
        if (content.records) {
            for (var date in content.records) {
                sheet.appendRow(['RECORD', date, JSON.stringify(content.records[date]), new Date()]);
            }
        }

        return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

function getDatabaseSheet() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Database');
    if (!sheet) {
        sheet = ss.insertSheet('Database');
        sheet.appendRow(['TYPE', 'KEY', 'VALUE', 'TIMESTAMP']);
    }
    return sheet;
}

// 4. Haz clic en 'Implementar' > 'Nueva implementación'.
// 5. Tipo: 'Aplicación web'.
// 6. Ejecutar como: 'Yo' (tu cuenta).
// 7. Quién tiene acceso: 'Cualquiera'.
// 8. Copia la 'URL de la aplicación web' y pégala en AdminFlow.
