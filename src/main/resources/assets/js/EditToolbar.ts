import { DivEl } from '@enonic/lib-admin-ui/dom/DivEl';
import { LabelEl } from '@enonic/lib-admin-ui/dom/LabelEl';
import { Toolbar } from '@enonic/lib-admin-ui/ui/toolbar/Toolbar';
import { DatePickerClear } from './DatePickerClear';
import { addUrlParam, getUrlParams, removeUrlParam } from './Urlparam';
import { Option } from '@enonic/lib-admin-ui/ui/selector/Option';
import { Element } from '@enonic/lib-admin-ui/dom/Element';
import { dateFromFormatDate, formatDate } from './util';
import { Dropdown } from '@enonic/lib-admin-ui/ui/selector/dropdown/Dropdown';
import { FormInputEl } from '@enonic/lib-admin-ui/dom/FormInputEl';
import { ResponsiveManager } from '@enonic/lib-admin-ui/ui/responsive/ResponsiveManager';
import { ModalDialog } from '@enonic/lib-admin-ui/ui/dialog/ModalDialog';
import { FilterActionButton } from './FilterActionButton';
import { DefaultOptionDisplayValueViewer } from '@enonic/lib-admin-ui/ui/selector/DefaultOptionDisplayValueViewer';

export class EditToolbar extends Toolbar {

    static emptyOptionValue: string = 'empty';
    static emptyOptionText: string = '<Clear selection>';

    responsiveRender: Boolean = false;
    filterEls: Element[] = [];
    filterModalButton: FilterActionButton;
    filterModal: FilterDiag;

    filters: {
        from: DatePickerClear;
        to: DatePickerClear;
        project: Dropdown<string>;
        user: Dropdown<string>;
        type: Dropdown<string>;
        fulltext: FormInputEl;
    };

