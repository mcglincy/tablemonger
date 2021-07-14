
const rowNumbers = (num) => {
  if (num <= 20) {
    return sequence(num);
  } else if (num <= 36) {
    return nByN(6);
  } else if (num <= 64) {
    return nByN(8);    
  } else {
    return sequence(num);
  }
};
exports.rowNumbers = rowNumbers;

const sequence = (n) => {
  var nums = []
  for (var d1 = 1; d1 <= n; d1++) {
    nums.push(d1);
  }
  return nums;
};

const nByN = (n) => {
  var nums = []
  for (var d1 = 1; d1 <= n; d1++) {
    for (var d2 = 1; d2 <= n; d2++) {
      nums.push(d1 * 10 + d2);
    }
  }
  return nums;
};

const numberedTableItems = (tableItems) => {
  const rowNums = rowNumbers(tableItems.length);
  var zipped = rowNums.map((a, i) => {
    return {"rowNum":a, "tableItem":tableItems[i]};
  });
  return zipped;
};
exports.numberedTableItems = numberedTableItems;