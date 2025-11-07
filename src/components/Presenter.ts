import { EventEmitter } from './base/Events';
import { ProductModel } from './models/ProductModel';
import { CartModel } from './models/CartModel';
import { BuyerModel } from './models/BuyerModel';
import { AppApi } from './AppApi';
import { Card } from './view/Сard';
import { Basket } from './view/Basket';
import { Modal } from './view/Modal';
import { IProduct, IOrder, PaymentMethod } from '../types';

// Константы для сообщений
const ERROR_MESSAGES = {
	ADDRESS_REQUIRED: 'Необходимо указать адрес (минимум 10 символов)',
	PAYMENT_REQUIRED: 'Необходимо выбрать способ оплаты',
	BOTH_REQUIRED: 'Необходимо выбрать способ оплаты и указать адрес',
	EMAIL_PHONE_REQUIRED: 'Необходимо указать email и телефон',
	INVALID_EMAIL: 'Введите корректный email (адрес электронной почты)',
	INVALID_PHONE: 'Введите корректный номер телефона'
};

export class Presenter {
	private events: EventEmitter;
	private productModel: ProductModel;
	private cartModel: CartModel;
	private buyerModel: BuyerModel;
	private api: AppApi;

	private modal!: Modal;
	private basket!: Basket;

	constructor(
		events: EventEmitter,
		productModel: ProductModel,
		cartModel: CartModel,
		buyerModel: BuyerModel,
		api: AppApi
	) {
		this.events = events;
		this.productModel = productModel;
		this.cartModel = cartModel;
		this.buyerModel = buyerModel;
		this.api = api;

		this.initViews();
		this.initEventListeners();
	}

	private initViews(): void {
		this.initModal();
		this.initBasket();
	}

	private initModal(): void {
		const modalContainer = document.getElementById('modal-container');
		if (modalContainer) {
			this.modal = new Modal(modalContainer as HTMLElement);
		} else {
			throw new Error('Modal container не найден');
		}
	}

	private initBasket(): void {
		const basketTemplate = document.getElementById('basket') as HTMLTemplateElement;
		if (!basketTemplate) {
			throw new Error('Basket template не найден');
		}

		const basketElement = basketTemplate.content.cloneNode(true) as HTMLElement;
		const basketContainer = basketElement.querySelector('.basket');

		if (basketContainer) {
			this.basket = new Basket(basketContainer as HTMLElement, {
				onCheckout: () => this.openOrderForm(),
				onRemove: (id: string) => this.removeFromCart(id)
			});
		} else {
			throw new Error('Basket container не найден в шаблоне');
		}
	}

	private initEventListeners(): void {
		this.events.on('items:changed', () => this.renderProducts());
		this.events.on('cart:changed', () => this.updateCart());
		this.events.on('modal:open', () => this.modal?.open());
		this.events.on('modal:close', () => this.modal?.close());
		this.events.on('basket:open', () => this.openBasket());
	}

	private renderProducts(): void {
		const gallery = document.querySelector('.gallery');
		if (!gallery) return;

		const products = this.productModel.getItems();
		gallery.innerHTML = '';

		products.forEach(product => {
			this.createProductCard(product, gallery);
		});
	}

	private createProductCard(product: IProduct, container: Element): void {
		try {
			const template = document.getElementById('card-catalog') as HTMLTemplateElement;
			if (!template) return;

			const cardElement = template.content.cloneNode(true) as HTMLElement;
			const cardContainer = cardElement.querySelector('.card');
			if (!cardContainer) return;

			const card = new Card(cardContainer as HTMLElement, {
				onClick: () => this.openProductModal(product)
			});

			this.setCardData(card, product);
			container.appendChild(cardElement);
		} catch (error) {
			console.error('Ошибка создания карточки:', error);
		}
	}

	private setCardData(card: Card, product: IProduct): void {
		card.id = product.id;
		card.title = product.title;
		card.description = product.description;
		card.image = product.image;
		card.category = product.category;
		card.price = product.price;
		card.selected = this.cartModel.hasItem(product.id);
	}

	private openProductModal(product: IProduct): void {
		const template = document.getElementById('card-preview') as HTMLTemplateElement;
		if (!template) return;

		const modalContent = template.content.cloneNode(true) as HTMLElement;
		const cardContainer = modalContent.querySelector('.card');
		if (!cardContainer) return;

		const card = new Card(cardContainer as HTMLElement, {
			onClick: () => this.toggleCart(product)
		});

		this.setCardData(card, product);
		this.modal.content = modalContent;
		this.modal.open();
	}

	private toggleCart(product: IProduct): void {
		if (this.cartModel.hasItem(product.id)) {
			this.cartModel.removeItem(product.id);
		} else {
			this.cartModel.addItem(product);
		}
		this.events.emit('cart:changed');
		this.modal.close();
	}

	private openBasket(): void {
		this.updateBasketItems();
		if (this.basket) {
			this.modal.content = this.basket.getContainer();
			this.modal.open();
		}
	}

