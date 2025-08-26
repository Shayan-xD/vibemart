import { configureStore } from "@reduxjs/toolkit";
import  userSlice from '../features/userSlice'
import  productSlice from '../features/productSlice'
import  cartSlice  from '../features/cartSlice'
import reviewSlice from '../features/reviewSlice'
import orderSlice from '../features/orderSlice'
import notificationSlice from '../features/notificationSlice'
import sellerSlice from '../features/sellerSlice'

export const store = configureStore({
  reducer : {
    users : userSlice,
    products : productSlice,
    cart : cartSlice,
    reviews : reviewSlice,
    orders : orderSlice,
    notifications : notificationSlice,
    sellerList : sellerSlice
  }
})