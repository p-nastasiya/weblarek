import { Api } from './base/Api';
import { IProduct, IOrder } from '../types';

export class AppApi {
	private api: Api;

	constructor(api: Api) {
		this.api = api;
	}

	// Получить список товаров
	async getProductList(): Promise<IProduct[]> {
		try {
			const response = await this.api.get<{ items: IProduct[] }>('/product');
			return response.items;
		} catch (error) {
			console.error('Ошибка в getProductList:', error);
			throw error;
		}
	}

	// Отправить заказ
	async createOrder(order: IOrder): Promise<{ id: string, total: number }> {
		return await this.api.post<{ id: string, total: number }>('/order', order);
	}
}