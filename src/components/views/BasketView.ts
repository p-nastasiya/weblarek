import { Component } from '../base/Component';
import { IEvents } from '../base/Events';

interface IBasket {
	items: HTMLElement[];
	total: number;
	isEmpty: boolean;
}

export class BasketView extends Component<IBasket> {
	protected listElement: HTMLElement;
	protected totalElement: HTMLElement;
	protected emptyElement: HTMLElement;
	protected checkoutButton: HTMLButtonElement;

	constructor(protected events: IEvents, container: HTMLElement) {
		super(container);

		this.listElement = this.container.querySelector('.basket__list')!;
		this.totalElement = this.container.querySelector('.basket__price')!;
		this.emptyElement = this.container.querySelector('.basket__empty')!;
		this.checkoutButton = this.container.querySelector('.basket__button')!;

		this.checkoutButton.addEventListener('click', () => {
			this.events.emit('basket:checkout');
		});
	}

	set items(value: HTMLElement[]) {
		this.listElement.replaceChildren(...value);
	}

	set total(value: number) {
		this.setText(this.totalElement, `${value} синапсов`);
	}

	set isEmpty(value: boolean) {
		this.emptyElement.style.display = value ? 'block' : 'none';
		this.setDisabled(this.checkoutButton, value);
	}
}