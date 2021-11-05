import React, { FunctionComponent} from 'react';

interface WrapProps {
  children: JSX.Element[]
} 

const Wrap: FunctionComponent<WrapProps> = ({ children }) => {
  return (
    <div className="personage" style={{ background: 'transparent', backgroundImage: 'none' }}>
      <div className="white-box-create">{children}</div>
    </div>
  );
};

export default Wrap;
