// OrderView.ts
import { BaseFormView, IForm } from './BaseFormView';
import { IEvents } from '../base/Events';
import { ensureAllElements, ensureElement } from '../../utils/utils';

interface IOrder extends IForm {
	payment: string;
	address: string;
}

export class OrderView extends BaseFormView<IOrder> {
	protected paymentButtons: HTMLButtonElement[];
	protected addressInput: HTMLInputElement;

	constructor(protected events: IEvents, container: HTMLElement) {
		super(events, container);

		this.paymentButtons = ensureAllElements<HTMLButtonElement>('button[name]', this.container);
		this.addressInput = ensureElement<HTMLInputElement>('input[name="address"]', this.container);

		this.paymentButtons.forEach(button => {
			button.addEventListener('click', (e: Event) => {
				e.preventDefault();
				const target = e.target as HTMLButtonElement;
				const paymentMethod = target.name;
				this.events.emit('order:payment-change', { payment: paymentMethod });
			});
		});

		this.addressInput.addEventListener('input', () => {
			this.events.emit('order:address-change', { address: this.addressInput.value });
		});
	}

	set payment(value: string) {
		this.paymentButtons.forEach(button => {
			button.classList.toggle('button_alt-active', button.name === value);
		});
	}

	set address(value: string) {
		this.addressInput.value = value;
	}

	protected getSubmitEventName(): string {
		return 'order:submit';
	}
}