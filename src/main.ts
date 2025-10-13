import './scss/styles.scss';

import { ProductModel } from './components/base/models/ProductModel';
import { CartModel } from './components/base/models/CartModel';
import { BuyerModel } from './components/base/models/BuyerModel';
import { AppApi } from './components/base/AppApi';
import { API_URL } from './utils/constants';

// Создаём экземпляры моделей
const productModel = new ProductModel();
const cartModel = new CartModel();
const buyerModel = new BuyerModel();

// Создаём API
const api = new AppApi();

// Тестируем ВСЕ методы моделей данных
async function testAllModels() {

  // Тестируем ProductModel
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
  
  const selectedProduct = testProducts[0];
  productModel.setSelectedProduct(selectedProduct);

  // Тестируем CartModel
  cartModel.addItem(testProducts[0]);
  cartModel.addItem(testProducts[1]);
  
  cartModel.removeItem('test-1');
  cartModel.clear();

  // Тестируем BuyerModel
  buyerModel.setData({ email: 'test@example.com' });
  
  buyerModel.setData({ phone: '+79991234567', address: 'Test Address' });
  
  buyerModel.setData({ payment: 'card' });
  
  buyerModel.clear();
}

// Получаем данные с сервера и сохраняем в модель
async function loadProductsFromServer() {
  try {
    const products = await api.getProductList();
    productModel.setItems(products);
    
  } catch (error) {
    console.error('Ошибка загрузки данных с сервера:', error);
    
    // Используем тестовые данные как fallback
    const { apiProducts } = await import('./utils/data');
    productModel.setItems(apiProducts.items);
  }
}

// Инициализация приложения
async function initApp() {
  // Тестируем все методы моделей
  await testAllModels();
  
  // Загружаем данные с сервера
  await loadProductsFromServer();
}

// Запускаем приложение
initApp();