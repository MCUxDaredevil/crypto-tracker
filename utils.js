function parseRange(inputString) {
    const ranges = inputString.split(',');
    const pageNumbers = ranges.flatMap(range => {
        if (range.includes('-')) {
            const [start, end] = range.split('-').map(Number);
            return isNaN(start) || isNaN(end) ? [] : Array.from({length: end - start + 1}, (_, i) => i + start);
        } else {
            const pageNumber = Number(range);
            return isNaN(pageNumber) ? [] : [pageNumber];
        }
    });
    return [...new Set(pageNumbers)];
}

module.exports = { parseRange };