import React, { useState, useEffect } from 'react';
import { API, CEF } from 'api';

interface QuestionProps {
  ans: string[];
  ansClick(ans: number): void;
  isNew: boolean;
}

const Question = ({ ans, ansClick, isNew }: QuestionProps) => {
  const [checked, setChecked] = useState(null);

  useEffect(() => {
    if (isNew) setChecked(null);
  });

  return (
    <div className="enter-answers-wrap">
      {ans.map((i, x) => {
        return (
          <div key={x}>
            <input
              className={'enter-answer ' + (checked == x ? 'checked' : '')}
              onClick={() => setChecked(x)}
              type="radio"
              value={`answer-${x + 1}`}
              name="question-1"
              id={`question-${x + 1}`}
            />
            <label htmlFor={`question-${x + 1}`} onClick={() => ansClick(x + 1)}>
              {i}
            </label>
          </div>
        );
      })}
    </div>
  );
};

export default Question;
