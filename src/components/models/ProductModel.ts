import { IProduct } from "../../types";

export class ProductModel {
	private _items: IProduct[] = [];
	private _selectedProduct: IProduct | null = null;

	// Сохранить массив товаров
	setItems(items: IProduct[]): void {
		this._items = items;
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
	}

	// Получить выбранный товар
	getSelectedProduct(): IProduct | null {
		return this._selectedProduct;
	}
}