	private updateBasketItems(): void {
		const items = this.cartModel.getItems();
		const itemElements = items.map((item, index) => this.createBasketItem(item, index));

		if (this.basket) {
			this.basket.items = itemElements;
			this.basket.total = this.cartModel.getTotal();
			this.basket.selected = items;
		}
	}

	private createBasketItem(item: IProduct, index: number): HTMLElement {
		const template = document.getElementById('card-basket') as HTMLTemplateElement;
		if (!template) return document.createElement('div');

		const itemElement = template.content.cloneNode(true) as HTMLElement;
		const cardContainer = itemElement.querySelector('.card');
		if (!cardContainer) return document.createElement('div');

		const card = new Card(cardContainer as HTMLElement);
		const indexElement = itemElement.querySelector('.basket__item-index');
		const deleteButton = itemElement.querySelector('.basket__item-delete');

		if (indexElement) indexElement.textContent = (index + 1).toString();
		card.title = item.title;
		card.price = item.price;

		if (deleteButton) {
			deleteButton.addEventListener('click', () => this.removeFromCart(item.id));
		}

		return itemElement as HTMLElement;
	}

	private removeFromCart(id: string): void {
		this.cartModel.removeItem(id);
		this.events.emit('cart:changed');
		this.updateBasketItems();
	}

	private updateCart(): void {
		const counter = document.querySelector('.header__basket-counter');
		if (counter) {
			counter.textContent = this.cartModel.getCount().toString();
		}
	}

	private openOrderForm(): void {
		if (this.cartModel.getCount() === 0) {
			alert('Корзина пуста! Добавьте товары перед оформлением заказа.');
			return;
		}

		const orderTemplate = document.getElementById('order') as HTMLTemplateElement;
		if (!orderTemplate) return;

		const orderContent = orderTemplate.content.cloneNode(true) as HTMLElement;
		this.setupOrderForm(orderContent);
		this.modal.content = orderContent;
		this.modal.open();
	}

	private setupOrderForm(formElement: HTMLElement): void {
		const paymentButtons = formElement.querySelectorAll('.button_alt') as NodeListOf<HTMLButtonElement>;
		const nextButton = formElement.querySelector('.order__button') as HTMLButtonElement;
		const addressInput = formElement.querySelector('input[name="address"]') as HTMLInputElement;
		const addressError = formElement.querySelector('.form__errors') as HTMLElement;

		let selectedPayment = '';
		let isAddressValid = false;

		if (nextButton) nextButton.disabled = true;

		paymentButtons.forEach(button => {
			button.addEventListener('click', () => {
				paymentButtons.forEach(btn => btn.classList.remove('button_alt-active'));
				button.classList.add('button_alt-active');
				selectedPayment = button.name;
				this.validateOrderStep(selectedPayment, isAddressValid, nextButton, addressError);
			});
		});

		if (addressInput) {
			addressInput.addEventListener('input', () => {
				const addressValue = addressInput.value.trim();
				isAddressValid = addressValue.length >= 10;

				if (addressError) {
					addressError.style.display = !isAddressValid && addressValue.length > 0 ? 'block' : 'none';
				}

				this.validateOrderStep(selectedPayment, isAddressValid, nextButton, addressError);
			});
		}

		if (nextButton) {
			nextButton.addEventListener('click', () => {
				if (selectedPayment && isAddressValid) {
					this.openContactForm(selectedPayment, addressInput.value.trim());
				}
			});
		}
	}

	private validateOrderStep(
		selectedPayment: string,
		isAddressValid: boolean,
		nextButton: HTMLButtonElement,
		addressError: HTMLElement
	): void {
		const isValid = selectedPayment && isAddressValid;
		nextButton.disabled = !isValid;

		if (addressError) {
			if (!isValid && selectedPayment && !isAddressValid) {
				addressError.textContent = ERROR_MESSAGES.ADDRESS_REQUIRED;
			} else if (!isValid && !selectedPayment && isAddressValid) {
				addressError.textContent = ERROR_MESSAGES.PAYMENT_REQUIRED;
			} else if (!isValid && !selectedPayment && !isAddressValid) {
				addressError.textContent = ERROR_MESSAGES.BOTH_REQUIRED;
			}
			addressError.style.display = !isValid ? 'block' : 'none';
		}
	}

	private openContactForm(paymentMethod: string, address: string): void {
		const contactsTemplate = document.getElementById('contacts') as HTMLTemplateElement;
		if (!contactsTemplate) return;

		const contactsContent = contactsTemplate.content.cloneNode(true) as HTMLElement;
		this.setupContactForm(contactsContent, paymentMethod, address);
		this.modal.content = contactsContent;
		this.modal.open();
	}

