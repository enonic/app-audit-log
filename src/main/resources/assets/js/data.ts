import { Dropdown } from 'lib-admin-ui/ui/selector/dropdown/Dropdown';
import { Option } from 'lib-admin-ui/ui/selector/Option';

export function setDropDownTypes(dropdown: Dropdown<any>): void {
    CONFIG.allTypes.forEach((value) => {
        dropdown.addOption(Option.create<string>()
            .setValue(value)
            .setDisplayValue(value)
            .build());
    });
}
