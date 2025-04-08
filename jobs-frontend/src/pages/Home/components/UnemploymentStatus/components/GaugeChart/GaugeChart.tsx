import {useEffect} from "react";
import * as echarts from "echarts";
import styles from "./styles.module.css";

const GaugeChart: React.FC<{percentLeft: number}> = ({percentLeft}) => {
    useEffect(() => {
        const chartDom = document.getElementById('gauge-chart');
        const chartInstance = echarts.init(chartDom);
        const gaugeChartOptions = {
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
                        {value: percentLeft, name: 'Time Left'}
                    ],
                    axisLine: {
                        lineStyle: {
                            color: [
                                [0.3, '#F44336'], // Red: 0-30%
                                [0.7, '#FFEB3B'], // Yellow: 30-70%
                                [1, '#4CAF50']    // Green: 70%-100%
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

        return () => {
            chartInstance.dispose();
        };

    }, [percentLeft]);

    return (
        <div className={styles.container}>
            <div id="gauge-chart" className={styles["gauge-chart"]}></div>
        </div>
    );
};

export default GaugeChart;