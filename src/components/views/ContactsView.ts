// ContactsView.ts
import { BaseFormView, IForm } from './BaseFormView';
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';

interface IContacts extends IForm {
	email: string;
	phone: string;
}

export class ContactsView extends BaseFormView<IContacts> {
	protected emailInput: HTMLInputElement;
	protected phoneInput: HTMLInputElement;

	constructor(protected events: IEvents, container: HTMLElement) {
		super(events, container);

		this.emailInput = ensureElement<HTMLInputElement>('input[name="email"]', this.container);
		this.phoneInput = ensureElement<HTMLInputElement>('input[name="phone"]', this.container);

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