import * as Q from 'q';
import { Element } from '@enonic/lib-admin-ui/dom/Element';
import { Viewer } from '@enonic/lib-admin-ui/ui/Viewer';
import { Option } from '@enonic/lib-admin-ui/ui/selector/Option';
import { ListBox } from '@enonic/lib-admin-ui/ui/selector/list/ListBox';
import { FilterableListBoxWrapper } from '@enonic/lib-admin-ui/ui/selector/list/FilterableListBoxWrapper';
import { SelectionChange } from '@enonic/lib-admin-ui/util/SelectionChange';

export interface DropdownConfig {
    inputPlaceholderText: string;
    createOptionViewer: () => Viewer<string>;
    selectedOptionDisplayValue?: (option: Option<string>) => string;
}

class OptionListBox extends ListBox<string> {

    private optionsByValue: Map<string, Option<string>> = new Map();

    constructor(private createViewer: () => Viewer<string>) {
        super('dropdown-list');
    }

    addOption(option: Option<string>): void {
        this.optionsByValue.set(option.getValue(), option);
        this.addItems(option.getValue());
    }

    getOptionByValue(value: string): Option<string> {
        return this.optionsByValue.get(value);
    }

    protected createItemView(item: string): Element {
        const option = this.getOptionByValue(item);
        const viewer = this.createViewer();
        viewer.setObject(option.getDisplayValue());
        viewer.toggleClass('non-selectable', !option.isSelectable());
        return viewer;
    }

    protected getItemId(item: string): string {
        return item;
    }
}

export class Dropdown extends FilterableListBoxWrapper<string> {

    private optionSelectedListeners: ((option: Option<string> | null) => void)[] = [];
    private selectedOptionDisplayValue: (option: Option<string>) => string;
    private domBuilt: boolean = false;

    constructor(name: string, config: DropdownConfig) {
        super(new OptionListBox(config.createOptionViewer), {
            className: name,
            maxSelected: 1,
            filter: (item: string, searchString: string) => this.filterOption(item, searchString),
        });

        this.addClass('audit-log-dropdown');
        this.selectedOptionDisplayValue = config.selectedOptionDisplayValue || (option => option.getDisplayValue());
        this.optionFilterInput.setPlaceholder(config.inputPlaceholderText);

        this.onSelectionChanged((change: SelectionChange<string>) => {
            if (change.selected?.length > 0) {
                this.notifyOptionSelected(this.getOptionByValue(change.selected[0]));
            } else if (change.deselected?.length > 0 && this.getSelectedItems().length === 0) {
                this.notifyOptionSelected(null);
            }
        });
    }

    doRender(): Q.Promise<boolean> {
        if (this.domBuilt) {
            return Q(true);
        }
        this.domBuilt = true;
        return super.doRender();
    }

    render(deep: boolean = true): Q.Promise<boolean> {
        if (this.domBuilt) {
            return Q(true);
        }
        return super.render(deep);
    }

    protected doSelect(item: string): void {
        super.doSelect(item);
        this.optionFilterInput.setValue(this.selectedOptionDisplayValue(this.getOptionByValue(item)), true);
    }

    protected handleUserToggleAction(item: string): void {
        if (!this.getOptionByValue(item)?.isSelectable()) {
            return;
        }
        if (this.isSelected(item)) {
            this.hideDropdown();
            return;
        }
        super.handleUserToggleAction(item);
    }

    private filterOption(item: string, searchString: string): boolean {
        const search = searchString.toLowerCase();
        const option = this.getOptionByValue(item);
        return item.toLowerCase().indexOf(search) > -1 ||
            option.getDisplayValue().toLowerCase().indexOf(search) > -1;
    }

    addOption(option: Option<string>): void {
        this.getOptionListBox().addOption(option);
    }

    getOptionByValue(value: string): Option<string> {
        return this.getOptionListBox().getOptionByValue(value);
    }

    private getOptionListBox(): OptionListBox {
        return this.listBox as OptionListBox;
    }

    setValue(value: string, silent?: boolean): Dropdown {
        if (this.getOptionByValue(value)) {
            this.select(value, silent);
        }
        return this;
    }

    getValue(): string {
        return this.getSelectedItems()[0] || '';
    }

    reset(): void {
        this.deselectAll(true);
        this.optionFilterInput.setValue('', true);
    }

    onOptionSelected(listener: (option: Option<string> | null) => void): void {
        this.optionSelectedListeners.push(listener);
    }

    private notifyOptionSelected(option: Option<string> | null): void {
        this.optionSelectedListeners.forEach(listener => listener(option));
    }
}
