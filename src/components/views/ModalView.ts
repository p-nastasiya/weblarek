import { Component } from '../base/Component';
import { IEvents } from '../base/Events';

interface IModal {
	content: HTMLElement;
}

export class ModalView extends Component<IModal> {
	protected closeButton: HTMLButtonElement;
	protected contentElement: HTMLElement;

	constructor(protected events: IEvents, container: HTMLElement) {
		super(container);

		this.closeButton = this.container.querySelector('.modal__close')!;
		this.contentElement = this.container.querySelector('.modal__content')!;

		this.closeButton.addEventListener('click', () => this.close());
		this.container.addEventListener('click', (event) => {
			if (event.target === this.container) this.close();
		});

		// Закрытие по ESC
		document.addEventListener('keydown', (event) => {
			if (event.key === 'Escape') this.close();
		});
	}

	set content(value: HTMLElement) {
		this.contentElement.replaceChildren(value);
	}

	open() {
		this.container.classList.add('modal_active');
	}

	close() {
		this.container.classList.remove('modal_active');
		this.contentElement.innerHTML = '';
	}
}