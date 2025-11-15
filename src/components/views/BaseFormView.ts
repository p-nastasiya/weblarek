// BaseFormView.ts
import { ensureElement } from '../../utils/utils';
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

		this.submitButton = ensureElement<HTMLButtonElement>('button[type="submit"]', this.container);
		this.errorsElement = ensureElement<HTMLElement>('.form__errors', this.container);

		this.container.addEventListener('submit', (e: Event) => {
			e.preventDefault();
			this.events.emit(`${this.getSubmitEventName()}`);
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