/*
 *  Power BI Visual CLI
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

module powerbi.extensibility.visual {
    export class Visual implements IVisual {
        private $root: d3.Selection<Element>;
        private host: IVisualHost;
        private settings: VisualSettings;
        private selectionIdBuilder: ISelectionIdBuilder;
        private selectionManager: ISelectionManager;
        private selections: ISelectionId[];
        private rows: any[];

        constructor(options: VisualConstructorOptions) {
            // Creates unique selectors for selection
            this.selectionIdBuilder = options.host.createSelectionIdBuilder();

            // Creates selection manager to handle selections
            this.selectionManager = options.host.createSelectionManager();

            // Save host
            this.host = options.host;

            // Create wrapper to don't use css !important

            this.$root = d3.select(options.element)
                .append('div')
                .attr('class', 'root')
                .on('click', () => {
                    const target = d3.select((<MouseEvent>d3.event).target);

                    // If captured some object with selection data
                    const targetSelection = target.data()[0];

                    if (targetSelection) {
                        const targetSelectionData = targetSelection.selection;
                        const targetSelectionValue = targetSelection.item;

                        this.$root.attr('class', 'root root_filtered');

                        // Do selection
                        this.selectionManager.clear().then(() => {
                            const selections = [];
                            d3.selectAll('.container__list-item')
                                .each(function(datum) {
                                    const selectionItem = d3.select(this);
                                    selectionItem.attr('class', 'container__list-item');
                                    if (datum.item === targetSelectionValue) {
                                        selections.push(datum.selection);
                                        selectionItem
                                            .attr(
                                                'class',
                                                'container__list-item container__list-item_focused'
                                            );
                                    }
                                });
                            this.selectionManager.select(selections);
                        });
                    } else {
                        // Do unselection
                        this.selectionManager.clear().then(() => {
                            d3.select('.container__list-item_focused')
                                .attr('class', 'container__list-item');
                            this.$root.attr('class', 'root');
                        });
                    }
                });
        }

        private getSelectionIds(dataView: DataView): ISelectionId[] {
            return dataView.table.identity.map((identity: DataViewScopeIdentity) => {
                const categoryColumn: DataViewCategoryColumn = {
                    source: dataView.table.columns[0],
                    values: null,
                    identity: [identity]
                };

                return this.host.createSelectionIdBuilder()
                    .withCategory(categoryColumn, 0)
                    .createSelectionId();
            });
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            const settings: VisualSettings = this.settings
                || VisualSettings.getDefault() as VisualSettings;

            const instanceEnumeration: VisualObjectInstanceEnumeration =
                VisualSettings.enumerateObjectInstances(settings, options);

            return instanceEnumeration || [];
        }

        public update(options: VisualUpdateOptions) {
            const dataView = _.get<DataView>(options, 'dataViews.0');

            // Parse external settings
            this.settings = VisualSettings.parse<VisualSettings>(dataView);

            // Generate selections
            this.selections = this.getSelectionIds(dataView);

            // Use lodash to safely get the categories
            this.rows = _.get<string[]>(options, 'dataViews.0.table.rows', []);

            // Hash values to drop O(n^2) performance leak
            let groupedValues = this.rows.reduce((result, value, index) => {
                (result[this.rows[index][0]] = result[this.rows[index][0]] || {})[index] = value[1];
                return result;
            }, {});

            // clear all previous items
            this.$root.html(null);

            Object.keys(groupedValues).map(key => {
                // Create general container
                let container = this.$root
                    .append('div')
                    .attr('class', 'container');

                // Create header
                container
                    .append('h2')
                    .attr('class', 'container__header')
                    .text(key)
                    .style({ fontSize: this.settings.header.fontSize + 'pt' });

                // Create a new list container
                let listContainer = container
                    .append('ul')
                    .attr('class', 'container__list');

                // Display list of categories
                Object.keys(groupedValues[key]).map(itemKey => {
                    return listContainer
                        .append('li')
                        .data([{ item: groupedValues[key][itemKey], selection: this.selections[itemKey] }])
                        .attr('class', 'container__list-item')
                        .style({ fontSize: this.settings.items.fontSize + 'pt' })
                        .text(groupedValues[key][itemKey])
                });
            });
        }
    }
}