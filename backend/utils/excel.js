const XLSX = require("xlsx");

exports.readSheet = (file, sheet) => {
  const wb = XLSX.readFile(file);
  return XLSX.utils.sheet_to_json(wb.Sheets[sheet]);
};

exports.writeSheet = (file, sheet, data) => {
  const wb = XLSX.readFile(file);
  wb.Sheets[sheet] = XLSX.utils.json_to_sheet(data);
  XLSX.writeFile(wb, file);
};