	private setupContactForm(
		formElement: HTMLElement,
		paymentMethod: string,
		address: string
	): void {
		const emailInput = formElement.querySelector('input[name="email"]') as HTMLInputElement;
		const phoneInput = formElement.querySelector('input[name="phone"]') as HTMLInputElement;
		const submitButton = formElement.querySelector('button[type="submit"]') as HTMLButtonElement;
		const form = formElement.querySelector('.form') as HTMLFormElement;
		const totalElement = formElement.querySelector('.order__total');
		const formErrors = formElement.querySelector('.form__errors') as HTMLElement;

		let isEmailValid = false;
		let isPhoneValid = false;

		if (totalElement) {
			totalElement.textContent = `${this.cartModel.getTotal()} синапсов`;
		}

		if (submitButton) {
			submitButton.disabled = true;
		}

		const validateForm = (): void => {
			const emailValue = emailInput?.value.trim() || '';
			const phoneValue = phoneInput?.value.trim() || '';

			isEmailValid = this.validateEmail(emailValue);
			isPhoneValid = this.validatePhone(phoneValue);

			if (formErrors) {
				if (!isEmailValid && !isPhoneValid && (emailValue || phoneValue)) {
					formErrors.textContent = ERROR_MESSAGES.EMAIL_PHONE_REQUIRED;
					formErrors.style.display = 'block';
				} else if (!isEmailValid && emailValue) {
					formErrors.textContent = ERROR_MESSAGES.INVALID_EMAIL;
					formErrors.style.display = 'block';
				} else if (!isPhoneValid && phoneValue) {
					formErrors.textContent = ERROR_MESSAGES.INVALID_PHONE;
					formErrors.style.display = 'block';
				} else if (!isEmailValid && !isPhoneValid) {
					formErrors.textContent = ERROR_MESSAGES.EMAIL_PHONE_REQUIRED;
					formErrors.style.display = 'block';
				} else {
					formErrors.style.display = 'none';
				}
			}

			this.validateContactStep(isEmailValid, isPhoneValid, submitButton);
		};

		if (emailInput) {
			emailInput.addEventListener('input', validateForm);
		}

		if (phoneInput) {
			phoneInput.addEventListener('input', validateForm);
		}

		if (form) {
			form.addEventListener('submit', (event) => {
				event.preventDefault();
				validateForm();

				if (isEmailValid && isPhoneValid) {
					this.submitOrder({
						payment: paymentMethod as PaymentMethod,
						address: address,
						email: emailInput.value,
						phone: phoneInput.value
					});
				} else {
					if (formErrors) {
						if (!isEmailValid && !isPhoneValid) {
							formErrors.textContent = ERROR_MESSAGES.EMAIL_PHONE_REQUIRED;
						} else if (!isEmailValid) {
							formErrors.textContent = ERROR_MESSAGES.INVALID_EMAIL;
						} else if (!isPhoneValid) {
							formErrors.textContent = ERROR_MESSAGES.INVALID_PHONE;
						}
						formErrors.style.display = 'block';
					}
				}
			});
		}

		validateForm();
	}

	private validateContactStep(
		isEmailValid: boolean,
		isPhoneValid: boolean,
		submitButton: HTMLButtonElement
	): void {
		if (submitButton) {
			submitButton.disabled = !(isEmailValid && isPhoneValid);
		}
	}

	private showSuccessModal(total: number): void {
		const successTemplate = document.getElementById('success') as HTMLTemplateElement;
		if (!successTemplate) return;

		const successContent = successTemplate.content.cloneNode(true) as HTMLElement;
		const successDescription = successContent.querySelector('.order-success__description') as HTMLElement;
		const closeButton = successContent.querySelector('.order-success__close') as HTMLButtonElement;

		if (successDescription) {
			successDescription.textContent = `Списано ${total} синапсов`;
		}

		if (closeButton) {
			closeButton.addEventListener('click', () => {
				this.modal.close();
			});
		}

		this.modal.content = successContent;
		this.modal.open();
	}

	private validateEmail(email: string): boolean {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}

	private validatePhone(phone: string): boolean {
		const phoneRegex = /^[\d\s\-\+\(\)]{5,}$/;
		return phoneRegex.test(phone.replace(/\s/g, ''));
	}

	private async submitOrder(orderData: {
		payment: PaymentMethod;
		address: string;
		email: string;
		phone: string;
	}): Promise<void> {
		const fullOrderData: IOrder = {
			...orderData,
			items: this.cartModel.getItems().map(item => item.id),
			total: this.cartModel.getTotal()
		};

		try {
			this.buyerModel.setData({
				email: orderData.email,
				phone: orderData.phone,
				address: orderData.address
			});

			// Убрана неиспользуемая переменная result
			await this.api.createOrder(fullOrderData);

			this.showSuccessModal(this.cartModel.getTotal());
			this.cartModel.clear();
			this.events.emit('cart:changed');

		} catch (error) {
			console.error('Ошибка при оформлении заказа:', error);
			alert('Произошла ошибка при оформлении заказа. Попробуйте еще раз.');
		}
	}
}