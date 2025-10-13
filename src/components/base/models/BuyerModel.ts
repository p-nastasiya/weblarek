import { IBuyer } from '../../../types';

export class BuyerModel {
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

  // Валидация данных
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

  // Проверить, валидны ли данные
  isValid(): boolean {
    return Object.keys(this.validate()).length === 0;
  }
}