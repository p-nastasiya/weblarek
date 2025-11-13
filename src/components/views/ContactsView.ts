// ContactsView.ts
import { BaseFormView, IForm } from './BaseFormView';
import { IEvents } from '../base/Events';

interface IContacts extends IForm {
	email: string;
	phone: string;
}

export class ContactsView extends BaseFormView<IContacts> {
	protected emailInput: HTMLInputElement;
	protected phoneInput: HTMLInputElement;

	constructor(protected events: IEvents, container: HTMLElement) {
		super(events, container);

		this.emailInput = this.container.querySelector('input[name="email"]')!;
		this.phoneInput = this.container.querySelector('input[name="phone"]')!;

		this.setupEventListeners();
	}

	private setupEventListeners() {
		this.emailInput.addEventListener('input', () => {
			this.events.emit('contacts:email-change', { email: this.emailInput.value });
		});

		this.phoneInput.addEventListener('input', () => {
			this.events.emit('contacts:phone-change', { phone: this.phoneInput.value });
		});
	}

	set email(value: string) {
		this.emailInput.value = value;
	}

	set phone(value: string) {
		this.phoneInput.value = value;
	}

	protected getSubmitEventName(): string {
		return 'contacts:submit';
	}
}