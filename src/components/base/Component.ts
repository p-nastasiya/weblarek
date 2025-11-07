export class Component<T> {
	protected constructor(protected readonly container: HTMLElement) {
	}

	protected setText(element: HTMLElement | null, value: string) {
		if (element) {
			element.textContent = value;
		}
	}

	protected setDisabled(element: HTMLElement | null, state: boolean) {
		if (element) {
			if (state) {
				element.setAttribute('disabled', 'disabled');
			} else {
				element.removeAttribute('disabled');
			}
		}
	}

	protected setImage(element: HTMLImageElement | null, src: string, alt?: string) {
		if (element) {
			element.src = src;
			if (alt) {
				element.alt = alt;
			}
		}
	}

	render(data?: Partial<T>): HTMLElement {
		Object.assign(this as object, data ?? {});
		return this.container;
	}

	protected ensureElement<T extends HTMLElement>(selector: string): T {
		const element = this.container.querySelector<T>(selector);
		if (!element) {
			throw new Error(`Элемент ${selector} не найден`);
		}
		return element;
	}
}