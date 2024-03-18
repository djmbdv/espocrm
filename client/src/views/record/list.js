/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

/** @module views/record/list */

import View from 'view';
import MassActionHelper from 'helpers/mass-action';
import ExportHelper from 'helpers/export';
import RecordModal from 'helpers/record-modal';
import SelectProvider from 'helpers/list/select-provider';
import RecordListSettingsView from 'views/record/list/settings';
import ListSettingsHelper from 'helpers/list/settings';
import StickyBarHelper from 'helpers/list/misc/sticky-bar';

/**
 * A record-list view. Renders and processes list items, actions.
 *
 * @todo Document all options.
 */
class ListRecordView extends View {

    /**
     * A row action.
     *
     * @typedef {Object} module:views/record/list~rowAction
     *
     * @property {string} action An action.
     * @property {string} [label] A label.
     * @property {string} [link] A link.
     * @property {string} [text] A text.
     * @property {Object.<string, string|number|boolean>} [data] Data attributes.
     */

    /** @inheritDoc */
    template = 'record/list'

    /**
     * A type. Can be 'list', 'listSmall'.
     */
    type = 'list'

    /** @inheritDoc */
    name = 'list'

    // noinspection JSUnusedGlobalSymbols
    /**
     * A presentation type.
     */
    presentationType = 'table'

    /**
     * If true checkboxes will be shown. Can be overridden by an option parameter.
     *
     * @protected
     */
    checkboxes = true

    /**
     * If true clicking on the record link will trigger 'select' event with model passed.
     * Can be overridden by an option parameter.
     */
    selectable = false

    /**
     * A row-actions view. A dropdown on the right side.
     *
     * @protected
     * @type {string}
     */
    rowActionsView = 'views/record/row-actions/default'

    /**
     * Disable row-actions. Can be overridden by an option parameter.
     */
    rowActionsDisabled = false

    /**
     * An entity type. Set automatically.
     *
     * @type {string|null}
     */
    entityType = null

    /**
     * A scope. Set automatically.
     *
     * @type {?string}
     */
    scope = null

    /** @protected */
    _internalLayoutType = 'list-row'

    /**
     * A selector to a list container.
     *
     * @protected
     */
    listContainerEl = '.list > table > tbody'

    /**
     * To show number of records. Can be overridden by an option parameter.
     *
     * @protected
     */
    showCount = true

    /** @protected */
    rowActionsColumnWidth = 25

    /** @protected */
    checkboxColumnWidth = 40

    /** @protected */
    minColumnWidth = 100

    /**
     * A button. Handled by a class method `action{Name}` or a handler.
     *
     * @typedef {Object} module:views/record/list~button
     *
     * @property {string} name A name.
     * @property {string} label A label. To be translated in a current scope.
     * @property {'default'|'danger'|'warning'|'success'} [style] A style.
     * @property {boolean} [hidden] Hidden.
     * @property {function()} [onClick] A click handler.
     */

    /**
     * A button list.
     *
     * @protected
     * @type {module:views/record/list~button[]}
     */
    buttonList = []

    /**
     * A dropdown item. Handled by a class method `action{Name}` or a handler.
     *
     * @typedef {Object} module:views/record/list~dropdownItem
     *
     * @property {string} name A name.
     * @property {string} [label] A label. To be translated in a current scope.
     * @property {string} [html] An HTML.
     * @property {boolean} [hidden] Hidden.
     * @property {function()} [onClick] A click handler.
     */

    /**
     * A dropdown item list. Can be overridden by an option parameter.
     *
     * @protected
     * @type {module:views/record/list~dropdownItem[]}
     */
    dropdownItemList = []

    /**
     * Disable a header. Can be overridden by an option parameter.
     *
     * @protected
     */
    headerDisabled = false

    /**
     * Disable mass actions. Can be overridden by an option parameter.
     *
     * @protected
     */
    massActionsDisabled = false

    /**
     * Disable a portal layout usage. Can be overridden by an option parameter.
     *
     * @protected
     */
    portalLayoutDisabled = false

    /**
     * Mandatory select attributes. Can be overridden by an option parameter.
     * Attributes to be selected regardless being on a layout.
     *
     * @protected
     * @type {string[]|null}
     */
    mandatorySelectAttributeList = null

    /**
     * A layout name. If null, a value from `type` property will be used.
     * Can be overridden by an option parameter.
     *
     * @protected
     * @type {string|null}
     */
    layoutName = null

    /**
     * A scope name for layout loading. If null, an entity type of collection will be used.
     * Can be overridden by an option parameter.
     *
     * @protected
     * @type {string|null}
     */
    layoutScope = null

    /**
     * To disable field-level access check for a layout.
     * Can be overridden by an option parameter.
     *
     * @protected
     */
    layoutAclDisabled = false

    /**
     * A setup-handler type.
     *
     * @protected
     */
    setupHandlerType = 'record/list'

    /**
     * @internal
     * @private
     */
    checkboxesDisabled = false

    /**
     * Force displaying the top bar even if empty. Can be overridden by an option parameter.
     * @protected
     */
    forceDisplayTopBar = false

    /**
     * Where to display the pagination. Can be overridden by an option parameter.
     *
     * @protected
     * @type {boolean}
     */
    pagination = false

    /**
     * To display a table header with column names. Can be overridden by an option parameter.
     *
     * @protected
     * @type {boolean}
     */
    header = true

    /**
     * A show-more button. Can be overridden by an option parameter.
     *
     * @protected
     */
    showMore = true

    /**
     * A mass-action list.
     *
     * @protected
     * @type {string[]}
     */
    massActionList = [
        'remove',
        'merge',
        'massUpdate',
        'export',
    ]

    /**
     * A mass-action list available when selecting all results.
     *
     * @protected
     * @type {string[]}
     */
    checkAllResultMassActionList = [
        'remove',
        'massUpdate',
        'export',
    ]

    /**
     * A forced mass-action list.
     *
     * @protected
     * @type {?string[]}
     */
    forcedCheckAllResultMassActionList = null

    /**
     * Disable quick-detail (viewing a record in modal)
     *
     * @protected
     */
    quickDetailDisabled = false

    /**
     * Disable quick-edit (editing a record in modal)
     *
     * @protected
     */
    quickEditDisabled = false

    /**
     * Force settings.
     *
     * @protected
     * @type {boolean}
     */
    forceSettings = false

    /**
     * Disable settings.
     *
     * @protected
     * @type {boolean}
     */
    settingsDisabled = false

    /**
     * Column definitions.
     *
     * @typedef module:views/record/list~columnDefs
     * @type {Object}
     * @property {string} name A name (usually a field name).
     * @property {string} [view] An overridden field view name.
     * @property {number} [width] A width in percents.
     * @property {number} [widthPx] A width in pixels.
     * @property {boolean} [link] To use `listLink` mode (link to the detail view).
     * @property {'left'|'right'} [align] An alignment.
     * @property {string} [type] An overridden field type.
     * @property {Object.<string, *>} [params] Overridden field parameters.
     * @property {Object.<string, *>} [options] Field view options.
     * @property {string} [label] A label.
     * @property {boolean} [notSortable] Not sortable.
     * @property {boolean} [hidden] Hidden by default.
     * @property {boolean} [noLabel] No label.
     * @property {string} [customLabel] A custom label.
     */

    /**
     * A list layout. Can be overridden by an option parameter.
     * If null, then will be loaded from the backend (using the `layoutName` value).
     *
     * @protected
     * @type {module:views/record/list~columnDefs[]|null}
     */
    listLayout = null

    /** @private */
    _internalLayout = null

    /**
     * A list of record IDs currently selected. Only for reading.
     *
     * @protected
     * @type {string[]|null}
     */
    checkedList = null

    /**
     * Whether all results currently selected. Only for reading.
     *
     * @protected
     */
    allResultIsChecked = false

    /**
     * Disable the ability to select all results. Can be overridden by an option parameter.
     *
     * @protected
     */
    checkAllResultDisabled = false

    /**
     * Disable buttons. Can be overridden by an option parameter.
     *
     * @protected
     */
    buttonsDisabled = false

    /**
     * Disable edit. Can be overridden by an option parameter.
     *
     * @protected
     */
    editDisabled = false

    /**
     * Disable remove. Can be overridden by an option parameter.
     *
     * @protected
     */
    removeDisabled = false

    /**
     * Disable a stick-bar. Can be overridden by an option parameter.
     *
     * @protected
     */
    stickedBarDisabled = false

    /**
     * Disable the follow/unfollow mass action.
     *
     * @protected
     */
    massFollowDisabled = false

    /**
     * Disable the print-pdf mass action.
     *
     * @protected
     */
    massPrintPdfDisabled = false

    /**
     * Disable the convert-currency mass action.
     *
     * @protected
     */
    massConvertCurrencyDisabled = false

    /**
     * Disable mass-update.
     *
     * @protected
     */
    massUpdateDisabled = false

    /**
     * Disable export.
     *
     * @protected
     */
    exportDisabled = false

    /**
     * Disable merge.
     *
     * @protected
     */
    mergeDisabled = false

    /**
     * Disable a no-data label (when no result).
     *
     * @protected
     */
    noDataDisabled = false

    /**
     * Disable pagination.
     *
     * @protected
     */
    paginationDisabled = false

    /** @private */
    _$focusedCheckbox = null

    /**
     * @protected
     * @type {?JQuery}
     */
    $selectAllCheckbox = null

    /**
     * @protected
     * @type {?Object.<string, Object.<string, *>>}
     */
    massActionDefs = null

    /** @private */
    _additionalRowActionList

