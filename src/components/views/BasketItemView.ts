import { ensureElement } from '../../utils/utils';
import { IEvents } from '../base/Events';
import { BaseCardView, IBaseCard } from './Card/BaseCardView';

interface IBasketItem extends IBaseCard {
	index: number;
}

export class BasketItemView extends BaseCardView<IBasketItem> {
	protected indexElement: HTMLElement;
	protected deleteButton: HTMLButtonElement;

	constructor(protected events: IEvents, container: HTMLElement) {
		super(container);

		this.indexElement = ensureElement<HTMLElement>('.basket__item-index', this.container);
		this.deleteButton = ensureElement<HTMLButtonElement>('.basket__item-delete', this.container);

		this.deleteButton.addEventListener('click', () => {
			this.events.emit('basket:item-remove', { id: this._id });
		});
	}

	set index(value: number) {
		this.setText(this.indexElement, String(value));
	}
}