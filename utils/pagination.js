const check = require("../utils/check")

let paginationFromToDate = (inputFromDate, inputToDate) => {
    inputFromDate = inputFromDate ? inputFromDate : new Date('1970-01-01').toISOString();
    inputToDate = inputToDate ? inputToDate : new Date().toISOString();
    let fromDate = new Date(new Date(inputFromDate.substring(0, 10)).setMinutes(new Date(inputFromDate.substring(0, 10)).getMinutes() - 330)).toUTCString()
    let toDate = new Date(new Date(inputToDate.substring(0, 10)).setDate(new Date(inputToDate.substring(0, 10)).getDate() + 1)).toUTCString();
    toDate = new Date(toDate).setMinutes(new Date(toDate).getMinutes() - 330)
    toDate = new Date(toDate).setSeconds(new Date(toDate).getSeconds() - 1)
    return { fromDate, toDate };
}

let paginationWithFromTo = (searchParameter, fromParameter, toParameter) => {
    let search = check.isEmpty(searchParameter) ? "" : searchParameter;
    let from = check.isEmpty(fromParameter) ? 1 : fromParameter;
    let to = check.isEmpty(toParameter) ? 25 : toParameter;
    let pageSize = Number((to - from) + 1);
    let offset = Number(from - 1);
    return { search, offset, pageSize };
}

module.exports = {
    paginationFromToDate: paginationFromToDate,
    paginationWithFromTo:paginationWithFromTo
}