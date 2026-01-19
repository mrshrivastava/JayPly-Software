const XLSX = require("xlsx");
const fs = require("fs");

/* ================= READ SHEET ================= */
exports.readSheet = (file, sheet) => {
  if (!fs.existsSync(file)) return [];

  const wb = XLSX.readFile(file);
  if (!wb.Sheets[sheet]) return [];

  return XLSX.utils.sheet_to_json(wb.Sheets[sheet]);
};

/* ================= WRITE SHEET ================= */
exports.writeSheet = (file, sheet, data) => {
  let wb;

  if (fs.existsSync(file)) {
    wb = XLSX.readFile(file);
  } else {
    wb = XLSX.utils.book_new();
  }

  const ws = XLSX.utils.json_to_sheet(data);
  wb.Sheets[sheet] = ws;

  if (!wb.SheetNames.includes(sheet)) {
    wb.SheetNames.push(sheet);
  }

  XLSX.writeFile(wb, file);
};

/* ================= ENSURE SHEET EXISTS ================= */
exports.ensureSheet = (file, sheet, headers = []) => {
  let wb;

  if (fs.existsSync(file)) {
    wb = XLSX.readFile(file);
  } else {
    wb = XLSX.utils.book_new();
  }

  if (!wb.Sheets[sheet]) {
    const ws = XLSX.utils.aoa_to_sheet([headers]);
    XLSX.utils.book_append_sheet(wb, ws, sheet);
    XLSX.writeFile(wb, file);
  }
};

/* ================= DELETE SHEET ================= */
exports.deleteSheet = (file, sheet) => {
  if (!fs.existsSync(file)) return;

  const wb = XLSX.readFile(file);
  if (!wb.Sheets[sheet]) return;

  delete wb.Sheets[sheet];
  wb.SheetNames = wb.SheetNames.filter(name => name !== sheet);

  XLSX.writeFile(wb, file);
};
