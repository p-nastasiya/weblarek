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

export interface IProductModel {
	setItems(items: IProduct[]): void;
	getItems(): IProduct[];
	getItem(id: string): IProduct | undefined;
}

// Покупатель
export interface IBuyer {
	payment: string; // 'card' или 'cash'
	email: string;
	phone: string;
	address: string;
}

export interface IBuyerModel {
	setData(data: Partial<IBuyer>): void;
	getData(): Partial<IBuyer>;
	clear(): void;
	validate(): Record<string, string>;
}

// Данные для отправки заказа на сервер
export interface IOrder {
	email: string;
	phone: string;
	address: string;
	payment: PaymentMethod;
	items: string[];
	total: number;
}

export interface ICartModel {
	getItems(): IProduct[];
	addItem(item: IProduct): void;
	removeItem(id: string): void;
	clear(): void;
	getTotal(): number;
	getCount(): number;
	hasItem(id: string): boolean;
}

export type PaymentMethod = 'card' | 'cash';