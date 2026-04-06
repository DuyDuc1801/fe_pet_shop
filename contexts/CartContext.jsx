import { useState, useEffect, useCallback } from 'react';
import { CartContext } from './CartContext.js';
import { useAuth } from './useAuth';
import fetchApi from '../utils/fetchApi.jsx';

export function CartProvider({ children }) {
    const { user } = useAuth();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(false);

    // Tính tổng số lượng item trong giỏ
    const totalItems = cart?.items?.reduce((s, i) => s + i.quantity, 0) || 0;

    // Tổng tiền
    const totalPrice = cart?.items?.reduce((s, i) => s + i.price * i.quantity, 0) || 0;

    const fetchCart = useCallback(async () => {
        if (!user) { setCart(null); return; }
        setLoading(true);
        const { res, data } = await fetchApi('cart', null, 'GET');
        if (res.ok) setCart(data.cart);
        setLoading(false);
    }, [user]);

    useEffect(() => {
        (async () => { await fetchCart(); })();
    }, [fetchCart]);

    const addToCart = async (productId, quantity = 1) => {
        const { res, data } = await fetchApi('cart/add', { productId, quantity }, 'POST');
        if (res.ok) setCart(data.cart);
        return { ok: res.ok, message: data.message };
    };

    const updateItem = async (productId, quantity) => {
        const { res, data } = await fetchApi(`cart/item/${productId}`, { quantity }, 'PUT');
        if (res.ok) setCart(data.cart);
        return { ok: res.ok, message: data.message };
    };

    const removeItem = async (productId) => {
        const { res, data } = await fetchApi(`cart/item/${productId}`, null, 'DELETE');
        if (res.ok) setCart(data.cart);
        return { ok: res.ok };
    };

    const clearCart = async () => {
        const { res } = await fetchApi('cart/clear', null, 'DELETE');
        if (res.ok) setCart(prev => ({ ...prev, items: [] }));
    };

    return (
        <CartContext.Provider value={{ cart, loading, totalItems, totalPrice, fetchCart, addToCart, updateItem, removeItem, clearCart }}>
            {children}
        </CartContext.Provider>
    );
}