const formatWithCommas = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
}

module.exports = { formatWithCommas };
