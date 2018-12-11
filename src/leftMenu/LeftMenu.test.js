import React from 'react';
import LeftMenu from './LeftMenu';

it('renders the menu', () => {
  const scenarioSelection = {
    scenarioSelection: "UDEC_S_PAETT0N_00000_00-v01",
    scenarioSelection2: "",
    showWelcome: true,
    showDifference: false
  };
  const wrapper = shallow(<LeftMenu
    updateScenarioSelection={() => (false)}
    scenarioSelection={scenarioSelection}
    scenarioCombinations={{scenarioOptions: []}}
    toggleDifference={() => (false)}
  />);
  expect(wrapper.find('MenuLayout')).toHaveLength(1);
});