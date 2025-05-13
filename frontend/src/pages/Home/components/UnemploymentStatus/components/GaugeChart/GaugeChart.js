"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var echarts = require("echarts");
var styles_module_css_1 = require("./styles.module.css");
var GaugeChart = function (_a) {
    var percentLeft = _a.percentLeft;
    (0, react_1.useEffect)(function () {
        var chartDom = document.getElementById('gauge-chart');
        var chartInstance = echarts.init(chartDom);
        var gaugeChartOptions = {
            series: [
                {
                    name: 'Progress',
                    type: 'gauge',
                    radius: '100%',
                    detail: {
                        valueAnimation: true,
                        formatter: '{value}%',
                        fontSize: 16
                    },
                    data: [
                        { value: percentLeft, name: 'Time Left' }
                    ],
                    axisLine: {
                        lineStyle: {
                            color: [
                                [0.3, '#F44336'], // Red: 0-30%
                                [0.7, '#FFEB3B'], // Yellow: 30-70%
                                [1, '#4CAF50'] // Green: 70%-100%
                            ]
                        }
                    },
                    pointer: {
                        width: 5
                    }
                }
            ]
        };
        chartInstance.setOption(gaugeChartOptions);
        return function () {
            chartInstance.dispose();
        };
    }, [percentLeft]);
    return (<div className={styles_module_css_1.default.container}>
            <div id="gauge-chart" className={styles_module_css_1.default["gauge-chart"]}></div>
        </div>);
};
exports.default = GaugeChart;
