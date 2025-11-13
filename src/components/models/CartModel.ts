import { ICartModel as ICartModel, IProduct } from "../../types";
import { IEvents } from "../base/Events";

export class CartModel implements ICartModel {
	private _items: IProduct[] = [];
	protected event: IEvents;

	constructor(event: IEvents) {
		this.event = event;
	}

	// Получить все товары в корзине
	getItems(): IProduct[] {
		return this._items;
	}

	// Добавить товар в корзину
	addItem(item: IProduct): void {
		this._items.push(item);
		this.event.emit('cart:change');
	}

	//Удалить товар из корзины по ID
	removeItem(id: string): void {
		this._items = this._items.filter(item => item.id !== id);
		this.event.emit('cart:change');

	}

	// Очистить корзину
	clear(): void {
		this._items = [];
		this.event.emit('cart:change');
	}

	// Получить общую стоимость
	getTotal(): number {
		return this._items.reduce((total, item) => total + (item.price || 0), 0);
	}

	//Получить количество товаров
	getCount(): number {
		return this._items.length;
	}

	// Проверить, есть ли товар в корзине
	hasItem(id: string): boolean {
		return this._items.some(item => item.id === id);
	}
}