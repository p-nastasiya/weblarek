// BuyerModel.ts
import { IBuyer, IBuyerModel } from '../../types';
import { IEvents } from '../base/Events';

export class BuyerModel implements IBuyerModel {
	private _data: Partial<IBuyer> = {};
	protected event: IEvents;

	constructor(event: IEvents) {
		this.event = event;
	}

	// Сохранить данные покупателя
	setData(data: Partial<IBuyer>): void {
		this._data = { ...this._data, ...data };
		this.event.emit('buyer:data-change');
	}

	// Получить все данные
	getData(): Partial<IBuyer> {
		return this._data;
	}

	// Очистить данные
	clear(): void {
		this._data = {};
		this.event.emit('buyer:data-cleared');
	}

	// Валидация данных (полная)
	validate(): Record<string, string> {
		const errors: Record<string, string> = {};

		if (!this._data.payment) {
			errors.payment = 'Не выбран способ оплаты';
		}
		if (!this._data.address) {
			errors.address = 'Укажите адрес доставки';
		}
		if (!this._data.email) {
			errors.email = 'Укажите email';
		}
		if (!this._data.phone) {
			errors.phone = 'Укажите телефон';
		}
		return errors;
	}

	// Проверить, валидны ли все данные
	isValid(): boolean {
		return Object.keys(this.validate()).length === 0;
	}
}