    // Possible to refacor each event into a setable state.
    // So the selectionpanel could just set the different events.
    constructor() {
        super('tools');
        this.filterModalButton = new FilterActionButton();
        this.filterModal = new FilterDiag();
        this.filterModal.onHidden(() => {
            this.render();
        });


        const loadParams = getUrlParams();
        const fromDatePicker = new DatePickerClear('select-from');
        let inDate = new Date();

        if (loadParams.from) {
            if (loadParams.from !== 'empty') {
                inDate = dateFromFormatDate(loadParams.from);
                fromDatePicker.setDateTime(inDate);
                this.filterModalButton.addInfo('from', formatDate(inDate, true), false);
            }
        } else if (loadParams.from === undefined &&
            loadParams.to === undefined &&
            loadParams.user === undefined &&
            loadParams.type === undefined &&
            loadParams.q === undefined) {
            addUrlParam('from', formatDate(inDate, true));
            fromDatePicker.setDateTime(inDate);
            this.filterModalButton.addInfo('from', formatDate(inDate, true), false);
        }

        fromDatePicker.onClear = () => {
            fromDatePicker.resetBase();
            fromDatePicker.getTextInput().reset();
            addUrlParam('from', 'empty');

            this.optionsChanged();
            fromDatePicker.hidePopup();
            this.filterModalButton.removeInfo('from');
        };

        fromDatePicker.onSelectedDateTimeChanged(event => {
            const date = formatDate(event.getDate(), true);
            if (date != null) {
                addUrlParam('from', date);
                this.filterModalButton.addInfo('from', date);
            } else {
                addUrlParam('from', 'empty');
                this.filterModalButton.removeInfo('from');
            }
            fromDatePicker.hidePopup();
            this.optionsChanged();
        });

        const toDatePicker = new DatePickerClear('select-to');
        if (loadParams.to) {
            const toDate = dateFromFormatDate(loadParams.to);
            toDatePicker.setDateTime(toDate);
            this.filterModalButton.addInfo('to', formatDate(toDate, true), false);
        }

        toDatePicker.onClear = () => {
            toDatePicker.resetBase();
            toDatePicker.getTextInput().reset();
            removeUrlParam('to');
            this.optionsChanged();

            toDatePicker.hidePopup();
            this.filterModalButton.removeInfo('to');
        };

        toDatePicker.onSelectedDateTimeChanged(event => {
            const date = formatDate(event.getDate(), true);
            if (date != null) {
                addUrlParam('to', date);
                this.filterModalButton.addInfo('to', date);
            } else {
                removeUrlParam('to');
                this.filterModalButton.removeInfo('to');
            }
            toDatePicker.hidePopup();
            this.optionsChanged();
        });

        const project = this.createDropdown('project', 'Project', this.setProjectOptions);
        if (loadParams.project === undefined) {
            const projectDefaultOption = project.getOptionByValue('default');
            if (projectDefaultOption) {
                project.setValue('default', true);

                this.filterModalButton.addInfo('project', projectDefaultOption.getDisplayValue(), false);
            }
        }
        const user = this.createDropdown('user', 'User', this.setUserOptions);
        const type = this.createDropdown('type', 'Type', this.setTypeOptions);

        const searchInput = new FormInputEl('input', 'xp-admin-common-text-input form-input');
        searchInput.setId('free-text');
        let searchTimeout = null;

        searchInput.onInput(event => {
            if (searchTimeout !== null) {
                clearTimeout(searchTimeout);
            }
            searchTimeout = setTimeout(() => {
                const query = (<HTMLInputElement>event.target).value;
                if (query !== '') {
                    addUrlParam('q', query);
                    this.filterModalButton.addInfo('free-text', query);
                } else {
                    removeUrlParam('q');
                    this.filterModalButton.removeInfo('free-text');
                }
                this.optionsChanged();

            }, 500);
        });

        if (loadParams.q) {
            searchInput.setValue(loadParams.q, true);
            this.filterModalButton.addInfo('free-text', loadParams.q, false);
        }

        this.filters = {
            to: toDatePicker,
            from: fromDatePicker,
            project,
            user,
            type,
            fulltext: searchInput,
        };

        this.filterEls.push(
            this.labelAndWrapElement(fromDatePicker, 'From'),
            this.labelAndWrapElement(toDatePicker, 'To'),
            this.labelAndWrapElement(project, 'Project'),
            this.labelAndWrapElement(user, 'User'),
            this.labelAndWrapElement(type, 'Type'),
            this.labelAndWrapElement(searchInput, 'Free text'),
        );

        this.appendChildren(...this.filterEls);

        ResponsiveManager.onAvailableSizeChanged(this, () => setTimeout(this.responsiveResize.bind(this)));

        this.onShown(() => this.responsiveResize());
    }

    responsiveResize() {
        this.render(true);

        const toolBarWidth = this.getEl().getWidth();
        if (toolBarWidth < 700) {
            this.showModalFilters(false);
        } else {
            this.showModalFilters(true);
        }
    }

    showModalFilters(largeRender: Boolean) {
        if (largeRender === false) {
            if (this.responsiveRender === false) {
                const button = this.filterModalButton;
                const action = button.getAction();

                button.addClass('filter-button');
                this.filterEls.forEach(filter => {
                    this.filterModal.appendChildToContentPanel(filter);
                });
                action.onExecuted(() => {
                    this.filterModal.open();
                });
                button.renderInfoText();
                this.appendChildren(button);

                this.forceRender();
                this.responsiveRender = true;
            }
        } else {
            if (this.responsiveRender === true) {
                this.removeChild(this.filterModalButton);
                this.appendChildren(...this.filterEls);

                this.forceRender();
                this.responsiveRender = false;
            }
        }
    }

