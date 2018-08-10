export default function dateHelpers() {
  return true;
}
function formatDate(date,format){
	return window.moment(date).format(format);
}
function format2Date(str, format) {
  return window.moment(str, format).toDate();
}
export{
	formatDate,
	format2Date
}
