// BuyerModel.ts
import { IBuyer, IBuyerModel } from '../../types';

export class BuyerModel implements IBuyerModel {
	private _data: Partial<IBuyer> = {};

	// Сохранить данные покупателя
	setData(data: Partial<IBuyer>): void {
		this._data = { ...this._data, ...data };
	}

	// Получить все данные
	getData(): Partial<IBuyer> {
		return this._data;
	}

	// Очистить данные
	clear(): void {
		this._data = {};
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

	// Валидация первого шага (оплата и адрес)
	validateFirstStep(): Record<string, string> {
		const errors: Record<string, string> = {};

		if (!this._data.payment) {
			errors.payment = 'Не выбран способ оплаты';
		}
		if (!this._data.address) {
			errors.address = 'Укажите адрес доставки';
		}

		return errors;
	}

	// Валидация второго шага (контакты)
	validateSecondStep(): Record<string, string> {
		const errors: Record<string, string> = {};

		if (!this._data.email) {
			errors.email = 'Укажите email';
		}
		if (!this._data.phone) {
			errors.phone = 'Укажите телефон';
		}

		return errors;
	}

	// Проверка валидности первого шага
	isFirstStepValid(): boolean {
		return Object.keys(this.validateFirstStep()).length === 0;
	}

	// Проверка валидности второго шага  
	isSecondStepValid(): boolean {
		return Object.keys(this.validateSecondStep()).length === 0;
	}
}