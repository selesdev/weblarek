import { FormView } from "./FormView";

export class OrderPaymentFormView extends FormView {
    render(): HTMLElement {
        return this.form;
    }

    validate(): boolean {
        return true;
    }
}