    createDropdown(name: string, placeholder: string, setOptions: (dropdown: Dropdown<string>) => void): Dropdown<string> {
        const dropdown: Dropdown<string> = new Dropdown(name.toLowerCase(), {
            inputPlaceholderText: placeholder,
            rowHeight: 30,
            optionDisplayValueViewer: new AuditLogFilterOptionViewer(),
        });
        dropdown.setId(`select-${name}`);
        dropdown.onOptionSelected(event => {
            const option = event.getOption();
            const displayName: string = option.getDisplayValue();
            const value: string = option.getValue();
            if (value === 'empty') {
                dropdown.reset();
                if (name === 'project') {
                    addUrlParam(name, 'empty');
                } else {
                    removeUrlParam(name);
                }
                this.filterModalButton.removeInfo(name);
            } else {
                if (name === 'type' && displayName !== value) {
                    this.updateSelectedOption(dropdown, value);
                }
                addUrlParam(name, event.getOption().getValue());
                this.filterModalButton.addInfo(name, value);
            }
            this.optionsChanged();
        });

        const loadParam = getUrlParams()[name];

        setOptions.bind(this)(dropdown);

        if (loadParam !== 'empty' && loadParam !== undefined) {
            dropdown.setValue(loadParam, true);
            if (name === 'type') {
                this.updateSelectedOption(dropdown, loadParam);
            }

            this.filterModalButton.addInfo(name, loadParam, false);
        }

        return dropdown;
    }

    optionsChanged() {
        this.getHTMLElement().dispatchEvent(new CustomEvent('optionsChanged', { bubbles: true }));
    }

    labelAndWrapElement(element: Element, labelText: string) {
        const wrapper = new DivEl('wrapper');
        const labelEl: Element = new LabelEl(labelText, element);

        wrapper.appendChildren(
            labelEl,
            element
        );

        return wrapper;
    }

    setTypeOptions(dropdown: Dropdown<string>): void {
        this.addClearValueOption(dropdown);

        let lastActionGroup: string = '';
        CONFIG.allTypes.forEach((value) => {
            const actionType: string = value.key.toString();
            const splitActionType: string[] = actionType.split('.');
            const thisActionGroup: string = splitActionType.length > 2 ? `${splitActionType[0]}.${splitActionType[1]}` : '';
            if (thisActionGroup !== lastActionGroup) {
                this.addDropdownOption(dropdown, thisActionGroup, thisActionGroup, false);
                lastActionGroup = thisActionGroup;
            }
            this.addDropdownOption(dropdown, actionType, actionType.replace(thisActionGroup, ''));
        });
    }

    setUserOptions(dropdown: Dropdown<string>): void {
        this.addClearValueOption(dropdown);
        CONFIG.allUsers.forEach((value) => {
            this.addDropdownOption(dropdown, value.key, value.name);
        });
    }

    setProjectOptions(dropdown: Dropdown<string>): void {
        this.addClearValueOption(dropdown);

        CONFIG.projects.forEach((project) => {
            this.addDropdownOption(dropdown, project.id, project.name);
        });
    }

    private createOption(value: string, displayValue?: string, selectable: boolean = true): Option<string> {
        return Option.create()
            .setSelectable(selectable)
            .setValue(value)
            .setDisplayValue(displayValue || value)
            .build() as Option<string>;
    }

    private updateSelectedOption(dropdown: Dropdown<string>, displayValue: string): void {
        const displayOption: Option<string> = this.createOption(displayValue);
        dropdown.getSelectedOptionView().setOption(displayOption);
    }

    private addDropdownOption(dropdown: Dropdown<string>, value: string, displayValue?: string, selectable: boolean = true): void {
        // Option interface is missing methods? and the optionBuilder?
        dropdown.addOption(this.createOption(value, displayValue, selectable));
    }

    private addClearValueOption(dropdown: Dropdown<string>): void {
        this.addDropdownOption(dropdown, EditToolbar.emptyOptionValue, EditToolbar.emptyOptionText);
    }
}

class FilterDiag extends ModalDialog {
    constructor() {
        super();
        this.addCancelButtonToBottom('Apply');
    }
}

class AuditLogFilterOptionViewer
    extends DefaultOptionDisplayValueViewer {

    setObject(text: string) {
        this.toggleClass('empty-option', text === EditToolbar.emptyOptionText);

        return super.setObject(text);
    }
}
