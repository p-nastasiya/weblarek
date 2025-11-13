import { ensureElement } from '../../../utils/utils';
import { Component } from '../../base/Component';

export interface IBaseCard {
	id: string;
	title: string;
	price: number | null;
}

// Card работает с данными товара IProduct (поля: название и цена)
export class BaseCardView<T extends IBaseCard = IBaseCard> extends Component<T> {
	protected titleElement: HTMLElement;
	protected priceElement: HTMLElement;
	protected _id: string = '';

	constructor(container: HTMLElement) {
		super(container);

		this.titleElement = ensureElement<HTMLElement>('.card__title', container);
		this.priceElement = ensureElement<HTMLElement>('.card__price', container);
	}


	set title(value: string) {
		this.setText(this.titleElement, value);
	}

	set price(value: number | null) {
		if (value === null) {
			this.setText(this.priceElement, 'Бесценно');
		} else {
			this.setText(this.priceElement, `${value} синапсов`);
		}
	}

    set id(value: string) {
        this._id = value; // Сохраняем в поле, а не в сеттер
    }

    get id(): string {
        return this._id;
    }

}


