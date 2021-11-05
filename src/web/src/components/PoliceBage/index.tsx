import React, { useState, useEffect } from 'react';
import { CEF } from 'api';
import $ from 'jquery';

import close from 'assets/images/svg/close.svg';

interface BageData {
  type: string;
  name: string;
  organization: string;
  division: string;
  post: string;
}

const PoliceBage = () => {
  const handleKeyDown = (e: JQuery.Event) => {
    if (e.keyCode == 27) {
      CEF.gui.setGui(null);
    }
  };
  const [state, setState]: [BageData, any] = useState({
    type: 'рва',
    name: 'вра',
    division: 'вар',
    organization: 'рва',
    post: 'вра',
  });
  useEffect(() => {
    mp.events.register('cef:police_bage:init', function(type, name, organization, post, division) {
      setState({ type, name, organization, division, post });
      this.destroy();
    });
    $(document).on('keydown', handleKeyDown);
    return () => $(document).off('keydown', handleKeyDown);
  }, []);
  return (
    <div className="section-view">
      <div className={`police-bage-wrapper posrev ${state.type == 'sheriff' ? 'sheriff' : state.type == 'fib' ? 'fbi' : ''}`}>
        <i className="close" style={{ marginRight: 3, marginTop: 3 }}>
          <img src={close} onClick={() => CEF.gui.setGui(null)} />
        </i>
        <div className="police-bage-right">
          <p>
            <small>Имя</small>
          </p>
          <p className="mb30" style={{ marginBottom: 0}}>
            <strong>{state.name}</strong>
          </p>
          <p>
            <small>Организация</small>
          </p>
          <p className="mb30" style={{ marginBottom: 0 }}>
            <strong>{state.organization}</strong>
          </p>
          <p>
            <small>Должность</small>
          </p>
          <p className="mb30" style={{ marginBottom: 0 }}>
            <strong>{state.post}</strong>
          </p>
          {state.division ? (
            <>
              <p>
                <small>Отдел</small>
              </p>
              <p>
                <strong>{state.division}</strong>
              </p>
            </>
          ) : (
            ''
          )}
        </div>
      </div>
    </div>
  );
};

export default PoliceBage;
