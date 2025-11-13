import './scss/styles.scss';

import { EventEmitter } from './components/base/Events';
import { ProductModel } from './components/models/ProductModel';
import { CartModel } from './components/models/CartModel';
import { BuyerModel } from './components/models/BuyerModel';
import { AppApi } from './components/AppApi';
import { API_URL, ERROR_MESSAGES } from './utils/constants';
import { Api } from './components/base/Api';
import { ensureElement } from './utils/utils';
import { HeaderView } from './components/views/HeaderView';
import { GalleryView } from './components/views/GalleryView';
import { IOrder, IProduct, PaymentMethod } from './types';
import { ModalView } from './components/views/ModalView';
import { ProductPreviewView } from './components/views/Card/ProductCardPreviewView';
import { BasketView } from './components/views/BasketView';
import { OrderView } from './components/views/OrderView';
import { ContactsView } from './components/views/ContactsView';
import { SuccessView } from './components/views/SuccessView';


// Создаём экземпляры моделей и представлений
const events = new EventEmitter();
const productModel = new ProductModel(events);
const cartModel = new CartModel(events);
const buyerModel = new BuyerModel();
const headerView = new HeaderView(events, ensureElement('.header'));
const galleryView = new GalleryView(events, ensureElement(".gallery"), productModel);
const modalView = new ModalView(events, ensureElement('#modal-container'));

// Создаём API
const baseApi = new Api(API_URL);
const api = new AppApi(baseApi);

// Подписываемся на изменение списка товаров
events.on('products:changed', () => {
	const products = productModel.getItems();
	galleryView.render({ items: products });
	console.log(`Галерея обновлена: ${products.length} товаров`);
});

// Подписываемся на выбор товара для открытия превью
events.on('card:select', (data: { product: IProduct }) => {
	const product = data.product;

	// Создаем превью из шаблона
	const template = document.getElementById('card-preview') as HTMLTemplateElement;
	const previewElement = template.content.cloneNode(true) as DocumentFragment;
	const previewContainer = previewElement.firstElementChild as HTMLElement;

	// Создаем представление превью
	const previewView = new ProductPreviewView(events, previewContainer);

	// Устанавливаем данные товара
	previewView.render(product);

	const inBasket = cartModel.hasItem(product.id);
	previewView.inBasket = inBasket;

	if (product.price === null) {
		previewView.setButtonDisabled(true);
		previewView.setButtonText('Недоступно');
	}

	// Открываем модальное окно с превью
	modalView.render({ content: previewContainer });
	modalView.open();
});

// Подписываемся на клик по кнопке в превью
events.on('product:toggle-cart', (data: { id: string }) => {
	if (data.id) {
		if (cartModel.hasItem(data.id)) {
			cartModel.removeItem(data.id);
		} else {
			const product = productModel.getItem(data.id);
			if (product) {
				cartModel.addItem(product);
			}
		}
		modalView.close();
	}
});

// Подписываемся на открытие корзины
events.on('basket:open', () => {
	openBasketModal();
});

// Подписываемся на удаление товара из корзины
events.on('basket:item-remove', (data: { id: string }) => {
	cartModel.removeItem(data.id);
	openBasketModal(); // Обновляем корзину
});

// Подписываемся на оформление заказа
events.on('basket:checkout', () => {
	console.log('Переходим к оформлению заказа');
	openOrderModal();
});

// Обработчики для первого шага (OrderView)
events.on('order:payment-change', (data: { payment: string }) => {
	buyerModel.setData({ payment: data.payment });
	updateOrderValidation();
});

events.on('order:address-change', (data: { address: string }) => {
	buyerModel.setData({ address: data.address });
	updateOrderValidation();
});

events.on('order:submit', () => {
	if (buyerModel.isFirstStepValid()) {
		openContactsModal();
	} else {
		const errors = buyerModel.validateFirstStep();
		const errorMessage = getOrderErrorMessage(errors);
		events.emit('order:validation', {
			valid: false,
			errors: errorMessage
		});
	}
});