    /** @inheritDoc */
    events = {
        /**
         * @param {JQueryKeyEventObject} e
         * @this ListRecordView
         */
        'click a.link': function (e) {
            if (e.ctrlKey || e.metaKey || e.shiftKey) {
                return;
            }

            e.stopPropagation();

            if (!this.scope || this.selectable) {
                return;
            }

            e.preventDefault();

            const id = $(e.currentTarget).attr('data-id');
            const model = this.collection.get(id);
            const scope = this.getModelScope(id);

            const options = {
                id: id,
                model: model,
            };

            if (this.options.keepCurrentRootUrl) {
                options.rootUrl = this.getRouter().getCurrentUrl();
            }

            this.getRouter().navigate('#' + scope + '/view/' + id, {trigger: false});
            this.getRouter().dispatch(scope, 'view', options);
        },
        /**
         * @param {JQueryMouseEventObject} e
         * @this ListRecordView
         */
        'auxclick a.link': function (e) {
            const isCombination = e.button === 1 && (e.ctrlKey || e.metaKey);

            if (!isCombination) {
                return;
            }

            const $target = $(e.currentTarget);

            const id = $target.attr('data-id');

            if (!id) {
                return;
            }

            if (this.quickDetailDisabled) {
                return;
            }

            const $menu = $target.parent().closest(`[data-id="${id}"]`)
                .find(`ul.list-row-dropdown-menu[data-id="${id}"]`);

            const $quickView = $menu.find(`a[data-action="quickView"]`);

            if ($menu.length && !$quickView.length) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            this.actionQuickView({id: id});
        },
        /** @this ListRecordView */
        'click [data-action="showMore"]': function () {
            this.showMoreRecords();
        },
        'mousedown a.sort': function (e) {
            e.preventDefault();
        },
        /**
         * @param {JQueryKeyEventObject} e
         * @this module:views/record/list
         */
        'click a.sort': function (e) {
            const field = $(e.currentTarget).data('name');

            this.toggleSort(field);
        },
        /**
         * @param {JQueryKeyEventObject} e
         * @this ListRecordView
         */
        'click .pagination a[data-page]': function (e) {
            const page = $(e.currentTarget).data('page');

            if ($(e.currentTarget).parent().hasClass('disabled')) {
                return;
            }

            Espo.Ui.notify(' ... ');

            this.collection.once('sync', () => {
                Espo.Ui.notify(false);

                this.trigger('after:paginate');
            });

            if (page === 'current') {
                this.collection.fetch();
            }
            else {
                if (page === 'next') {
                    this.collection.nextPage();
                }
                else if (page === 'previous') {
                    this.collection.previousPage();
                }
                else if (page === 'last') {
                    this.collection.lastPage();
                }
                else if (page === 'first') {
                    this.collection.firstPage();
                }

                this.trigger('paginate');
            }

            this.deactivate();
        },
        /** @this ListRecordView */
        'mousedown input.record-checkbox': function () {
            const $focused = $(document.activeElement);

            this._$focusedCheckbox = null;

            if (
                $focused.length &&
                $focused.get(0).tagName === 'INPUT' &&
                $focused.hasClass('record-checkbox')
            ) {
                this._$focusedCheckbox = $focused;
            }
        },
        /**
         * @param {JQueryKeyEventObject} e
         * @this ListRecordView
         */
        'click input.record-checkbox': function (e) {
            const $target = $(e.currentTarget);

            const $from = this._$focusedCheckbox;

            if (e.shiftKey && $from) {
                const $checkboxes = this.$el.find('input.record-checkbox');
                const start = $checkboxes.index($target);
                const end = $checkboxes.index($from);
                const checked = $from.prop('checked');

                $checkboxes.slice(Math.min(start, end), Math.max(start, end) + 1).each((i, el) => {
                    const $el = $(el);

                    $el.prop('checked', checked);
                    this.checkboxClick($el, checked);
                });

                return;
            }

            this.checkboxClick($target, $target.is(':checked'));
        },
        /**
         * @param {JQueryKeyEventObject} e
         * @this module:views/record/list
         */
        'click .select-all': function (e) {
            // noinspection JSUnresolvedReference
            this.selectAllHandler(e.currentTarget.checked);
        },
        /** @this ListRecordView */
        'click .action': function (e) {
            Espo.Utils.handleAction(this, e.originalEvent, e.currentTarget, {
                actionItems: [...this.buttonList, ...this.dropdownItemList],
                className: 'list-action-item',
            });
        },
        /** @this ListRecordView */
        'click .checkbox-dropdown [data-action="selectAllResult"]': function () {
            this.selectAllResult();
        },
        /**
         * @param {JQueryKeyEventObject} e
         * @this ListRecordView
         */
        'click .actions-menu a.mass-action': function (e) {
            const $el = $(e.currentTarget);

            const action = $el.data('action');
            const method = 'massAction' + Espo.Utils.upperCaseFirst(action);

            e.preventDefault();
            e.stopPropagation();

            const $parent = $el.closest('.dropdown-menu').parent();

            // noinspection JSUnresolvedReference
            $parent.find('.actions-button[data-toggle="dropdown"]')
                .dropdown('toggle')
                .focus();

            if (method in this) {
                this[method]();

                return;
            }

            this.massAction(action);
        },
        /** @this ListRecordView */
        'click a.reset-custom-order': function () {
            this.resetCustomOrder();
        },
    }

    /**
     * @param {JQuery} $checkbox
     * @param {boolean} checked
     * @private
     */
    checkboxClick($checkbox, checked) {
        const id = $checkbox.attr('data-id');

        if (checked) {
            this.checkRecord(id, $checkbox);

            return;
        }

        this.uncheckRecord(id, $checkbox);
    }

    resetCustomOrder() {
        this.collection.offset = 0;
        this.collection.resetOrderToDefault();
        this.collection.trigger('order-changed');

        this.collection
            .fetch()
            .then(() => {
                this.trigger('sort', {
                    orderBy: this.collection.orderBy,
                    order: this.collection.order,
                });
            })
    }

    /**
     * @param {string} orderBy
     * @protected
     */
    toggleSort(orderBy) {
        let asc = true;

        if (orderBy === this.collection.orderBy && this.collection.order === 'asc') {
            asc = false;
        }

        const order = asc ? 'asc' : 'desc';

        Espo.Ui.notify(' ... ');

        const maxSizeLimit = this.getConfig().get('recordListMaxSizeLimit') || 200;

        while (this.collection.length > maxSizeLimit) {
            this.collection.pop();
        }

        this.collection.offset = 0;

        this.collection
            .sort(orderBy, order)
            .then(() => {
                Espo.Ui.notify(false);

                this.trigger('sort', {orderBy: orderBy, order: order});
            })

        this.collection.trigger('order-changed');

        this.deactivate();
    }

    /**
     * @return {boolean}
     */
    toShowStickyBar() {
        return this.getCheckedIds().length > 0 || this.isAllResultChecked() || this.pagination;
    }

    /** @private */
    initStickyBar() {
        this._stickyBarHelper = new StickyBarHelper(this);
        this._stickyBarHelper.init();
    }

    /** @protected */
    showActions() {
        this.$el.find('.actions-button').removeClass('hidden');

        if (
            !this.options.stickedBarDisabled &&
            !this.stickedBarDisabled &&
            this.massActionList.length
        ) {
            if (!this._stickyBarHelper) {
                this.initStickyBar();
            }
        }
    }

    /** @protected */
    hideActions() {
        this.$el.find('.actions-button').addClass('hidden');

        if (this._stickyBarHelper && !this.pagination) {
            this._stickyBarHelper.hide();
        }
    }

    /** @protected */
    selectAllHandler(isChecked) {
        this.checkedList = [];

        if (isChecked) {
            this.$el.find('input.record-checkbox').prop('checked', true);

            this.showActions();

            this.collection.models.forEach((model) => {
                this.checkedList.push(model.id);
            });

            this.$el.find('.list > table tbody tr').addClass('active');
        }
        else {
            if (this.allResultIsChecked) {
                this.unselectAllResult();
            }

            this.$el.find('input.record-checkbox').prop('checked', false);
            this.hideActions();
            this.$el.find('.list > table tbody tr').removeClass('active');
        }

        this.trigger('check');
    }

    /** @inheritDoc */
    data() {
        const moreCount = this.collection.total - this.collection.length;
        let checkAllResultDisabled = this.checkAllResultDisabled;

        if (!this.massActionsDisabled) {
            if (!this.checkAllResultMassActionList.length) {
                checkAllResultDisabled = true;
            }
        }

        const displayTotalCount = this.displayTotalCount && this.collection.total > 0 && !this.pagination;

        const topBar =
            this.pagination ||
            this.checkboxes ||
            (this.buttonList.length && !this.buttonsDisabled) ||
            (this.dropdownItemList.length && !this.buttonsDisabled) ||
            this.forceDisplayTopBar ||
            displayTotalCount;

        const noDataDisabled = this.noDataDisabled || this._renderEmpty;

        return {
            scope: this.scope,
            entityType: this.entityType,
            header: this.header,
            headerDefs: this._getHeaderDefs(),
            hasPagination: this.pagination,
            showMoreActive: this.collection.hasMore(),
            showMoreEnabled: this.showMore,
            showCount: this.showCount && this.collection.total > 0,
            moreCount: moreCount,
            checkboxes: this.checkboxes,
            massActionList: this.massActionList,
            rowList: this.rowList,
            topBar: topBar,
            checkAllResultDisabled: checkAllResultDisabled,
            buttonList: this.buttonList,
            dropdownItemList: this.dropdownItemList,
            displayTotalCount: displayTotalCount,
            displayActionsButtonGroup: this.checkboxes ||
                this.massActionList || this.buttonList.length || this.dropdownItemList.length,
            totalCountFormatted: this.getNumberUtil().formatInt(this.collection.total),
            moreCountFormatted: this.getNumberUtil().formatInt(moreCount),
            checkboxColumnWidth: this.checkboxColumnWidth + 'px',
            noDataDisabled: noDataDisabled,
        };
    }

