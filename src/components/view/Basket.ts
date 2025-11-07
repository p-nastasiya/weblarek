import { Component } from '../base/Component';
import { IProduct } from '../../types';

interface IBasketActions {
	onCheckout: () => void;
	onRemove: (id: string) => void;
}

export class Basket extends Component<any> {
	public getContainer(): HTMLElement {
		return this.container;
	}
	protected _list: HTMLElement | null;
	protected _total: HTMLElement | null;
	protected _button: HTMLButtonElement | null;
	protected _emptyMessage: HTMLElement | null;

	constructor(container: HTMLElement, actions?: IBasketActions) {
		super(container);

		this._list = this.container.querySelector('.basket__list');
		this._total = this.container.querySelector('.basket__price');
		this._button = this.container.querySelector('.basket__button');
		this._emptyMessage = this.container.querySelector('.basket__empty');


		if (actions?.onCheckout) {
			this._button?.addEventListener('click', actions.onCheckout);
		}
	}

	set items(items: HTMLElement[]) {
		if (this._list) {
			this._list.replaceChildren(...items);
			this.updateEmptyState(items.length === 0);
		}
	}

	set total(value: number) {
		this.setText(this._total, `${value} синапсов`);
	}

	set selected(items: IProduct[]) {
		const isEmpty = items.length === 0;
		this.setDisabled(this._button, isEmpty);
		this.updateEmptyState(isEmpty);
	}

	private updateEmptyState(isEmpty: boolean) {
		// Управляем видимостью сообщения "Корзина пуста"
		if (this._emptyMessage) {
			this._emptyMessage.style.display = isEmpty ? 'block' : 'none';
		}

	}
}