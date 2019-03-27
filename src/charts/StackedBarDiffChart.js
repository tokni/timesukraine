import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {VictoryChart, VictoryLabel, VictoryLegend, VictoryGroup, VictoryStack, VictoryTheme, VictoryAxis, VictoryBar, VictoryLine, VictoryTooltip} from 'victory';
import stackedBar from '../data/stackedBar';
import line from '../data/line';
import { NamespacesConsumer } from 'react-i18next';

const ChartHeader = styled(VictoryLabel)`
  text-anchor: start;
  fill: #000000;
  font-family: inherit;
  font-size: 18px;
  font-weight: bold;
  `;
  ChartHeader.displayName = 'ChartHeader';

class StackedBarChart extends React.Component {
  render() {
    const scenario = this.props.selectedScenario;
    const scenario2 = this.props.selectedScenario2;
    const chartName = this.props.chartName;
    const chartTitle = this.props.chartTitle;
    const combinedChart = this.props.combinedChart;
    const periods = [2015, 2020, 2025, 2030, 2035, 2040, 2045, 2050];
    let gutter, rowGutter;
    let minY = this.props.minY;
    let maxY = this.props.maxY;

    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      gutter=0;
      rowGutter=0;
    } else {
      gutter=-40;
      rowGutter=-5;
    }    

    let maxY2 = 1;
    let minY2 = 0;
    if(combinedChart===true) {
      maxY2 = this.props.maxY2;
      minY2 = this.props.minY2;
    }

    let yDomain = [0, 1];
    if(minY<0 || minY2<0) {
      let stackedRatio = minY/maxY;
      let lineRatio = minY2/maxY2;
      yDomain = stackedRatio<lineRatio ? [stackedRatio,1] : [lineRatio,1];
    }

    let dataset3 = [];
    stackedBar.data.scenarios
      .filter(o => (o.scenario === scenario || o.scenario === scenario2))
      .map(scenario => scenario.indicators
        .filter(o => o.indicator === chartName)
        .map(indicator => indicator.indicatorGroups
          .map((chartGroup,i) => {
            if(dataset3.find(c => c.indicatorGroup === chartGroup.indicatorGroup)===undefined) {
              dataset3.push(JSON.parse(JSON.stringify(chartGroup)));
            } else {
              for(var j=0; j<dataset3[i].indicatorGroupValues.length; j++) {
                dataset3[i].indicatorGroupValues[j].total -= chartGroup.indicatorGroupValues[j].total;
              }
            }
            return chartGroup;
          })
        )
      );
    // Find the minimum and maximum stacked values
    let minValue = -0.00001;
    let maxValue = 0.00001;
    for(var i=0; i<periods.length; i++) {
      let totalValuePos = 0;
      let totalValueNeg = 0;
      for(var j=0; j<dataset3.length; j++) {
        let value = dataset3[j].indicatorGroupValues[i].total;
        if(value<0) {
          totalValueNeg += value;
        } else {
          totalValuePos += value;
        }
        
      }
      if(totalValuePos>maxValue) {
        maxValue = totalValuePos;
      }
      if(totalValueNeg<minValue) {
        minValue = totalValueNeg;
      }
    }
    if(-minValue>maxValue) {
      maxValue=-minValue;
    }

    let datasetLine3 = [];      
    if(combinedChart===true) {
      line.data.scenarios
        .filter(o => (o.scenario === scenario || o.scenario === scenario2))
        .map(scenario => scenario.indicators
          .filter(o => o.indicator === chartName)
          .map(indicator => indicator.indicatorGroups
            .map((chartGroup, i) => {
              if(datasetLine3.find(c => c.indicatorGroup === chartGroup.indicatorGroup)===undefined) {
                datasetLine3.push(JSON.parse(JSON.stringify(chartGroup)));
              } else {
                for(var j=0; j<datasetLine3[i].indicatorGroupValues.length; j++) {
                  datasetLine3[i].indicatorGroupValues[j].total -= chartGroup.indicatorGroupValues[j].total;
                }
              }
              return chartGroup;
            })
          )
        );
    }

    const colors = [
      "#5cbae6", "#b6d957", "#fac364", "#8cd3ff", "#d998cb", "#f2d249", "#93b9c6", "#ccc5a8",   
      "#ffcc00", "#ff9900", "#ff6600", "#ff0000", "#990000", "#ff0099", "#cc3399",
      "#990066", "#660066", "#660099", "#3366cc", "#33ccff", "#99cc33", "#66cc00",
      "#aad199", "#45535c", "#471442", "#612e30", "#7a713c", "#09e682", "#160154", "#fc53ec",
      "#454023", "#4b7060", "#4221a6", "#f2aceb", "#ede095", "#0395f7", "#7346fa", "#82627f"
    ];

