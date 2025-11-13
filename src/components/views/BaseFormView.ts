// BaseFormView.ts
import { Component } from '../base/Component';
import { IEvents } from '../base/Events';

export interface IForm {
	valid: boolean;
	errors: string;
}

export abstract class BaseFormView<T extends IForm> extends Component<T> {
	protected submitButton: HTMLButtonElement;
	protected errorsElement: HTMLElement;

	constructor(protected events: IEvents, container: HTMLElement) {
		super(container);

		this.submitButton = this.container.querySelector('button[type="submit"]')!;
		this.errorsElement = this.container.querySelector('.form__errors')!;

		this.container.addEventListener('submit', (event) => {
			event.preventDefault();
			this.events.emit(this.getSubmitEventName());
		});
	}

	set valid(value: boolean) {
		this.setDisabled(this.submitButton, !value);
	}

	set errors(value: string) {
		this.setText(this.errorsElement, value);
	}

	protected abstract getSubmitEventName(): string;
}