import { Component } from '../base/Component';

// Modal не использует данные для рендеринга, поэтому используем any
export class Modal extends Component<any> {
	protected _closeButton: HTMLButtonElement | null;
	protected _content: HTMLElement | null;

	constructor(container: HTMLElement) {
		super(container);

		this._closeButton = this.container.querySelector('.modal__close');
		this._content = this.container.querySelector('.modal__content');

		if (this._closeButton) {
			this._closeButton.addEventListener('click', this.close.bind(this));
		}

		this.container.addEventListener('click', this.close.bind(this));

		if (this._content) {
			this._content.addEventListener('click', (event) => event.stopPropagation());
		}
	}

	set content(value: HTMLElement) {
		if (this._content) {
			this._content.replaceChildren(value);
		}
	}

	open() {
		this.container.classList.add('modal_active');
		document.addEventListener('keydown', this.handleEscape.bind(this));
	}

	close() {
		this.container.classList.remove('modal_active');
		if (this._content) {
			this._content.innerHTML = '';
		}
		document.removeEventListener('keydown', this.handleEscape.bind(this));
	}

	private handleEscape(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			this.close();
		}
	}
}