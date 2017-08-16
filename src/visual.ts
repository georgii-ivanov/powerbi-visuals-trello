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
        private $root: JQuery;

        constructor(options: VisualConstructorOptions) {
            // Create wrapper to don't use css !important

            this.$root = $('<div class="root" />')
                .appendTo(options.element);
        }

        public update(options: VisualUpdateOptions) {
            // Use lodash to safely get the categories
            let categories = _.get<string[]>(options, 'dataViews.0.categorical.categories.0.values', []);

            // Use lodash to safely get the values
            let values = _.get<string[]>(options, 'dataViews.0.categorical.values.0.values', []);

            // Hash values to drop O(n^2) performance leak
            let groupedValues = categories.reduce((result, key, index) => {
                (result[values[index]] = result[values[index]] || []).push(key);
                return result;
            }, {});

            // clear all previous items
            this.$root.empty();

            Object.keys(groupedValues).map(key => {
                // Create general container
                let container = $('<div class="container" />');

                // Create header
                $('<h2 class="container__header" />')
                    .text(key)
                    .appendTo(container);

                // Create a new list container
                let listContainer = $('<ul class="container__list" />');

                // Display list of categories
                let items = groupedValues[key].map(c => $('<li class="container__list-item">').text(c));

                $(listContainer)
                    .append(items)
                    .appendTo(container);

                // Append general container to root pbi element
                this.$root.append(container);
            });
        }
    }
}