// OrderView.ts
import { BaseFormView, IForm } from './BaseFormView';
import { IEvents } from '../base/Events';

interface IOrder extends IForm {
	payment: string;
	address: string;
}

export class OrderView extends BaseFormView<IOrder> {
	protected paymentButtons: NodeListOf<HTMLButtonElement>;
	protected addressInput: HTMLInputElement;

	constructor(protected events: IEvents, container: HTMLElement) {
		super(events, container);

		this.paymentButtons = this.container.querySelectorAll('button[name]');
		this.addressInput = this.container.querySelector('input[name="address"]')!;

		this.setupEventListeners();
	}

	private setupEventListeners() {
		this.paymentButtons.forEach(button => {
			button.addEventListener('click', () => {
				// Добавляем визуальное выделение выбранной кнопки
				this.paymentButtons.forEach(btn => btn.classList.remove('button_alt-active'));
				button.classList.add('button_alt-active');

				this.events.emit('order:payment-change', { payment: button.name });
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