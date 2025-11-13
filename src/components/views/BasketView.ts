import { Component } from '../base/Component';
import { IEvents } from '../base/Events';
import { IProduct } from '../../types';
import { BasketItemView } from './BasketItemView';

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

	// Метод для рендеринга корзины с товарами
	renderBasket(items: IProduct[], total: number): HTMLElement {
		const itemElements = items.map((product, index) => {
			return this.createBasketItem(product, index + 1);
		});

		this.items = itemElements;
		this.total = total;
		this.isEmpty = items.length === 0;

		return this.container;
	}

	// Приватный метод для создания элемента корзины
	private createBasketItem(product: IProduct, index: number): HTMLElement {
		const template = document.getElementById('card-basket') as HTMLTemplateElement;
		const itemElement = template.content.cloneNode(true) as DocumentFragment;
		const itemContainer = itemElement.firstElementChild as HTMLElement;

		const itemView = new BasketItemView(this.events, itemContainer);

		itemView.title = product.title;
		itemView.price = product.price;
		itemView.index = index;
		itemContainer.dataset.id = product.id;

		return itemContainer;
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