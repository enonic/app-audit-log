import { DatePicker, DatePickerBuilder } from 'lib-admin-ui/ui/time/DatePicker';

export function createDatePicker(id: string = null): HTMLElement {
    const time: Date = new Date();
    const builder: DatePickerBuilder = new DatePickerBuilder();
    builder.setDate(time);
    const datePicker: DatePicker = builder.build();
    const element: HTMLElement = datePicker.getHTMLElement();
    if (id) {
        element.setAttribute('id', id);
    }

    return element;
}
