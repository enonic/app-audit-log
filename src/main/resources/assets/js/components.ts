import { PropertySet } from 'lib-admin-ui/data/PropertySet';
import { FormBuilder } from 'lib-admin-ui/form/Form';
import { FormContext } from 'lib-admin-ui/form/FormContext';
import { FormView } from 'lib-admin-ui/form/FormView';
import { FormItemBuilder } from 'lib-admin-ui/ui/form/FormItem';
import { DatePicker, DatePickerBuilder } from 'lib-admin-ui/ui/time/DatePicker';
import { Picker } from 'lib-admin-ui/ui/time/Picker';
import { TextInput } from 'lib-admin-ui/ui/text/TextInput';
import { LabelEl } from 'lib-admin-ui/dom/LabelEl';

export function createDatePicker(id: string = null): DatePicker {
    const builder: DatePickerBuilder = new DatePickerBuilder();
    const datePicker: DatePicker = builder.build();

    if (id) {
        datePicker.getEl().setId(id);
    }

    return datePicker;
}