    /** @inheritDoc */
    init() {
        this.type = this.options.type || this.type;
        this.listLayout = this.options.listLayout || this.listLayout;
        this.layoutName = this.options.layoutName || this.layoutName || this.type;
        this.layoutScope = this.options.layoutScope || this.layoutScope;
        this.layoutAclDisabled = this.options.layoutAclDisabled || this.layoutAclDisabled;
        this.headerDisabled = this.options.headerDisabled || this.headerDisabled;
        this.noDataDisabled = this.options.noDataDisabled || this.noDataDisabled;

        if (!this.headerDisabled) {
            this.header = _.isUndefined(this.options.header) ? this.header : this.options.header;
        } else {
            this.header = false;
        }

        this.pagination = this.options.pagination == null ? this.pagination : this.options.pagination;

        if (this.paginationDisabled) {
            this.pagination = false;
        }

        this.checkboxes = _.isUndefined(this.options.checkboxes) ? this.checkboxes :
            this.options.checkboxes;
        this.selectable = _.isUndefined(this.options.selectable) ? this.selectable :
            this.options.selectable;

        this.checkboxesDisabled = this.options.checkboxes === false;

        this.rowActionsView = _.isUndefined(this.options.rowActionsView) ?
            this.rowActionsView :
            this.options.rowActionsView;

        this.showMore = _.isUndefined(this.options.showMore) ? this.showMore : this.options.showMore;

        this.massActionsDisabled = this.options.massActionsDisabled || this.massActionsDisabled;
        this.portalLayoutDisabled = this.options.portalLayoutDisabled || this.portalLayoutDisabled;

        if (this.massActionsDisabled && !this.selectable) {
            this.checkboxes = false;
        }

        this.rowActionsDisabled = this.options.rowActionsDisabled || this.rowActionsDisabled;

        this.dropdownItemList = Espo.Utils.cloneDeep(
            this.options.dropdownItemList || this.dropdownItemList);

        if ('buttonsDisabled' in this.options) {
            this.buttonsDisabled = this.options.buttonsDisabled;
        }

        if ('checkAllResultDisabled' in this.options) {
            this.checkAllResultDisabled = this.options.checkAllResultDisabled;
        }
    }

    /**
     * Get a record entity type (scope).
     *
     * @param {string} id A record ID.
     * @return {string}
     */
    getModelScope(id) {
        return this.scope;
    }

    /**
     * Select all results.
     */
    selectAllResult() {
        this.allResultIsChecked = true;

        this.hideActions();

        this.$el.find('input.record-checkbox').prop('checked', true).attr('disabled', 'disabled');
        this.$selectAllCheckbox.prop('checked', true);

        this.massActionList.forEach(item => {
            if (!~this.checkAllResultMassActionList.indexOf(item)) {
                this.$el
                    .find(
                        'div.list-buttons-container .actions-menu li a.mass-action[data-action="'+item+'"]'
                    )
                    .parent()
                    .addClass('hidden');
            }
        });

        if (this.checkAllResultMassActionList.length) {
            this.showActions();
        }

        this.$el.find('.list > table tbody tr').removeClass('active');

        this.trigger('select-all-results');
    }

    /**
     * Unselect all results.
     */
    unselectAllResult() {
        this.allResultIsChecked = false;

        this.$el.find('input.record-checkbox').prop('checked', false).removeAttr('disabled');
        this.$selectAllCheckbox.prop('checked', false);

        this.massActionList.forEach(item => {
            if (!~this.checkAllResultMassActionList.indexOf(item)) {
                this.$el
                    .find('div.list-buttons-container .actions-menu ' +
                        'li a.mass-action[data-action="'+item+'"]')
                    .parent()
                    .removeClass('hidden');
            }
        });
    }

    /** @protected */
    deactivate() {
        if (this.$el) {
            this.$el.find(".pagination a").addClass('disabled');
            this.$el.find("a.sort").addClass('disabled');
        }
    }

    /**
     * Process export.
     *
     * @param {Object<string,*>} [data]
     * @param {string} [url='Export'] An API URL.
     * @param {string[]} [fieldList] A field list.
     */
    export(data, url, fieldList) {
        if (!data) {
            data = {
                entityType: this.entityType,
            };

            if (this.allResultIsChecked) {
                data.where = this.collection.getWhere();
                data.searchParams = this.collection.data || null;
                data.searchData = this.collection.data || {}; // for bc;
            }
            else {
                data.ids = this.checkedList;
            }
        }

        url = url || 'Export';

        const o = {
            scope: this.entityType,
        };

        if (fieldList) {
            o.fieldList = fieldList;
        }
        else {
            const layoutFieldList = [];

            (this.listLayout || []).forEach((item) => {
                if (item.name) {
                    layoutFieldList.push(item.name);
                }
            });

            o.fieldList = layoutFieldList;
        }

        const helper = new ExportHelper(this);
        const idle = this.allResultIsChecked && helper.checkIsIdle(this.collection.total);

        const proceedDownload = (attachmentId) => {
            window.location = this.getBasePath() + '?entryPoint=download&id=' + attachmentId;
        };

        this.createView('dialogExport', 'views/export/modals/export', o, (view) => {
            view.render();

            this.listenToOnce(view, 'proceed', (dialogData) => {
                if (!dialogData.exportAllFields) {
                    data.attributeList = dialogData.attributeList;
                    data.fieldList = dialogData.fieldList;
                }

                data.idle = idle;
                data.format = dialogData.format;
                data.params = dialogData.params;

                Espo.Ui.notify(this.translate('pleaseWait', 'messages'));

                Espo.Ajax
                    .postRequest(url, data, {timeout: 0})
                    .then(/** Object.<string, *> */response => {
                        Espo.Ui.notify(false);

                        if (response.exportId) {
                            helper
                                .process(response.exportId)
                                .then(view => {
                                    this.listenToOnce(view, 'download', id => {
                                        proceedDownload(id);
                                    });
                                });

                            return;
                        }

                        if (!response.id) {
                            throw new Error("No attachment-id.");
                        }

                        window.location = this.getBasePath() + '?entryPoint=download&id=' + response.id;

                        proceedDownload(response.id);
                    });
            });
        });
    }

    /**
     * Process a mass-action.
     *
     * @param {string} name An action.
     */
    massAction(name) {
        const defs = this.massActionDefs[name] || {};

        const handler = defs.handler;

        if (handler) {
            const method = defs.actionFunction || 'action' + Espo.Utils.upperCaseFirst(name);

            const data = {
                entityType: this.entityType,
                action: name,
                params: this.getMassActionSelectionPostData(),
            };

            Espo.loader.require(handler, Handler => {
                const handler = new Handler(this);

                handler[method].call(handler, data);
            });

            return;
        }

        const bypassConfirmation = defs.bypassConfirmation || false;
        const confirmationMsg = defs.confirmationMessage || 'confirmation';
        const acl = defs.acl;
        const aclScope = defs.aclScope;

        const proceed = () => {
            if (acl || aclScope) {
                if (!this.getAcl().check(aclScope || this.scope, acl)) {
                    Espo.Ui.error(this.translate('Access denied'));

                    return;
                }
            }

            const idList = [];
            const data = {};

            if (this.allResultIsChecked) {
                data.where = this.collection.getWhere();
                data.searchParams = this.collection.data || {};
                data.selectData = data.searchData; // for bc;
                data.byWhere = true; // for bc
            } else {
                data.idList = idList; // for bc
                data.ids = idList;
            }

            for (const i in this.checkedList) {
                idList.push(this.checkedList[i]);
            }

            data.entityType = this.entityType;

            const waitMessage = defs.waitMessage || 'pleaseWait';

            Espo.Ui.notify(this.translate(waitMessage, 'messages', this.scope));

            const url = defs.url;

            Espo.Ajax.postRequest(url, data)
                .then(/** Object.<string, *> */result => {
                    const successMessage = result.successMessage || defs.successMessage || 'done';

                    this.collection
                        .fetch()
                        .then(() => {
                            let message = this.translate(successMessage, 'messages', this.scope);

                            if ('count' in result) {
                                message = message.replace('{count}', result.count);
                            }

                            Espo.Ui.success(message);
                        });
                });
        };

        if (!bypassConfirmation) {
            this.confirm(this.translate(confirmationMsg, 'messages', this.scope), proceed, this);
        }
        else {
            proceed.call(this);
        }
    }

    getMassActionSelectionPostData() {
        const data = {};

        if (this.allResultIsChecked) {
            data.where = this.collection.getWhere();
            data.searchParams = this.collection.data || {};
            data.selectData = this.collection.data || {}; // for bc;
            data.byWhere = true; // for bc;
        }
        else {
            data.ids = [];

            for (const i in this.checkedList) {
                data.ids.push(this.checkedList[i]);
            }
        }

        return data;
    }

    // noinspection JSUnusedGlobalSymbols
    massActionRecalculateFormula() {
        let ids = false;

        const allResultIsChecked = this.allResultIsChecked;

        if (!allResultIsChecked) {
            ids = this.checkedList;
        }

        this.confirm({
            message: this.translate('recalculateFormulaConfirmation', 'messages'),
            confirmText: this.translate('Yes'),
        }, () => {
            Espo.Ui.notify(this.translate('pleaseWait', 'messages'));

            const params = this.getMassActionSelectionPostData();
            const helper = new MassActionHelper(this);
            const idle = !!params.searchParams && helper.checkIsIdle(this.collection.total);

            Espo.Ajax.postRequest('MassAction', {
                entityType: this.entityType,
                action: 'recalculateFormula',
                params: params,
                idle: idle,
            })
                .then(result => {
                    result = result || {};

                    const final = () => {
                        this.collection
                            .fetch()
                            .then(() => {
                                Espo.Ui.success(this.translate('Done'));

                                if (allResultIsChecked) {
                                    this.selectAllResult();

                                    return;
                                }

                                ids.forEach((id) => {
                                    this.checkRecord(id);
                                });
                            });
                    };

                    if (result.id) {
                        helper
                            .process(result.id, 'recalculateFormula')
                            .then(view => {
                                this.listenToOnce(view, 'close:success', () => final());
                            });

                        return;
                    }

                    final();
                });
        });
    }