// Обработчики для второго шага (ContactsView)
events.on('contacts:email-change', (data: { email: string }) => {
	buyerModel.setData({ email: data.email });
	updateContactsValidation();
});

events.on('contacts:phone-change', (data: { phone: string }) => {
	buyerModel.setData({ phone: data.phone });
	updateContactsValidation();
});

events.on('contacts:submit', () => {

	if (buyerModel.isValid()) {
		submitOrder();
	} else {
		const errors = buyerModel.validate();
		const errorMessage = getContactsErrorMessage(errors);
		events.emit('contacts:validation', {
			valid: false,
			errors: errorMessage
		});
	}
});

// Подписываемся на изменения в корзине
events.on('cart:change', () => {
	headerView.counter = cartModel.getCount();
});

// Обработчики для обновления состояния формы OrderView
events.on('order:validation', (data: { valid: boolean; errors: string }) => {
	const template = document.getElementById('order') as HTMLTemplateElement;
	const orderElement = template.content.cloneNode(true) as DocumentFragment;
	const orderContainer = orderElement.firstElementChild as HTMLElement;

	const orderView = new OrderView(events, orderContainer);
	const buyerData = buyerModel.getData();

	orderView.render({
		payment: buyerData.payment || '',
		address: buyerData.address || '',
		valid: data.valid,
		errors: data.errors
	});

	// Если форма уже открыта, обновляем её содержимое
	const currentContent = modalView.modalContainer.querySelector('.modal__content');
	if (currentContent && currentContent.querySelector('form[name="order"]')) {
		modalView.render({ content: orderContainer });
	}
});

// Обработчики для обновления состояния формы ContactsView
events.on('contacts:validation', (data: { valid: boolean; errors: string }) => {
	const template = document.getElementById('contacts') as HTMLTemplateElement;
	const contactsElement = template.content.cloneNode(true) as DocumentFragment;
	const contactsContainer = contactsElement.firstElementChild as HTMLElement;

	const contactsView = new ContactsView(events, contactsContainer);
	const buyerData = buyerModel.getData();

	contactsView.render({
		email: buyerData.email || '',
		phone: buyerData.phone || '',
		valid: data.valid,
		errors: data.errors
	});

	// Если форма уже открыта, обновляем её содержимое
	const currentContent = modalView.modalContainer.querySelector('.modal__content');
	if (currentContent && currentContent.querySelector('form[name="contacts"]')) {
		modalView.render({ content: contactsContainer });
	}
});

// Вспомогательные функции для формирования сообщений об ошибках
function getOrderErrorMessage(_errors: Record<string, string>): string {
	const buyerData = buyerModel.getData();

	// Если ничего не выбрано и не введено
	if (!buyerData.payment && !buyerData.address) {
		return 'Выберите способ оплаты и введите адрес';
	}

	// Если не выбран способ оплаты
	if (!buyerData.payment) {
		return ERROR_MESSAGES.PAYMENT_REQUIRED;
	}

	// Если не введен адрес
	if (!buyerData.address) {
		return ERROR_MESSAGES.ADDRESS_REQUIRED;
	}

	return '';
}

function getContactsErrorMessage(errors: Record<string, string>): string {
	const errorFields = [];
	if (errors.email) errorFields.push('email');
	if (errors.phone) errorFields.push('телефон');

	return errorFields.length > 0
		? `Заполните: ${errorFields.join(', ')}`
		: '';
}

// Функции валидации
function updateOrderValidation() {
	const errors = buyerModel.validateFirstStep();
	const errorMessage = getOrderErrorMessage(errors);
	events.emit('order:validation', {
		valid: buyerModel.isFirstStepValid(),
		errors: errorMessage
	});
}

function updateContactsValidation() {
	const errors = buyerModel.validateSecondStep();
	const errorMessage = getContactsErrorMessage(errors);
	events.emit('contacts:validation', {
		valid: buyerModel.isSecondStepValid(),
		errors: errorMessage
	});
}

