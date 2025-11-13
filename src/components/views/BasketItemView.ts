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

		this.indexElement = this.container.querySelector('.basket__item-index')!;
		this.deleteButton = this.container.querySelector('.basket__item-delete')!;

		this.deleteButton.addEventListener('click', () => {
			// Передаем объект с id вместо строки
			this.events.emit('basket:item-remove', { id: this.container.dataset.id });
		});
	}

	set index(value: number) {
		this.setText(this.indexElement, String(value));
	}
}