    // noinspection JSUnusedGlobalSymbols
    massActionRemove() {
        if (!this.getAcl().check(this.entityType, 'delete')) {
            Espo.Ui.error(this.translate('Access denied'));

            return false;
        }

        this.confirm({
            message: this.translate('removeSelectedRecordsConfirmation', 'messages', this.scope),
            confirmText: this.translate('Remove'),
        }, () => {
            Espo.Ui.notify(' ... ');

            const helper = new MassActionHelper(this);
            const params = this.getMassActionSelectionPostData();
            const idle = !!params.searchParams && helper.checkIsIdle(this.collection.total);

            Espo.Ajax.postRequest('MassAction', {
                entityType: this.entityType,
                action: 'delete',
                params: params,
                idle: idle,
            })
            .then(result => {
                result = result || {};

                const afterAllResult = count => {
                    if (!count) {
                        Espo.Ui.warning(this.translate('noRecordsRemoved', 'messages'));

                        return;
                    }

                    this.unselectAllResult();

                    this.collection
                        .fetch()
                        .then(() => {
                            const msg = count === 1 ? 'massRemoveResultSingle' : 'massRemoveResult';

                            Espo.Ui.success(this.translate(msg, 'messages').replace('{count}', count));
                        });

                    this.collection.trigger('after:mass-remove');

                    Espo.Ui.notify(false);
                };

                if (result.id) {
                    helper
                        .process(result.id, 'delete')
                        .then(view => {
                            this.listenToOnce(view, 'close:success', result => afterAllResult(result.count));
                        });

                    return;
                }

                const count = result.count;

                if (this.allResultIsChecked) {
                    afterAllResult(count);

                    return;
                }

                const idsRemoved = result.ids || [];

                if (!count) {
                    Espo.Ui.warning(this.translate('noRecordsRemoved', 'messages'));

                    return;
                }

                idsRemoved.forEach(id => {
                    Espo.Ui.notify(false);

                    this.collection.trigger('model-removing', id);
                    this.removeRecordFromList(id);
                    this.uncheckRecord(id, null, true);
                });

                if (this.$selectAllCheckbox.prop('checked')) {
                    this.$selectAllCheckbox.prop('checked', false);

                    if (this.collection.hasMore()) {
                        this.showMoreRecords({skipNotify: true});
                    }
                }

                this.collection.trigger('after:mass-remove');

                const msg = count === 1 ? 'massRemoveResultSingle' : 'massRemoveResult';

                Espo.Ui.success(this.translate(msg, 'messages').replace('{count}', count));
            });
        });
    }

    // noinspection JSUnusedGlobalSymbols
    massActionPrintPdf() {
        const maxCount = this.getConfig().get('massPrintPdfMaxCount');

        if (maxCount) {
            if (this.checkedList.length > maxCount) {
                const msg = this.translate('massPrintPdfMaxCountError', 'messages')
                    .replace('{maxCount}', maxCount.toString());

                Espo.Ui.error(msg);

                return;
            }
        }

        const idList = [];

        for (const i in this.checkedList) {
            idList.push(this.checkedList[i]);
        }

        this.createView('pdfTemplate', 'views/modals/select-template', {
            entityType: this.entityType,
        }, view => {
            view.render();

            this.listenToOnce(view, 'select', (templateModel) => {
                this.clearView('pdfTemplate');

                Espo.Ui.notify(' ... ');

                Espo.Ajax.postRequest(
                    'Pdf/action/massPrint',
                    {
                        idList: idList,
                        entityType: this.entityType,
                        templateId: templateModel.id,
                    },
                    {timeout: 0}
                ).then(result => {
                    Espo.Ui.notify(false);

                    window.open('?entryPoint=download&id=' + result.id, '_blank');
                });
            });
        });
    }

    // noinspection JSUnusedGlobalSymbols
    massActionFollow() {
        const count = this.checkedList.length;

        const confirmMsg = this.translate('confirmMassFollow', 'messages')
            .replace('{count}', count.toString());

        this.confirm({
            message: confirmMsg,
            confirmText: this.translate('Follow'),
        }, () => {
            Espo.Ui.notify(this.translate('pleaseWait', 'messages'));

            Espo.Ajax
                .postRequest('MassAction', {
                    action: 'follow',
                    entityType: this.entityType,
                    params: this.getMassActionSelectionPostData(),
                })
                .then(result => {
                    const resultCount = result.count || 0;

                    let msg = 'massFollowResult';

                    if (resultCount) {
                        if (resultCount === 1) {
                            msg += 'Single';
                        }

                        Espo.Ui.success(
                            this.translate(msg, 'messages').replace('{count}', resultCount.toString())
                        );

                        return;
                    }

                    Espo.Ui.warning(
                        this.translate('massFollowZeroResult', 'messages')
                    );
                });
        });
    }

    // noinspection JSUnusedGlobalSymbols
    massActionUnfollow() {
        const count = this.checkedList.length;

        const confirmMsg = this.translate('confirmMassUnfollow', 'messages')
            .replace('{count}', count.toString());

        this.confirm({
            message: confirmMsg,
            confirmText: this.translate('Unfollow'),
        }, () => {
            Espo.Ui.notify(this.translate('pleaseWait', 'messages'));

            const params = this.getMassActionSelectionPostData();
            const helper = new MassActionHelper(this);
            const idle = !!params.searchParams && helper.checkIsIdle(this.collection.total);

            Espo.Ajax
                .postRequest('MassAction', {
                    action: 'unfollow',
                    entityType: this.entityType,
                    params: params,
                    idle: idle,
                })
                .then(result => {
                    const final = (count) => {
                        let msg = 'massUnfollowResult';

                        if (!count) {
                            Espo.Ui.warning(
                                this.translate('massUnfollowZeroResult', 'messages')
                            );
                        }

                        if (count === 1) {
                            msg += 'Single';
                        }

                        Espo.Ui.success(
                            this.translate(msg, 'messages').replace('{count}', count)
                        );
                    };

                    if (result.id) {
                        helper
                            .process(result.id, 'unfollow')
                            .then(view => {
                                this.listenToOnce(view, 'close:success', result => final(result.count));
                            });

                        return;
                    }

                    final(result.count || 0);
                });
        });
    }

    // noinspection JSUnusedGlobalSymbols
    massActionMerge() {
        if (!this.getAcl().check(this.entityType, 'edit')) {
            Espo.Ui.error(this.translate('Access denied'));

            return false;
        }

        if (this.checkedList.length < 2) {
            Espo.Ui.error(this.translate('Select 2 or more records'));

            return;
        }
        if (this.checkedList.length > 4) {
            Espo.Ui.error(this.translate('Select not more than 4 records'));

            return;
        }

        this.checkedList.sort();

        const url = '#' + this.entityType + '/merge/ids=' + this.checkedList.join(',');

        this.getRouter().navigate(url, {trigger: false});

        this.getRouter().dispatch(this.entityType, 'merge', {
            ids: this.checkedList.join(','),
            collection: this.collection,
        });
    }

    // noinspection JSUnusedGlobalSymbols
    massActionMassUpdate() {
        if (!this.getAcl().check(this.entityType, 'edit')) {
            Espo.Ui.error(this.translate('Access denied'));

            return false;
        }

        Espo.Ui.notify(' ... ');

        let ids = false;

        const allResultIsChecked = this.allResultIsChecked;

        if (!allResultIsChecked) {
            ids = this.checkedList;
        }

        const viewName = this.getMetadata().get(['clientDefs', this.entityType, 'modalViews', 'massUpdate']) ||
            'views/modals/mass-update';

        this.createView('massUpdate', viewName, {
            scope: this.scope,
            entityType: this.entityType,
            ids: ids,
            where: this.collection.getWhere(),
            searchParams: this.collection.data,
            byWhere: this.allResultIsChecked,
            totalCount: this.collection.total,
        }, view => {
            view.render();

            view.notify(false);

            this.listenToOnce(view, 'after:update', (o) => {
                if (o.idle) {
                    this.listenToOnce(view, 'close', () => {
                        this.collection
                            .fetch()
                            .then(() => {
                                if (allResultIsChecked) {
                                    this.selectAllResult();

                                    return;
                                }

                                ids.forEach((id) => {
                                    this.checkRecord(id);
                                });
                            });
                    });

                    return;
                }

                view.close();

                const count = o.count;

                this.collection
                    .fetch()
                    .then(() => {
                        if (count) {
                            let msg = 'massUpdateResult';

                            if (count === 1) {
                                msg = 'massUpdateResultSingle';
                            }

                            Espo.Ui.success(this.translate(msg, 'messages').replace('{count}', count));
                        }
                        else {
                            Espo.Ui.warning(this.translate('noRecordsUpdated', 'messages'));
                        }

                        if (allResultIsChecked) {
                            this.selectAllResult();

                            return;
                        }

                        ids.forEach(id => {
                            this.checkRecord(id);
                        });
                    });
            });
        });
    }

    // noinspection JSUnusedGlobalSymbols
    massActionExport() {
        if (this.getConfig().get('exportDisabled') && !this.getUser().isAdmin()) {
            return;
        }

        this.export();
    }

