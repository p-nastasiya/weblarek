// SuccessView.ts
import { Component } from '../base/Component';
import { IEvents } from '../base/Events';

interface ISuccess {
	total: number;
}

export class SuccessView extends Component<ISuccess> {
	protected closeButton: HTMLButtonElement;
	protected descriptionElement: HTMLElement;

	constructor(protected events: IEvents, container: HTMLElement) {
		super(container);

		this.closeButton = this.container.querySelector('.order-success__close')!;
		this.descriptionElement = this.container.querySelector('.order-success__description')!;

		this.closeButton.addEventListener('click', () => {
			this.events.emit('success:close');
		});
	}

	set total(value: number) {
		this.setText(this.descriptionElement, `Списано ${value} синапсов`);
	}
}