    return (
      <NamespacesConsumer>{t =>
	    <div>
        <VictoryChart
          domainPadding={20}
          width={380}
          height={380}
          padding={{left: 80, right: 50, top: 50, bottom: 50}}
          theme={VictoryTheme.material}
          domain={{ y: yDomain }}
        >
          <ChartHeader x={90} y={24}
            text={chartTitle}
          />
          <VictoryAxis
            key={0}
            tickValues={periods}
            tickFormat={periods}
          />
          <VictoryAxis
            dependentAxis
            axisLabelComponent={<VictoryLabel dx={120}/>}
            key={2}
            offsetX={80}
            tickFormat={
              (t) => {
                if(isNaN(maxValue)) {
                  return 0;
                }
                return Math.round(t*maxValue/this.props.divideValues,0)
              }
            }
            tickValues={[-0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75]}
            label={this.props.label}
          />
          {combinedChart===true  &&
            <VictoryAxis
              dependentAxis
              key={3}
              offsetX={330}
              label={this.props.label2}
              style={{
                axis: { stroke: 'gray' },
                axisLabel: { fill: 'gray', padding: -50},
                ticks: { padding: -25 },
                tickLabels: { fill: 'gray', textAnchor: 'start' }
              }}              
              tickFormat={(t) => `${this.props.Y2Percentage===false ? (t*maxY2) : (t*maxY2*100)+'%'}`}
              tickValues={[-1.0, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1.0]}
            />
          }          
          <VictoryLegend x={90} y={50}
            orientation="horizontal"
            gutter={gutter}
            rowGutter={rowGutter}
            symbolSpacer={4}
            itemsPerRow={3}
            style={{
              title: {fontSize: 14, leftPadding: -10 }
            }}
            colorScale = {colors}
            data={dataset3.map(
              (chartGroup, i) => (
                { name: t('legend.' + chartGroup.indicatorGroup).concat("        ").substr(0,16), fill: colors[i] }
              )
            )}
            labelComponent={<VictoryLabel style={{fontSize: '9px'}}/>}
          />
          <VictoryGroup offset={10} style={{ data: { width: 10}}}>
            <VictoryStack>
            {
              dataset3.map(
                (chartGroup, i) => (
                  <VictoryBar 
                    key={chartGroup.indicatorGroup}
                    data={chartGroup.indicatorGroupValues.map(
                      chartGroupValue => (
                        {...chartGroupValue, 
                          label: 'Difference: ' + chartGroup.indicatorGroup + ': ' +
                          (chartGroupValue.total/this.props.divideValues).toFixed(2) }
                      )
                    )}
                    x='year'
                    y={(datum) => datum['total'] / maxValue}
                    labelComponent={<VictoryTooltip/>}
                    style={{
                      data: {fill: colors[i]}
                    }}
                  />
                )
              )
            }
            </VictoryStack>
          </VictoryGroup> 
          {(combinedChart===true) &&
            <VictoryGroup>
              <VictoryLine
                data={
                  datasetLine3[0].indicatorGroupValues.map(
                    entry => (
                      {...entry, 
                        label: `${this.props.Y2Percentage===false ? (entry.total).toFixed(0) : (entry.total*100).toFixed(0)+'%'}`
                      }                      
                    )
                  )
                }
                x='year'
                style={{ data: { stroke: 'green' }, labels: {fontSize: '8px'} }}
                y={(datum) => datum['total'] / maxY2}
                animate={{ duration: 500 }}
                labelComponent={<VictoryLabel dy={7}/>}
              />
            </VictoryGroup>
          }
          </VictoryChart>
      </div>
	 }</NamespacesConsumer>
    )
  }
}

StackedBarChart.defaultProps = {
  divideValues: 1
}

StackedBarChart.propTypes = {
  selectedScenario: PropTypes.string.isRequired,
  selectedScenario2: PropTypes.string.isRequired,
  chartName: PropTypes.string.isRequired,
  chartTitle: PropTypes.string.isRequired,
  combinedChart: PropTypes.bool.isRequired,
  minY: PropTypes.number.isRequired,
  maxY: PropTypes.number.isRequired,
  minY2: PropTypes.number,
  maxY2: PropTypes.number,  
  label: PropTypes.string.isRequired,
  divideValues: PropTypes.number,
  label2: PropTypes.string,
  Y2Percentage: PropTypes.bool
}

export default StackedBarChart;