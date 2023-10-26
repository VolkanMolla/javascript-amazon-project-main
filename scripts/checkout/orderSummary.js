import {
    cart,
    removeFromCart,
    calculateCartQuantity,
    updateQuantity,
    updateDeliveryOption

} from '../../data/cart.js';
import {
    getProduct
} from '../../data/products.js';
import { formatCurrency } from '../utils/money.js';

import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js';

import { deliveryOptions, getDeliveryOption } from '../../data/deliveryOptions.js';
import { renderPaymentSummary } from "../checkout/paymentSummary.js";






export function renderOrderSummary() {
    renderCheckOut();
    renderPaymentSummary();

    let cartSummaryHTML = '';

    cart.forEach((cartItem) => {
        const productId = cartItem.productId;
        let cartItemQuantity = cartItem.quantity;

        let matchingProduct = getProduct(productId);


        const deliveryOptionId = cartItem.deliveryOptionId;

        const deliveryOption = getDeliveryOption(deliveryOptionId);

        const today = dayjs();
        const deliveryDate = today.add(
            deliveryOption.deliveryDays,
            'days'
        );

        const dateString = deliveryDate.format('dddd, MMMM D');

        cartSummaryHTML += `
    <div class="cart-item-container js-cart-item-container-${matchingProduct.id}">
    <div class="delivery-date">
        Delivery date: ${dateString}
    </div>

    <div class="cart-item-details-grid">
        <img class="product-image" src="${matchingProduct.image}">

        <div class="cart-item-details">
            <div class="product-name">
                ${matchingProduct.name}
            </div>
            <div class="product-price">
                $${formatCurrency(matchingProduct.priceCents)}
            </div>
            <div class="product-quantity">
                <span>
    Quantity: <span class="quantity-label js-quantity-label-${matchingProduct.id}" data-product-id="${matchingProduct.id}">${cartItemQuantity}</span>
                </span>

                <span class="update-quantity-link link-primary js-update-link d-initial js-update-link-${matchingProduct.id}" data-product-id="${matchingProduct.id}">
    Update
  </span>
                <input type="text" class="quantity-input d-none js-quantity-input-${matchingProduct.id}" placeholder="${cartItemQuantity}" data-cart-quantity="${cartItemQuantity}">
                <span class="save-quantity-link link-primary d-none js-save-quantity-${matchingProduct.id}">Save</span>

                <span class="delete-quantity-link link-primary js-delete-link" data-product-id="${matchingProduct.id}">
    Delete
  </span>
            </div>
        </div>

        <div class="delivery-options js-delivery-options">
            <div class="delivery-options-title">
                Choose a delivery option:
            </div>

            ${deliveryOptionsHTML(matchingProduct, cartItem)}
        
        </div>
    </div>
</div>
    `
    });

    function deliveryOptionsHTML(matchingProduct, cartItem) {

        let HTML = '';

        deliveryOptions.forEach((deliveryOption) => {
            const today = dayjs();
            const deliveryDate = today.add(
                deliveryOption.deliveryDays,
                'days'
            );

            const dateString = deliveryDate.format('dddd, MMMM D');

            const priceString = deliveryOption.priceCents === 0 ? 'FREE' : `$${formatCurrency(deliveryOption.priceCents)} -`;

            const isChecked = deliveryOption.id === cartItem.deliveryOptionId;



            HTML += `
    <div class="delivery-option js-delivery-option" data-product-id="${matchingProduct.id}" data-delivery-option-id="${deliveryOption.id}">
        <input type="radio" ${isChecked ? 'checked':''} class="delivery-option-input" name="delivery-option-${matchingProduct.id}">
        <div>
            <div class="delivery-option-date">
            ${dateString}
            </div>
            <div class="delivery-option-price">
                ${priceString} Shipping
            </div>
        </div>
    </div>
    
        `
        });

        return HTML;
    }

    document.querySelector('.js-order-summary').innerHTML = cartSummaryHTML;

    document.querySelectorAll('.js-delete-link').forEach((link) => {
        link.addEventListener('click', () => {
            const productId = link.dataset.productId;
            removeFromCart(productId);


            const container = document.querySelector(`.js-cart-item-container-${productId}`);
            container.remove();
            renderCheckOut();
            renderOrderSummary();

        });

    });

    function renderCheckOut() {
        let cartValue = calculateCartQuantity();
        document.querySelector('.js-checkout-header').innerHTML =
            `${cartValue} items`;
    };


    document.querySelectorAll('.js-update-link').forEach((link) => {
        link.addEventListener('click', () => {
            const productId = link.dataset.productId;
            let quantityUpdate = document.querySelector(`.js-update-link-${productId}`);
            let quantityInput = document.querySelector(`.js-quantity-input-${productId}`);
            let quantitySave = document.querySelector(`.js-save-quantity-${productId}`);
            quantityInput.classList.replace('d-none', 'd-initial');
            quantitySave.classList.replace('d-none', 'd-initial');
            quantityUpdate.classList.replace('d-initial', 'd-none');

            quantitySave.addEventListener('click', () => {
                let newQuantity = parseInt(quantityInput.value);
                if (newQuantity <= 0 || newQuantity > 10) {
                    alert("yeni değer 1 ila 10 arasında olmalıdır");
                    return;
                } else {
                    renderQuantity(productId, newQuantity);
                    updateQuantity(productId, newQuantity);
                    renderCheckOut();
                    quantityInput.classList.replace('d-initial', 'd-none');
                    quantitySave.classList.replace('d-initial', 'd-none');
                    quantityUpdate.classList.replace('d-none', 'd-initial');
                }


                renderOrderSummary();
            })
        });
    });

    document.querySelectorAll('.js-delivery-option').forEach((element) => {
        element.addEventListener('click', () => {
            const { productId, deliveryOptionId } = element.dataset;
            updateDeliveryOption(productId, deliveryOptionId);
            renderOrderSummary();
        })
    })



    function renderQuantity(productId, value) {
        document.querySelector(`.js-quantity-label-${productId}`).innerHTML = value;
    }

    renderCheckOut();
}
renderOrderSummary();