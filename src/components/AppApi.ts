import { Api } from './base/Api';
import { IProduct, IOrder } from '../types';
// import { API_URL } from '../../utils/constants';

export class AppApi {
	private baseApi: Api;

	constructor(baseApi: Api) {
		this.baseApi = baseApi;
	}

	// Получить список товаров
	async getProductList(): Promise<IProduct[]> {
		try {
			const response = await this.baseApi.get<{ items: IProduct[] }>('/product');
			return response.items;
		} catch (error) {
			console.error('Ошибка в getProductList:', error);
			throw error;
		}
	}

	// Отправить заказ
	async createOrder(order: IOrder): Promise<{ id: string }> {
		return await this.baseApi.post<{ id: string }>('/order', order);
	}

	// Геттер для baseUrl (для отладки)
	get baseUrl(): string {
		return this.baseApi.baseUrl;
	}
}