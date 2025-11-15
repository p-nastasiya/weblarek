import { IProduct, IProductModel } from "../../types";
import { IEvents } from "../base/Events";

export class ProductModel implements IProductModel {
	private _items: IProduct[] = [];
	private _selectedProduct: IProduct | null = null;

	constructor(private events: IEvents) { }

	// Сохранить массив товаров
	setItems(items: IProduct[]): void {
		this._items = items;
		this.events.emit('products:changed');
	}

	// Получить все товары
	getItems(): IProduct[] {
		return this._items;
	}

	// Получить товар по ID
	getItem(id: string): IProduct | undefined {
		return this._items.find(item => item.id === id);
	}

	// Сохранить выбранный товар
	setSelectedProduct(product: IProduct): void {
		this._selectedProduct = product;
		this.events.emit('product:selected');
	}

	// Получить выбранный товар
	getSelectedProduct(): IProduct | null {
		return this._selectedProduct;
	}
}