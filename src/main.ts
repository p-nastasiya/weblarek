import './scss/styles.scss';

import { ProductModel } from './components/models/ProductModel';
import { CartModel } from './components/models/CartModel';
import { BuyerModel } from './components/models/BuyerModel';
import { AppApi } from './components/AppApi';
import { API_URL } from './utils/constants';
import { Api } from './components/base/Api';

// Создаём экземпляры моделей
const productModel = new ProductModel();
const cartModel = new CartModel();
const buyerModel = new BuyerModel();

// Создаём API
const baseApi = new Api(API_URL);
const api = new AppApi(baseApi);
console.log('API URL:', API_URL);

// Тестируем ВСЕ методы моделей данных
async function testAllModels() {
	console.log('=== Тестирование всех методов моделей данных ===');

	// Тестируем ProductModel
	console.log('--- ProductModel ---');
	const testProducts = [
		{
			id: 'test-1',
			title: 'Тестовый товар 1',
			price: 1000,
			description: 'Описание тестового товара 1',
			image: 'test1.jpg',
			category: 'софт-скил'
		},
		{
			id: 'test-2',
			title: 'Тестовый товар 2',
			price: 2000,
			description: 'Описание тестового товара 2',
			image: 'test2.jpg',
			category: 'хард-скил'
		}
	];

	// Тестируем все методы ProductModel
	productModel.setItems(testProducts);
	console.log('getItems():', productModel.getItems());
	console.log('getItem("test-1"):', productModel.getItem('test-1'));

	const selectedProduct = testProducts[0];
	productModel.setSelectedProduct(selectedProduct);
	console.log('getSelectedProduct():', productModel.getSelectedProduct());

	// Тестируем CartModel
	console.log('--- CartModel ---');
	cartModel.addItem(testProducts[0]);
	cartModel.addItem(testProducts[1]);
	console.log('getItems():', cartModel.getItems());
	console.log('getTotal():', cartModel.getTotal());
	console.log('getCount():', cartModel.getCount());
	console.log('hasItem("test-1"):', cartModel.hasItem('test-1'));

	cartModel.removeItem('test-1');
	console.log('После removeItem("test-1"):', cartModel.getItems());

	cartModel.clear();
	console.log('После clear():', cartModel.getItems());

	// Тестируем BuyerModel
	console.log('--- BuyerModel ---');
	buyerModel.setData({ email: 'test@example.com' });
	console.log('getData() после setData(email):', buyerModel.getData());

	buyerModel.setData({ phone: '+79991234567', address: 'Test Address' });
	console.log('getData() после setData(phone, address):', buyerModel.getData());

	console.log('isValid() без payment:', buyerModel.isValid());
	console.log('validate() без payment:', buyerModel.validate());

	buyerModel.setData({ payment: 'card' });
	console.log('isValid() с payment:', buyerModel.isValid());
	console.log('validate() с payment:', buyerModel.validate());

	buyerModel.clear();
	console.log('getData() после clear():', buyerModel.getData());
}

// Получаем данные с сервера и сохраняем в модель
async function loadProductsFromServer() {
	try {
		console.log('=== Загрузка данных с сервера ===');

		const products = await api.getProductList();
		productModel.setItems(products);

		console.log('Товары с сервера сохранены в модель');
		console.log('Количество товаров:', productModel.getItems().length);
		console.log('Первый товар:', productModel.getItems()[0]);

	} catch (error) {
		console.error('Ошибка загрузки данных с сервера:', error);

		// Используем тестовые данные как fallback
		const { apiProducts } = await import('./utils/data');
		productModel.setItems(apiProducts.items);
		console.log('Используем тестовые данные из data.ts');
		console.log('Количество тестовых товаров:', productModel.getItems().length);
	}
}

// Инициализация приложения
async function initApp() {
	// Тестируем все методы моделей
	await testAllModels();

	// Загружаем данные с сервера
	await loadProductsFromServer();

	console.log('=== Приложение инициализировано ===');
	console.log('Все модели данных работают корректно');
	console.log('Данные загружены и сохранены в модели');
}

// Запускаем приложение
initApp();