    // noinspection JSUnusedGlobalSymbols
    massActionUnlink() {
        this.confirm({
            message: this.translate('unlinkSelectedRecordsConfirmation', 'messages'),
            confirmText: this.translate('Unlink'),
        }, () => {
            Espo.Ui.notify(' ... ');

            Espo.Ajax.deleteRequest(this.collection.url, {ids: this.checkedList})
                .then(() => {
                    Espo.Ui.success(this.translate('Unlinked'));

                    this.collection.fetch();

                    this.model.trigger('after:unrelate');
                });
        });
    }

    // noinspection JSUnusedGlobalSymbols
    massActionConvertCurrency() {
        let ids = false;

        const allResultIsChecked = this.allResultIsChecked;

        if (!allResultIsChecked) {
            ids = this.checkedList;
        }

        this.createView('modalConvertCurrency', 'views/modals/mass-convert-currency', {
            entityType: this.entityType,
            ids: ids,
            where: this.collection.getWhere(),
            searchParams: this.collection.data,
            byWhere: this.allResultIsChecked,
            totalCount: this.collection.total,
        }, view => {
            view.render();

            this.listenToOnce(view, 'after:update', o => {
                if (o.idle) {
                    this.listenToOnce(view, 'close', () => {
                        this.collection
                            .fetch()
                            .then(() => {
                                if (allResultIsChecked) {
                                    this.selectAllResult();

                                    return;
                                }

                                ids.forEach((id) => {
                                    this.checkRecord(id);
                                });
                            });
                    });

                    return;
                }

                const count = o.count;

                this.collection
                    .fetch()
                    .then(() => {
                        if (count) {
                            let msg = 'massUpdateResult';

                            if (count === 1) {
                                msg = 'massUpdateResultSingle';
                            }

                            Espo.Ui.success(this.translate(msg, 'messages').replace('{count}', count));
                        }
                        else {
                            Espo.Ui.warning(this.translate('noRecordsUpdated', 'messages'));
                        }

                        if (allResultIsChecked) {
                            this.selectAllResult();

                            return;
                        }

                        ids.forEach(id => {
                            this.checkRecord(id);
                        });
                    });
            });
        });
    }

    /**
     * Add a mass action.
     *
     * @protected
     * @param {string} item An action.
     * @param {boolean} [allResult] To make available for all-result.
     * @param {boolean} [toBeginning] Add to the beginning of the list.
     */
    addMassAction(item, allResult, toBeginning) {
        toBeginning ?
            this.massActionList.unshift(item) :
            this.massActionList.push(item);

        if (allResult && this.collection.url === this.entityType) {
            toBeginning ?
                this.checkAllResultMassActionList.unshift(item) :
                this.checkAllResultMassActionList.push(item);
        }

        if (!this.checkboxesDisabled) {
            this.checkboxes = true;
        }
    }

    /**
     * Remove a mass action.
     *
     * @protected
     * @param {string} item An action.
     */
    removeMassAction(item) {
        let index = this.massActionList.indexOf(item);

        if (~index) {
            this.massActionList.splice(index, 1);
        }

        index = this.checkAllResultMassActionList.indexOf(item);

        if (~index) {
            this.checkAllResultMassActionList.splice(index, 1);
        }
    }

    /**
     * Remove an all-result mass action.
     *
     * @protected
     * @param {string} item An action.
     */
    removeAllResultMassAction(item) {
        const index = this.checkAllResultMassActionList.indexOf(item);

        if (~index) {
            this.checkAllResultMassActionList.splice(index, 1);
        }
    }

    /** @inheritDoc */
    setup() {
        if (typeof this.collection === 'undefined') {
            throw new Error('Collection has not been injected into views/record/list view.');
        }

        this.layoutLoadCallbackList = [];

        this.entityType = this.collection.entityType || null;
        this.scope = this.options.scope || this.entityType;

        this.massActionList = Espo.Utils.clone(this.massActionList);
        this.checkAllResultMassActionList = Espo.Utils.clone(this.checkAllResultMassActionList);
        this.buttonList = Espo.Utils.clone(this.buttonList);

        this.mandatorySelectAttributeList = Espo.Utils.clone(
            this.options.mandatorySelectAttributeList || this.mandatorySelectAttributeList || []
        );

        this.editDisabled = this.options.editDisabled || this.editDisabled ||
            this.getMetadata().get(['clientDefs', this.scope, 'editDisabled']);

        this.removeDisabled = this.options.removeDisabled || this.removeDisabled ||
            this.getMetadata().get(['clientDefs', this.scope, 'removeDisabled']);

        this.setupMassActions();

        if (this.selectable) {
            this.events['click .list a.link'] = (e) => {
                e.preventDefault();

                const id = $(e.target).attr('data-id');

                if (id) {
                    const model = this.collection.get(id);

                    if (this.checkboxes) {
                        const list = [];

                        list.push(model);

                        this.trigger('select', list);
                    }
                    else {
                        this.trigger('select', model);
                    }
                }

                e.stopPropagation();
            };
        }

        if ('showCount' in this.options) {
            this.showCount = this.options.showCount;
        }

        this.displayTotalCount = this.showCount && this.getConfig().get('displayListViewRecordCount');

        if ('displayTotalCount' in this.options) {
            this.displayTotalCount = this.options.displayTotalCount;
        }

        this.forceDisplayTopBar = this.options.forceDisplayTopBar || this.forceDisplayTopBar;

        if (!this.massActionList.length && !this.selectable) {
            this.checkboxes = false;
        }

        if (
            this.getUser().isPortal() &&
            !this.portalLayoutDisabled &&
            this.getMetadata().get(['clientDefs', this.scope, 'additionalLayouts', this.layoutName + 'Portal'])
        ) {
            this.layoutName += 'Portal';
        }

        this.setupRowActionDefs();
        this.setupSettings();

        this.wait(
            this.getHelper().processSetupHandlers(this, this.setupHandlerType)
        );

        this.listenTo(this.collection, 'sync', (c, r, options) => {
            this._renderEmpty = false;

            if (this.hasView('modal') && this.getView('modal').isRendered()) {
                return;
            }

            options = options || {};

            if (options.previousDataList) {
                const currentDataList = this.collection.models.map(model => {
                    return Espo.Utils.cloneDeep(model.attributes);
                });

                if (_.isEqual(currentDataList, options.previousDataList)) {
                    return;
                }
            }

            if (this.noRebuild) {
                this.noRebuild = null;

                return;
            }

            if (options.noRebuild) {
                this.noRebuild = null;

                return;
            }

            this.checkedList = [];
            this.allResultIsChecked = false;

            this.buildRows(() => {
                this.render();
            });
        });

        this.checkedList = [];

        if (!this.options.skipBuildRows) {
            this.buildRows();
        }

        if (this.pagination) {
            this.createView('pagination', 'views/record/list-pagination', {
                collection: this.collection,
                displayTotalCount: this.displayTotalCount,
            });

            this.createView('paginationSticky', 'views/record/list-pagination', {
                collection: this.collection,
                displayTotalCount: this.displayTotalCount,
            });
        }

        this._renderEmpty = this.options.skipBuildRows;
    }

    afterRender() {
        this._stickyBarHelper = null;

        this.$selectAllCheckbox = this.$el.find('input.select-all');

        if (this.allResultIsChecked) {
            this.selectAllResult();
        }
        else if (this.checkedList.length) {
            this.checkedList.forEach(id => {
                this.checkRecord(id);
            });
        }

        if (this.pagination && this.$el.find('> .list').length) {
            this.initStickyBar();
        }
    }

