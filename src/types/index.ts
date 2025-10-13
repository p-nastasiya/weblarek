export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';

export interface IApi {
	get<T extends object>(uri: string): Promise<T>;
	post<T extends object>(uri: string, data: object, method?: ApiPostMethods): Promise<T>;
}

// Товар
export interface IProduct {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number | null;
}

// Покупатель
export interface IBuyer {
	payment: string; // 'card' или 'cash'
	email: string;
	phone: string;
	address: string;
}

// Данные для отправки заказа на сервер
export interface IOrder {
	payment: string;
	email: string;
	phone: string;
	address: string;
	total: number;
	items: string[]; // массив id товаров
}
