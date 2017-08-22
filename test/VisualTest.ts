/*
 *  Power BI Visualizations
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

/// <reference path="_references.ts"/>

module powerbi.extensibility.visual.test {
    // powerbi
    import DataView = powerbi.DataView;
    import VisualClass = powerbi.extensibility.visual.TrelloViz1503056644.Visual;
    import VisualBuilder = powerbi.extensibility.visual.test.VisualBuilder;
    import VisualData = powerbi.extensibility.visual.test.VisualData;

    // powerbi.extensibility.utils.test
    import clickElement = powerbi.extensibility.utils.test.helpers.clickElement;
    import renderTimeout = powerbi.extensibility.utils.test.helpers.renderTimeout;
    import getRandomNumbers = powerbi.extensibility.utils.test.helpers.getRandomNumbers;
    import assertColorsMatch = powerbi.extensibility.utils.test.helpers.color.assertColorsMatch;

    describe("TrelloVizual", () => {
        let visualBuilder: VisualBuilder,
        visualInstance: VisualClass,
        defaultDataViewBuilder: VisualData,
        dataView: DataView;

        beforeEach(() => {
            visualBuilder = new VisualBuilder(1000, 500);
            defaultDataViewBuilder = new VisualData();
            dataView = defaultDataViewBuilder.getDataView();
            visualInstance = visualBuilder.instance;
        });

        describe("data rendering", () => {
            it("rendering items", done => {
                let dataLength: number = defaultDataViewBuilder.valuesSourceDestination.length,
                    groupLength = Math.floor(dataLength / 3) - 2,
                    negativeValues = getRandomNumbers(groupLength, -100, 0),
                    zeroValues = _.range(0, groupLength, 0),
                    positiveValues = getRandomNumbers(
                        dataLength - negativeValues.length - zeroValues.length, 1, 100);
    
                defaultDataViewBuilder.valuesValue = negativeValues.concat(zeroValues).concat(positiveValues);
    
                visualBuilder.updateRenderTimeout([defaultDataViewBuilder.getDataView()], () => {
                    expect(visualBuilder.nodeElements.length).toBe(defaultDataViewBuilder.valuesValue.length);
    
                    done();
                });
            });

            it("rendering columns", done => {
                visualBuilder.updateRenderTimeout([defaultDataViewBuilder.getDataView()], () => {
                    
                    expect(visualBuilder.nodesElement.length).toBe(
                        _(defaultDataViewBuilder.valuesSourceDestination)
                            .countBy('0')
                            .reduce((prevKey, key) => { return prevKey + 1 }, 0)
                    );

                    done();
                }
            })
        });
    });
}