    /** @private */
    setupMassActions() {
        if (this.massActionsDisabled) {
            this.massActionList = [];
            this.checkAllResultMassActionList = [];

            return;
        }

        if (!this.getAcl().checkScope(this.entityType, 'delete')) {
            this.removeMassAction('remove');
            this.removeMassAction('merge');
        }

        if (
            this.removeDisabled ||
            this.getMetadata().get(['clientDefs', this.scope, 'massRemoveDisabled'])
        ) {
            this.removeMassAction('remove');
        }

        if (!this.getAcl().checkScope(this.entityType, 'edit')) {
            this.removeMassAction('massUpdate');
            this.removeMassAction('merge');
        }

        if (
            this.getMetadata().get(['clientDefs', this.scope, 'mergeDisabled']) ||
            this.mergeDisabled
        ) {
            this.removeMassAction('merge');
        }

        this.massActionDefs = {
            ...this.getMetadata().get(['clientDefs', 'Global', 'massActionDefs']) || {},
            ...this.getMetadata().get(['clientDefs', this.scope, 'massActionDefs']) || {},
        };

        const metadataMassActionList = [
            ...this.getMetadata().get(['clientDefs', 'Global', 'massActionList']) || [],
            ...this.getMetadata().get(['clientDefs', this.scope, 'massActionList']) || [],
        ];

        const metadataCheckAllMassActionList = [
            ...this.getMetadata().get(['clientDefs', 'Global', 'checkAllResultMassActionList']) || [],
            ...this.getMetadata().get(['clientDefs', this.scope, 'checkAllResultMassActionList']) || [],
        ];

        metadataMassActionList.forEach(item => {
            const defs = /** @type {Espo.Utils~ActionAccessDefs & Espo.Utils~ActionAvailabilityDefs} */
                this.massActionDefs[item] || {};

            if (
                !Espo.Utils.checkActionAvailability(this.getHelper(), defs) ||
                !Espo.Utils.checkActionAccess(this.getAcl(), null, defs)
            ) {
                return;
            }

            this.massActionList.push(item);
        });

        this.checkAllResultMassActionList = this.checkAllResultMassActionList
            .filter(item => this.massActionList.includes(item));

        metadataCheckAllMassActionList.forEach(item => {
            if (this.collection.url !== this.entityType) {
                return;
            }

            if (~this.massActionList.indexOf(item)) {
                const defs = /** @type {Espo.Utils~ActionAccessDefs & Espo.Utils~ActionAvailabilityDefs} */
                    this.massActionDefs[item] || {};

                if (
                    !Espo.Utils.checkActionAvailability(this.getHelper(), defs) ||
                    !Espo.Utils.checkActionAccess(this.getAcl(), null, defs)
                ) {
                    return;
                }

                this.checkAllResultMassActionList.push(item);
            }
        });

        metadataMassActionList
            .concat(metadataCheckAllMassActionList)
            .forEach(action => {
                const defs = this.massActionDefs[action] || {};

                if (!defs.initFunction || !defs.handler) {
                    return;
                }

                const viewObject = this;

                this.wait(
                    new Promise((resolve) => {
                        Espo.loader.require(defs.handler, Handler => {
                            const handler = new Handler(viewObject);

                            handler[defs.initFunction].call(handler);

                            resolve();
                        });
                    })
                );
            });

        if (
            this.getConfig().get('exportDisabled') && !this.getUser().isAdmin() ||
            this.getAcl().getPermissionLevel('exportPermission') === 'no' ||
            this.getMetadata().get(['clientDefs', this.scope, 'exportDisabled']) ||
            this.exportDisabled
        ) {
            this.removeMassAction('export');
        }

        if (
            this.getAcl().getPermissionLevel('massUpdatePermission') !== 'yes' ||
            this.editDisabled ||
            this.massUpdateDisabled ||
            this.getMetadata().get(['clientDefs', this.scope, 'massUpdateDisabled'])
        ) {
            this.removeMassAction('massUpdate');
        }

        if (
            !this.massFollowDisabled &&
            this.getMetadata().get(['scopes', this.entityType, 'stream']) &&
            this.getAcl().check(this.entityType, 'stream') ||
            this.getMetadata().get(['clientDefs', this.scope, 'massFollowDisabled'])
        ) {
            this.addMassAction('follow');
            this.addMassAction('unfollow', true);
        }

        if (
            !this.massPrintPdfDisabled &&
            (this.getHelper().getAppParam('templateEntityTypeList') || []).includes(this.entityType)
        ) {
            this.addMassAction('printPdf');
        }

        if (this.options.unlinkMassAction && this.collection) {
            this.addMassAction('unlink', false, true);
        }

        if (
            !this.massConvertCurrencyDisabled &&
            !this.getMetadata().get(['clientDefs', this.scope, 'convertCurrencyDisabled']) &&
            this.getConfig().get('currencyList').length > 1 &&
            this.getAcl().checkScope(this.scope, 'edit') &&
            this.getAcl().getPermissionLevel('massUpdatePermission') === 'yes'
        ) {
            const currencyFieldList = this.getFieldManager().getEntityTypeFieldList(this.entityType, {
                type: 'currency',
                acl: 'edit',
            });

            if (currencyFieldList.length) {
                this.addMassAction('convertCurrency', true);
            }
        }

        this.setupMassActionItems();

        if (this.getUser().isAdmin()) {
            if (this.getMetadata().get(['formula', this.entityType, 'beforeSaveCustomScript'])) {
                this.addMassAction('recalculateFormula', true);
            }
        }

        if (this.collection.url !== this.entityType) {
            Espo.Utils.clone(this.checkAllResultMassActionList).forEach((item) => {
                this.removeAllResultMassAction(item);
            });
        }

        if (this.forcedCheckAllResultMassActionList) {
            this.checkAllResultMassActionList = Espo.Utils.clone(this.forcedCheckAllResultMassActionList);
        }

        if (this.getAcl().getPermissionLevel('massUpdatePermission') !== 'yes') {
            this.removeAllResultMassAction('remove');
        }

        Espo.Utils.clone(this.massActionList).forEach(item => {
            const propName = 'massAction' + Espo.Utils.upperCaseFirst(item) + 'Disabled';

            if (this[propName] || this.options[propName]) {
                this.removeMassAction(item);
            }
        });
    }

    /** @protected */
    setupMassActionItems() {}

    /**
     * @param {module:views/record/list~columnDefs[]} listLayout
     * @return {module:views/record/list~columnDefs[]}
     * @protected
     */
    filterListLayout(listLayout) {
        if (this._cachedFilteredListLayout) {
            return this._cachedFilteredListLayout;
        }

        let forbiddenFieldList = this._cachedScopeForbiddenFieldList =
            this._cachedScopeForbiddenFieldList ||
            this.getAcl().getScopeForbiddenFieldList(this.entityType, 'read');

        if (this.layoutAclDisabled) {
            forbiddenFieldList = [];
        }

        if (!forbiddenFieldList.length) {
            this._cachedFilteredListLayout = listLayout;

            return this._cachedFilteredListLayout;
        }

        const filteredListLayout = Espo.Utils.cloneDeep(listLayout);

        const deleteIndexes = [];

        for (const [i, item] of listLayout.entries()) {
            if (item.name && forbiddenFieldList.includes(item.name)) {
                item.customLabel = '';
                item.notSortable = true;

                deleteIndexes.push(i)
            }
        }

        deleteIndexes
            .reverse()
            .forEach(index => filteredListLayout.splice(index, 1));

        this._cachedFilteredListLayout = filteredListLayout;

        return this._cachedFilteredListLayout;
    }

    /**
     * @protected
     * @param {function(module:views/record/list~columnDefs[]): void} callback A callback.
     */
    _loadListLayout(callback) {
        this.layoutLoadCallbackList.push(callback);

        if (this.layoutIsBeingLoaded) {
            return;
        }

        this.layoutIsBeingLoaded = true;

        const layoutName = this.layoutName;
        const layoutScope = this.layoutScope || this.collection.entityType;

        this.getHelper().layoutManager.get(layoutScope, layoutName, listLayout => {
            const filteredListLayout = this.filterListLayout(listLayout);

            this.layoutLoadCallbackList.forEach(callbackItem => {
                callbackItem(filteredListLayout);

                this.layoutLoadCallbackList = [];
                this.layoutIsBeingLoaded = false;
            });
        });
    }

    /**
     * Get a select-attribute list.
     *
     * @param {function(string[]):void} callback A callback.
     */
    getSelectAttributeList(callback) {
        if (this.scope === null) {
            callback(null);

            return;
        }

        if (this.listLayout) {
            const attributeList = this.fetchAttributeListFromLayout();

            callback(attributeList);

            return;
        }

        this._loadListLayout(listLayout => {
            this.listLayout = listLayout;

            let attributeList = this.fetchAttributeListFromLayout();

            if (this.mandatorySelectAttributeList) {
                attributeList = attributeList.concat(this.mandatorySelectAttributeList);
            }

            callback(attributeList);
        });
    }

    /**
     * @protected
     * @return {string[]}
     */
    fetchAttributeListFromLayout() {
        const selectProvider = new SelectProvider(
            this.getHelper().layoutManager,
            this.getHelper().metadata,
            this.getHelper().fieldManager
        );

        return selectProvider.getFromLayout(this.entityType, this.listLayout);
    }

    /** @protected */
    _getHeaderDefs() {
        const defs = [];

        const hiddenMap = this._listSettingsHelper ?
            this._listSettingsHelper.getHiddenColumnMap() : {};

        // noinspection JSIncompatibleTypesComparison
        if (!this.listLayout || !Array.isArray(this.listLayout)) {
            return [];
        }

        for (const col of this.listLayout) {
            let width = false;

            if ('width' in col && col.width !== null) {
                width = col.width + '%';
            }
            else if ('widthPx' in col) {
                width = col.widthPx + 'px';
            }

            const itemName = col.name;
            const label = col.label || itemName;

            const item = {
                name: itemName,
                isSortable: !(col.notSortable || false),
                width: width,
                align: ('align' in col) ? col.align : false,
            };

            if ('customLabel' in col) {
                item.customLabel = col.customLabel;
                item.hasCustomLabel = true;
                item.label = item.customLabel;
            }
            else {
                item.label = this.translate(label, 'fields', this.collection.entityType);
            }

            if (col.noLabel) {
                item.label = null;
            }

            if (item.isSortable) {
                item.isSorted = this.collection.orderBy === itemName;

                if (item.isSorted) {
                    item.isDesc = this.collection.order === 'desc' ;
                }
            }

            if (itemName && hiddenMap[itemName]) {
                continue;
            }

            if (itemName) {
                if (hiddenMap[itemName]) {
                    continue;
                }

                if (col.hidden && !(itemName in hiddenMap)) {
                    continue;
                }
            }

            defs.push(item);
        }

        const isCustomSorted =
            this.collection.orderBy !== this.collection.defaultOrderBy ||
            this.collection.order !== this.collection.defaultOrder;

        if (this.rowActionsView && !this.rowActionsDisabled || isCustomSorted) {
            let html = null;

            if (isCustomSorted) {
                html =
                    $('<a>')
                        .attr('role', 'button')
                        .attr('tabindex', '0')
                        .addClass('reset-custom-order')
                        .attr('title', this.translate('Reset'))
                        .append(
                            $('<span>').addClass('fas fa-times fa-sm')
                        )
                        .get(0).outerHTML
            }

            defs.push({
                width: this.rowActionsColumnWidth + 'px',
                html: html,
                className: 'action-cell',
            });
        }

        return defs;
    }

