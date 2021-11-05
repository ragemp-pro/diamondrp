import React, { useState, useEffect, FunctionComponent } from 'react';

interface RegulatorButtonProps {
  title: string;
  count: number;
  in?: boolean;
  large?: boolean;
  names?: string[];
  handler(value: number): void;
  random: boolean;
}

const RegulatorButton: FunctionComponent<RegulatorButtonProps> = ({
  title,
  count,
  in: isIn,
  large,
  names,
  handler,
  random,
}) => {
  const [current, setCurrent] = useState(0);

  const click = (key: number) => {
    if (key < 0) {
      const _key = count - 1;
      setCurrent(_key);
      handler(_key);
    } else if (key >= count) {
      setCurrent(0);
      handler(0);
    } else {
      setCurrent(key);
      handler(key);
    }
  };

  useEffect(() => {
    if (current + 1 > count) setCurrent(count - 1);
    if (random) {
      let value = Math.floor(Math.random() * count);
      handler(value);
      setCurrent(value);
    }
  });

  const label = count ? (
    <p>
      {names ? <>{names[current]}<br />{`(${current + 1} / ${count})`}</> : `${current + 1} из ${count}`}
    </p>
  ) : '';

  return (
    <div className={'regulator-wrap' + (isIn ? (large ? '-in-large' : '-in') : '')}>
      <p>{title}</p>
      <div className="buttons-wrap">
        {label}
        <button onClick={() => click(current - 1)}>
          <img src={require('./images/svg/arrow-left-pers.svg')} alt="" />
        </button>
        <button onClick={() => click(current + 1)}>
          <img src={require('./images/svg/arrow-right-pers.svg')} alt="" />
        </button>
      </div>
    </div>
  );
};

export default RegulatorButton;
