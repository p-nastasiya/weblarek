import { Component } from '../base/Component';
import { IProduct } from '../../types';
import { CDN_URL, categoryMap } from '../../utils/constants';

interface ICardActions {
	onClick: (event: MouseEvent) => void;
}

// Card работает с данными товара IProduct
export class Card extends Component<IProduct> {
	protected _title: HTMLElement | null;
	protected _description: HTMLElement | null;
	protected _image: HTMLImageElement | null;
	protected _category: HTMLElement | null;
	protected _price: HTMLElement | null;
	protected _button: HTMLButtonElement | null;

	constructor(container: HTMLElement, actions?: ICardActions) {
		super(container);

		this._title = this.container.querySelector('.card__title');
		this._description = this.container.querySelector('.card__description');
		this._image = this.container.querySelector('.card__image');
		this._category = this.container.querySelector('.card__category');
		this._price = this.container.querySelector('.card__price');
		this._button = this.container.querySelector('.card__button');

		if (actions?.onClick) {
			if (this._button) {
				this._button.addEventListener('click', actions.onClick);
			} else {
				this.container.addEventListener('click', actions.onClick);
			}
		}
	}

	set id(value: string) {
		this.container.dataset.id = value;
	}

	set title(value: string) {
		this.setText(this._title, value);
	}

	set description(value: string) {
		const descriptionElement = this.container.querySelector('.card__text');
		if (descriptionElement) {
			descriptionElement.textContent = value;
		}
	}

	set image(value: string) {
		this.setImage(this._image, CDN_URL + value, value);
	}

	set category(value: string) {
		this.setText(this._category, value);
		if (this._category) {
			this._category.className = `card__category ${categoryMap[value as keyof typeof categoryMap] || 'card__category_other'}`;
		}
	}

	set price(value: number | null) {
		if (value === null) {
			this.setText(this._price, 'Бесценно');
			this.setDisabled(this._button, true);
			this.setText(this._button, 'Недоступно');
		} else {
			this.setText(this._price, `${value} синапсов`);
			this.setDisabled(this._button, false);
		}
	}

	set selected(value: boolean) {
		this.setText(this._button, value ? 'Удалить из корзины' : 'В корзину');
	}
}