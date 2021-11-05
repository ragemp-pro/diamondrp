import React, { FunctionComponent } from 'react';

interface RegulatorGroupProps {
  children: JSX.Element[]
}

const RegulatorGroup: FunctionComponent<RegulatorGroupProps> = ({ children }) => {
  return <div className="regulator-wrap">{children}</div>;
};

export default RegulatorGroup;