    /** @protected */
    _convertLayout(listLayout, model) {
        model = model || this.collection.prepareModel();

        const layout = [];

        if (this.checkboxes) {
            layout.push({
                name: 'r-checkboxField',
                columnName: 'r-checkbox',
                template: 'record/list-checkbox',
            });
        }

        const hiddenMap = this._listSettingsHelper ?
            this._listSettingsHelper.getHiddenColumnMap() : {};

        for (const col of listLayout) {
            const type = col.type || model.getFieldType(col.name) || 'base';

            if (!col.name) {
                continue;
            }

            const item = {
                columnName: col.name,
                name: col.name + 'Field',
                view: col.view ||
                    model.getFieldParam(col.name, 'view') ||
                    this.getFieldManager().getViewName(type),
                options: {
                    defs: {
                        name: col.name,
                        params: col.params || {}
                    },
                    mode: 'list',
                },
            };

            if (col.width) {
                item.options.defs.width = col.width;
            }

            if (col.widthPx) {
                item.options.defs.widthPx = col.widthPx;
            }

            if (col.link) {
                item.options.mode = 'listLink';
            }
            if (col.align) {
                item.options.defs.align = col.align;
            }

            if (col.options) {
                for (const optionName in col.options) {
                    if (typeof item.options[optionName] !== 'undefined') {
                        continue;
                    }

                    item.options[optionName] = col.options[optionName];
                }
            }

            if (col.name) {
                if (hiddenMap[col.name]) {
                    continue;
                }

                if (col.hidden && !(col.name in hiddenMap)) {
                    continue;
                }
            }

            layout.push(item);
        }

        if (this.rowActionsView && !this.rowActionsDisabled) {
            layout.push(this.getRowActionsDefs());
        }

        return layout;
    }

    /**
     * Select a record.
     *
     * @param {string} id An ID.
     * @param {JQuery} [$target]
     * @param {boolean} [isSilent] Do not trigger the `check` event.
     */
    checkRecord(id, $target, isSilent) {
        if (!this.collection.get(id)) {
            return;
        }

        $target = $target || this.$el.find('.record-checkbox[data-id="' + id + '"]');

        if ($target.length) {
            $target.get(0).checked = true;
            $target.closest('tr').addClass('active');
        }

        const index = this.checkedList.indexOf(id);

        if (index === -1) {
            this.checkedList.push(id);
        }

        this.handleAfterCheck(isSilent);
    }

    /**
     * Unselect a record.
     *
     * @param {string} id An ID.
     * @param {JQuery} [$target]
     * @param {boolean} [isSilent] Do not trigger the `check` event.
     */
    uncheckRecord(id, $target, isSilent) {
        $target = $target || this.$el.find('.record-checkbox[data-id="' + id + '"]');

        if ($target.get(0)) {
            $target.get(0).checked = false;
            $target.closest('tr').removeClass('active');
        }

        const index = this.checkedList.indexOf(id);

        if (index !== -1) {
            this.checkedList.splice(index, 1);
        }

        this.handleAfterCheck(isSilent);
    }

    /**
     * @protected
     * @param {boolean} [isSilent]
     */
    handleAfterCheck(isSilent) {
        if (this.checkedList.length) {
            this.showActions();
        }
        else {
            this.hideActions();
        }

        if (this.checkedList.length === this.collection.models.length) {
            this.$el.find('.select-all').prop('checked', true);
        }
        else {
            this.$el.find('.select-all').prop('checked', false);
        }

        if (!isSilent) {
            this.trigger('check');
        }
    }

    /**
     * Get row-actions defs.
     *
     * @return {Object}
     */
    getRowActionsDefs() {
        const options = {
            defs: {
                params: {},
            },
            additionalActionList: this._additionalRowActionList || [],
            scope: this.scope,
        };

        if (this.options.rowActionsOptions) {
            for (const item in this.options.rowActionsOptions) {
                options[item] = this.options.rowActionsOptions[item];
            }
        }

        return {
            columnName: 'buttons',
            name: 'buttonsField',
            view: this.rowActionsView,
            options: options,
        };
    }

    /**
     * Is all-result is checked.
     *
     * @return {boolean}
     */
    isAllResultChecked() {
        return this.allResultIsChecked;
    }

    /**
     * Get checked record IDs.
     *
     * @return {string[]}
     */
    getCheckedIds() {
        return Espo.Utils.clone(this.checkedList);
    }

    /**
     * Get selected models.
     *
     * @return {module:model[]}
     */
    getSelected() {
        const list = [];

        this.$el.find('input.record-checkbox:checked').each((i, el) => {
            const id = $(el).attr('data-id');
            const model = this.collection.get(id);

            list.push(model);
        });

        return list;
    }

    /** @protected */
    getInternalLayoutForModel(callback, model) {
        const scope = model.entityType;

        if (this._internalLayout === null) {
            this._internalLayout = {};
        }

        if (!(scope in this._internalLayout)) {
            this._internalLayout[scope] = this._convertLayout(this.listLayout[scope], model);
        }

        callback(this._internalLayout[scope]);
    }

    /** @protected */
    getInternalLayout(callback, model) {
        if (
            (this.scope === null) &&
            !Array.isArray(this.listLayout)
        ) {
            if (!model) {
                callback(null);

                return;
            }

            this.getInternalLayoutForModel(callback, model);

            return;
        }

        if (this._internalLayout !== null) {
            callback(this._internalLayout);

            return;
        }

        if (this.listLayout !== null) {
            this._internalLayout = this._convertLayout(this.listLayout);

            callback(this._internalLayout);

            return;
        }

        this._loadListLayout(listLayout => {
            this.listLayout = listLayout;
            this._internalLayout = this._convertLayout(listLayout);

            callback(this._internalLayout);
        });
    }

    /**
     * Compose a cell selector for a layout item.
     *
     * @param {module:model} model A model.
     * @param {Object} item An item.
     * @return {string}
     */
    getItemEl(model, item) {
        return this.getSelector() +
            ' tr[data-id="' + model.id + '"]' +
            ' td.cell[data-name="' + item.columnName + '"]';
    }

    prepareInternalLayout(internalLayout, model) {
        internalLayout.forEach((item) => {
            item.el = this.getItemEl(model, item);
        });
    }

    /**
     * Build a row.
     *
     * @param {number} i An index.
     * @param {module:model} model A model.
     * @param {function(module:view):void} [callback] A callback.
     */
    buildRow(i, model, callback) {
        const key = model.id;

        this.rowList.push(key);

        this.getInternalLayout(internalLayout => {
            internalLayout = Espo.Utils.cloneDeep(internalLayout);

            this.prepareInternalLayout(internalLayout, model);

            const acl = {
                edit: this.getAcl().checkModel(model, 'edit') && !this.editDisabled,
                delete: this.getAcl().checkModel(model, 'delete') && !this.removeDisabled,
            };

            this.createView(key, 'views/base', {
                model: model,
                acl: acl,
                rowActionHandlers: this._rowActionHandlers || {},
                selector: '.list-row[data-id="' + key + '"]',
                optionsToPass: ['acl', 'rowActionHandlers'],
                layoutDefs: {
                    type: this._internalLayoutType,
                    layout: internalLayout,
                },
                setViewBeforeCallback: this.options.skipBuildRows && !this.isRendered(),
            }, callback);
        }, model);
    }

    /**
     * Build rows.
     *
     * @param {function():void} [callback] A callback.
     */
    buildRows(callback) {
        this.checkedList = [];

        this.rowList = [];

        if (this.collection.length <= 0) {
            if (typeof callback === 'function') {
                callback();

                this.trigger('after:build-rows');
            }

            return;
        }

        this.wait(true);

        const modelList = this.collection.models;
        let counter = 0;

        modelList.forEach((model, i) => {
            this.buildRow(i, model, () => {
                counter++;

                if (counter !== modelList.length) {
                    return;
                }

                if (typeof callback === 'function') {
                    callback();
                }

                this.wait(false);
                this.trigger('after:build-rows');
            });
        });
    }

    /**
     * Show more records.
     *
     * @param {{skipNotify?: boolean}} [options]
     * @param {module:collection} [collection]
     * @param {JQuery} [$list]
     * @param {JQuery} [$showMore]
     * @param {function(): void} [callback] A callback.
     */
    showMoreRecords(options, collection, $list, $showMore, callback) {
        collection = collection || this.collection;
        $showMore =  $showMore || this.$el.find('.show-more');
        $list = $list || this.$el.find(this.listContainerEl);
        options = options || {};

        const $container = this.$el.find('.list');

        $showMore.children('a').addClass('disabled');

        if (!options.skipNotify) {
            Espo.Ui.notify(' ... ');
        }

        const lengthBefore = collection.length;

        const final = () => {
            $showMore.parent().append($showMore);

            if (
                collection.total > collection.length + collection.lengthCorrection ||
                collection.total === -1
            ) {
                const moreCount = collection.total - collection.length - collection.lengthCorrection;
                const moreCountString = this.getNumberUtil().formatInt(moreCount);

                this.$el.find('.more-count').text(moreCountString);

                $showMore.removeClass('hidden');
                $container.addClass('has-show-more');
            }
            else {
                $showMore.remove();
                $container.removeClass('has-show-more');
            }

            $showMore.children('a').removeClass('disabled');

            if (this.allResultIsChecked) {
                this.$el
                    .find('input.record-checkbox')
                    .attr('disabled', 'disabled')
                    .prop('checked', true);
            }

            if (!options.skipNotify) {
                Espo.Ui.notify(false);
            }

            if (callback) {
                callback.call(this);
            }

            this.trigger('after:show-more', lengthBefore);
        };

        const initialCount = collection.length;

        const success = () => {
            if (!options.skipNotify) {
                Espo.Ui.notify(false);
            }

            $showMore.addClass('hidden');
            $container.removeClass('has-show-more');

            const rowCount = collection.length - initialCount;
            let rowsReady = 0;

            if (collection.length <= initialCount) {
                final();
            }

            for (let i = initialCount; i < collection.length; i++) {
                const model = collection.at(i);

                this.buildRow(i, model, view => {
                    const model = view.model;

                    const $existingRow = this.getDomRowItem(model.id);

                    if ($existingRow && $existingRow.length) {
                        $existingRow.remove();
                    }

                    $list.append(
                        $(this.getRowContainerHtml(model.id))
                    );

                    view.render()
                        .then(() => {
                            rowsReady++;

                            if (rowsReady === rowCount) {
                                final();
                            }
                        });
                });
            }

            this.noRebuild = true;
        };

        this.listenToOnce(collection, 'update', (collection, o) => {
            if (o.changes.merged.length) {
                collection.lengthCorrection += o.changes.merged.length;
            }
        });

        // If using promise callback, then need to pass `noRebuild: true`.
        collection.fetch({
            success: success,
            remove: false,
            more: true,
        });
    }

