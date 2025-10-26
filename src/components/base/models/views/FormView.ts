export abstract class FormView {
    protected form: HTMLFormElement;
    protected fields: Record<string, HTMLInputElement> = {};
    protected errors: Record<string, string> = {};

    constructor(formSelector: string) {
        this.form = document.querySelector(formSelector)!;
        this.setEventListeners();
    }

    abstract render(): HTMLElement;

    setEventListeners(): void {
    }

    getData(): Record<string, string> {
        return {};
    }

    validate(): boolean {
        return true;
    }
}