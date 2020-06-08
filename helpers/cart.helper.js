const getCookieCartTotalQty = (req, res) => {
    try {
        const cart = JSON.parse(req.cookies.cart);
        if(!Object.keys(cart.items)[0]) return null;
    
        return cart.total_qty;
    } catch (error) {
        res.clearCookie('cart');
        return null;
    }
}

const getCookieCart = (req, res) => {
    try {
        const cart = JSON.parse(req.cookies.cart);
        if(!Object.keys(cart.items)[0]) return res.status(200).json({ message: 'Giỏ hàng rỗng' });
    
        return cart
    } catch (error) {
        res.clearCookie('cart');
        return res.status(400).json({ message: 'Giỏ hàng rỗng' });
    }
}

const getCookieCartForTemplate = (req, res) => {
    try {
        const cart = JSON.parse(req.cookies.cart);
        if(!Object.keys(cart.items)[0]) return null;
    
        return cart;
    } catch (error) {
        res.clearCookie('cart');
        return null;
    }
}

module.exports = { getCookieCartTotalQty, getCookieCart, getCookieCartForTemplate };