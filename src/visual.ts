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
        private settings: VisualSettings;

        constructor(options: VisualConstructorOptions) {
            // Create wrapper to don't use css !important

            this.$root = d3.select(options.element)
                .append('div')
                .attr('class', 'root');
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            const settings: VisualSettings = this.settings
                || VisualSettings.getDefault() as VisualSettings;

            const instanceEnumeration: VisualObjectInstanceEnumeration =
                VisualSettings.enumerateObjectInstances(settings, options);

            return instanceEnumeration || [];
        }

        public update(options: VisualUpdateOptions) {
            this.settings = VisualSettings.parse<VisualSettings>(_.get<DataView>(options, 'dataViews.0'));

                // Use lodash to safely get the categories
            let rows = _.get<string[]>(options, 'dataViews.0.table.rows', []);

            // Hash values to drop O(n^2) performance leak
            let groupedValues = rows.reduce((result, value, index) => {
                (result[rows[index][0]] = result[rows[index][0]] || []).push(value[1]);
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
                groupedValues[key].map(c =>
                    listContainer
                        .append('li')
                        .attr('class', 'container__list-item')
                        .style({ fontSize: this.settings.items.fontSize + 'pt' })
                        .text(c)
                );
            });
        }
    }
}