    getDomRowItem(id) {
        return null;
    }

    /**
     * Compose a row-container HTML.
     *
     * @param {string} id A record ID.
     * @return {string} HTML.
     */
    getRowContainerHtml(id) {
        return $('<tr>')
            .attr('data-id', id)
            .addClass('list-row')
            .get(0).outerHTML;
    }

    actionQuickView(data) {
        data = data || {};

        const id = data.id;

        if (!id) {
            console.error("No id.");

            return;
        }

        let model = null;

        if (this.collection) {
            model = this.collection.get(id);
        }

        let scope = data.scope;

        if (!scope && model) {
            scope = model.entityType;
        }

        if (!scope) {
            scope = this.scope;
        }

        if (!scope) {
            console.error("No scope.");

            return;
        }

        if (this.quickDetailDisabled) {
            this.getRouter().navigate('#' + scope + '/view/' + id, {trigger: true});

            return;
        }

        const helper = new RecordModal(this.getMetadata(), this.getAcl());

        helper
            .showDetail(this, {
                id: id,
                scope: scope,
                model: model,
                rootUrl: this.options.keepCurrentRootUrl ?
                    this.getRouter().getCurrentUrl() : null,
                editDisabled: this.quickEditDisabled,
            })
            .then(view => {
                if (!model) {
                    return;
                }

                this.listenTo(view, 'after:save', model => {
                    this.trigger('after:save', model);
                });
            });
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {Object.<string, *>} data
     */
    actionQuickEdit(data) {
        data = data || {};

        const id = data.id;

        if (!id) {
            console.error("No id.");

            return;
        }

        let model = null;

        if (this.collection) {
            model = this.collection.get(id);
        }

        let scope = data.scope;

        if (!scope && model) {
            scope = model.entityType;
        }

        if (!scope) {
            scope = this.scope;
        }

        if (!scope) {
            console.error("No scope.");

            return;
        }

        const viewName = this.getMetadata().get(['clientDefs', scope, 'modalViews', 'edit']) ||
            'views/modals/edit';

        if (!this.quickEditDisabled) {
            Espo.Ui.notify(' ... ');

            const options = {
                scope: scope,
                id: id,
                model: model,
                fullFormDisabled: data.noFullForm,
                returnUrl: this.getRouter().getCurrentUrl(),
                returnDispatchParams: {
                    controller: scope,
                    action: null,
                    options: {
                        isReturn: true,
                    },
                },
            };

            if (this.options.keepCurrentRootUrl) {
                options.rootUrl = this.getRouter().getCurrentUrl();
            }

            this.createView('modal', viewName, options, (view) => {
                view.once('after:render', () => {
                    Espo.Ui.notify(false);
                });

                view.render();

                this.listenToOnce(view, 'remove', () => {
                    this.clearView('modal');
                });

                this.listenToOnce(view, 'after:save', (m) => {
                    const model = this.collection.get(m.id);

                    if (model) {
                        model.set(m.getClonedAttributes());
                    }

                    this.trigger('after:save', m);
                });
            });

            return;
        }

        const options = {
            id: id,
            model: this.collection.get(id),
            returnUrl: this.getRouter().getCurrentUrl(),
            returnDispatchParams: {
                controller: scope,
                action: null,
                options: {
                    isReturn: true,
                }
            },
        };

        if (this.options.keepCurrentRootUrl) {
            options.rootUrl = this.getRouter().getCurrentUrl();
        }

        this.getRouter().navigate('#' + scope + '/edit/' + id, {trigger: false});
        this.getRouter().dispatch(scope, 'edit', options);
    }

    /**
     * Compose a row selector.
     *
     * @param {string} id A record ID.
     * @return {string}
     */
    getRowSelector(id) {
        return 'tr[data-id="' + id + '"]';
    }

    // noinspection JSUnusedGlobalSymbols
    actionQuickRemove(data) {
        data = data || {};

        const id = data.id;

        if (!id) {
            return;
        }

        const model = this.collection.get(id);

        if (!this.getAcl().checkModel(model, 'delete')) {
            Espo.Ui.error(this.translate('Access denied'));

            return;
        }

        this.confirm({
            message: this.translate('removeRecordConfirmation', 'messages', this.scope),
            confirmText: this.translate('Remove'),
        }, () => {
            this.collection.trigger('model-removing', id);
            this.collection.remove(model);

            Espo.Ui.notify(' ... ');

            model
                .destroy({wait: true, fromList: true})
                .then(() => {
                    Espo.Ui.success(this.translate('Removed'));

                    this.removeRecordFromList(id);
                })
                .catch(() => {
                    this.collection.push(model);
                });
        });
    }

    /**
     * @protected
     * @param {string} id An ID.
     */
    removeRecordFromList(id) {
        this.collection.remove(id);

        if (this.collection.total > 0) {
            this.collection.total--;
        }

        this.$el.find('.total-count-span').text(this.collection.total.toString());

        let index = this.checkedList.indexOf(id);

        if (index !== -1) {
            this.checkedList.splice(index, 1);
        }

        const key = id;

        this.clearView(key);

        index = this.rowList.indexOf(key);

        if (~index) {
            this.rowList.splice(index, 1);
        }

        this.removeRowHtml(id);
    }

    /**
     * @protected
     * @param {string} id An ID.
     */
    removeRowHtml(id) {
        this.$el.find(this.getRowSelector(id)).remove();

        if (
            this.collection.length === 0 &&
            (this.collection.total === 0 || this.collection.total === -2)
        ) {
            this.reRender();
        }
    }

    /**
     * @public
     * @param {string} id An ID.
     * @return {boolean}
     */
    isIdChecked(id) {
        return this.checkedList.indexOf(id) !== -1;
    }

    // noinspection JSUnusedGlobalSymbols
    getTableMinWidth() {
        if (!this.listLayout) {
            return;
        }

        let totalWidth = 0;
        let totalWidthPx = 0;
        let emptyCount = 0;
        let columnCount = 0;

        this.listLayout.forEach((item) => {
            columnCount ++;

            if (item.widthPx) {
                totalWidthPx += item.widthPx;

                return;
            }

            if (item.width) {
                totalWidth += item.width;

                return;
            }

            emptyCount ++;
        });

        if (this.rowActionsView && !this.rowActionsDisabled) {
            totalWidthPx += this.rowActionsColumnWidth;
        }

        if (this.checkboxes) {
            totalWidthPx += this.checkboxColumnWidth;
        }

        let minWidth;

        if (totalWidth >= 100) {
            minWidth = columnCount * this.minColumnWidth;
        }
        else {
            minWidth = (totalWidthPx + this.minColumnWidth * emptyCount) / (1 - totalWidth / 100);
            minWidth = Math.round(minWidth);
        }

        return minWidth;
    }

    setupRowActionDefs() {
        this._rowActionHandlers = {};

        const list = this.options.additionalRowActionList;

        if (!list) {
            return;
        }

        this._additionalRowActionList = list;

        const defs = this.getMetadata().get(`clientDefs.${this.scope}.rowActionDefs`) || {};

        const promiseList = list.map(action => {
            /** @type {{handler: string, label?: string, labelTranslation?: string}} */
            const itemDefs = defs[action] || {};

            if (!itemDefs.handler) {
                return Promise.resolve();
            }

            return Espo.loader.requirePromise(itemDefs.handler)
                .then(Handler => {
                    this._rowActionHandlers[action] = new Handler(this);

                    return true;
                });
        });

        this.wait(Promise.all(promiseList));
    }

    // noinspection JSUnusedGlobalSymbols
    actionRowAction(data) {
        const action = data.actualAction;
        const id = data.id;

        if (!action) {
            return;
        }

        /** @type {{process: function(module:model, string)}} */
        const handler = (this._rowActionHandlers || {})[action];

        if (!handler) {
            console.warn(`No handler for action ${action}.`);

            return;
        }

        const model = this.collection.get(id);

        if (!model) {
            return;
        }

        handler.process(model, action);
    }

    /** @private */
    setupSettings() {
        if (!this.options.settingsEnabled || !this.collection.entityType || !this.layoutName) {
            return;
        }

        if (
            (
                !this.forceSettings &&
                !this.getMetadata().get(`scopes.${this.entityType}.object`)
            ) ||
            this.getConfig().get('listViewSettingsDisabled')
        ) {
            return;
        }

        if (this.settingsDisabled) {
            return;
        }

        this._listSettingsHelper = new ListSettingsHelper(
            this.entityType,
            this.layoutName,
            this.getUser().id,
            this.getStorage()
        );

        const view = new RecordListSettingsView({
            layoutProvider: () => this.listLayout,
            helper: this._listSettingsHelper,
            entityType: this.entityType,
            onChange: () => {
                this._internalLayout = null;

                Espo.Ui.notify(' ... ');

                this.collection.fetch()
                    .then(() => Espo.Ui.notify(false));
            },
        });

        this.assignView('settings', view, '.settings-container');
    }
}

export default ListRecordView;
