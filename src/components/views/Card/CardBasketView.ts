import { ensureElement } from '../../../utils/utils'
import { BaseCardView, IBaseCard } from './BaseCardView'
import { IEvents } from '../../base/Events'


export interface ICardBasket extends IBaseCard {
	index: number;
}

export class CardBasket extends BaseCardView<ICardBasket> {
	protected indexElement: HTMLElement;
	protected deleteButton: HTMLButtonElement;

	constructor(protected events: IEvents, container: HTMLElement) {
		super(container);

		this.indexElement = ensureElement<HTMLElement>('.basket__item-index', this.container);
		this.deleteButton = ensureElement<HTMLButtonElement>('.basket__item-delete', this.container);

		this.deleteButton.addEventListener('click', () => {
			this.events.emit('basket:remove', { card: this });
		});
	}

	set index(value: number) {
		this.setText(this.indexElement, String(value));
	}
}
