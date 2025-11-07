import './scss/styles.scss';

import { EventEmitter } from './components/base/Events';
import { ProductModel } from './components/models/ProductModel';
import { CartModel } from './components/models/CartModel';
import { BuyerModel } from './components/models/BuyerModel';
import { AppApi } from './components/AppApi';
import { Presenter } from './components/Presenter';
import { API_URL } from './utils/constants';
import { Api } from './components/base/Api';

console.log('=== Запуск приложения ===');

// Проверяем наличие необходимых элементов
console.log('Проверка DOM элементов:');
console.log('- Галерея:', document.querySelector('.gallery'));
console.log('- Modal container:', document.getElementById('modal-container'));
console.log('- Basket template:', document.getElementById('basket'));
console.log('- Card catalog template:', document.getElementById('card-catalog'));

// Создаём экземпляры моделей
const events = new EventEmitter();
const productModel = new ProductModel();
const cartModel = new CartModel();
const buyerModel = new BuyerModel();

// Создаём API
const baseApi = new Api(API_URL);
const api = new AppApi(baseApi);
console.log('API URL:', API_URL);

console.log('Модели созданы');

// Создаём Presenter
let presenter: Presenter;

try {
	presenter = new Presenter(events, productModel, cartModel, buyerModel, api);
	console.log('Presenter создан успешно');
} catch (error) {
	console.error('Ошибка создания Presenter:', error);
}

// Загружаем товары и инициализируем приложение
async function initApp() {
	try {
		console.log('Загрузка товаров с сервера...');
		const products = await api.getProductList();
		productModel.setItems(products);
		events.emit('items:changed');

		console.log('Приложение инициализировано');
	} catch (error) {
		console.error('Ошибка загрузки товаров:', error);

		// Используем тестовые данные
		const { apiProducts } = await import('./utils/data');
		productModel.setItems(apiProducts.items);
		events.emit('items:changed');
	}
	console.log('=== Инициализация завершена ===');
}

// Инициализация корзины в хедере
function initHeaderBasket() {
	const basketButton = document.querySelector('.header__basket');
	if (basketButton) {
		basketButton.addEventListener('click', () => {
			events.emit('basket:open');
		});
	} else {
		console.warn('Элемент .header__basket не найден в DOM');
	}
}



// Запускаем приложение
initHeaderBasket();
initApp();

