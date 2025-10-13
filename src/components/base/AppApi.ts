import { Api } from './Api';
import { IProduct, IOrder } from '../../types';
import { API_URL } from '../../utils/constants';

export class AppApi {
  private api: Api;

  constructor(baseUrl: string = API_URL) {
    this.api = new Api(baseUrl);
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
  async createOrder(order: IOrder): Promise<{ id: string }> {
    return await this.api.post<{ id: string }>('/order', order);
  }

  // Геттер для baseUrl (для отладки)
  get baseUrl(): string {
    return this.api.baseUrl;
  }
}