// Функции открытия модальных окон
function openOrderModal() {
	const template = document.getElementById('order') as HTMLTemplateElement;
	const orderElement = template.content.cloneNode(true) as DocumentFragment;
	const orderContainer = orderElement.firstElementChild as HTMLElement;

	const orderView = new OrderView(events, orderContainer);
	const buyerData = buyerModel.getData();

	// Сразу запускаем валидацию при открытии
	updateOrderValidation();

	orderView.render({
		payment: buyerData.payment || '',
		address: buyerData.address || '',
		valid: buyerModel.isFirstStepValid(),
		errors: ''
	});

	modalView.render({ content: orderContainer });
	modalView.open();
}

function openContactsModal() {
	const template = document.getElementById('contacts') as HTMLTemplateElement;
	const contactsElement = template.content.cloneNode(true) as DocumentFragment;
	const contactsContainer = contactsElement.firstElementChild as HTMLElement;

	const contactsView = new ContactsView(events, contactsContainer);
	const buyerData = buyerModel.getData();

	contactsView.render({
		email: buyerData.email || '',
		phone: buyerData.phone || '',
		valid: buyerModel.isSecondStepValid(),
		errors: ''
	});

	modalView.render({ content: contactsContainer });
}

function submitOrder() {
	// Проверяем, что все обязательные поля заполнены
	const buyerData = buyerModel.getData();

	if (!buyerModel.isValid()) {
		const errors = buyerModel.validate();
		const errorMessage = getContactsErrorMessage(errors);
		events.emit('contacts:validation', {
			valid: false,
			errors: errorMessage
		});
		return;
	}

	// Приводим payment к правильному типу
	const paymentMethod = buyerData.payment as PaymentMethod;

	// Создаем данные заказа
	const orderData: IOrder = {
		payment: paymentMethod,
		email: buyerData.email!,
		phone: buyerData.phone!,
		address: buyerData.address!,
		items: cartModel.getItems().map(item => item.id),
		total: cartModel.getTotal()
	};

	api.createOrder(orderData).then((response) => {
		const total = response.total;
		cartModel.clear();
		buyerModel.clear();
		showSuccessModal(total);
	}).catch(error => {
		console.error('Ошибка оформления заказа:', error);
		events.emit('contacts:validation', {
			valid: false,
			errors: ERROR_MESSAGES.ORDER_ERROR
		});
	});
}

function showSuccessModal(total: number) {
	const template = document.getElementById('success') as HTMLTemplateElement;
	const successElement = template.content.cloneNode(true) as DocumentFragment;
	const successContainer = successElement.firstElementChild as HTMLElement;

	const successView = new SuccessView(events, successContainer);
	successView.total = total;

	modalView.render({ content: successContainer });

}

// Обработчик закрытия успешного окна
events.on('success:close', () => {
	modalView.close();
});

// Функция для открытия модального окна корзины
function openBasketModal() {
	// Создаем корзину из шаблона
	const template = document.getElementById('basket') as HTMLTemplateElement;
	const basketElement = template.content.cloneNode(true) as DocumentFragment;
	const basketContainer = basketElement.firstElementChild as HTMLElement;

	// Создаем представление корзины
	const basketView = new BasketView(events, basketContainer);

	// Рендерим корзину с товарами
	const basketItems = cartModel.getItems();
	basketView.renderBasket(basketItems, cartModel.getTotal());

	// Открываем модальное окно с корзиной
	modalView.render({ content: basketContainer });
	modalView.open();
}

// Загружаем товары и инициализируем приложение
async function initApp() {
	try {
		console.log('Загрузка товаров с сервера...');
		const products = await api.getProductList();
		productModel.setItems(products);
		console.log('Приложение инициализировано');
	} catch (error) {
		console.error('Ошибка загрузки товаров:', error);
		const { apiProducts } = await import('./utils/data');
		productModel.setItems(apiProducts.items);
		console.log('Использованы тестовые данные');
	}
}

// Запускаем приложение
initApp();