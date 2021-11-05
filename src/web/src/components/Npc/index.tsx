import React, { Component } from 'react';
import Parser from 'html-react-parser';
interface NpcState {
  role: string;
  name: string;
  messages: {me:boolean,text:string}[];
  answers: string[];
  askid: number;
  counter: number;
}

class Npc extends Component<any, NpcState> {
  eOpen: RegisterResponse;
  constructor(props: any) {
    super(props);

    this.state = {
      role: '',
      name: '',
      messages: [],
      answers: [],
      askid: 0,
      counter: 0,
    };

    this.eOpen = mp.events.register('dialog:open', (name:string, role:string, text:string, answers:string[], askid:number) => {
      this.setState(
        (state) => {
          state.messages.push({text,me:false});
          return {
            ...state,
            role,
            name,
            answers,
            askid,
            counter:state.counter+1,
          };
        },
        () => {
          document
            .querySelector('.npc-chat .msg:last-child')
            .scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      );
    });
  }

  componentWillUnmount() {
    this.eOpen.destroy();
  }
  
  answer(e: React.SyntheticEvent<HTMLButtonElement>, id: number) {
    e.preventDefault();
    this.setState(
      (state) => {
        state.messages.push({text:state.answers[id],me:true});
        return { ...state, counter: state.counter-1 };
      },
      () => {
        document
          .querySelector('.npc-chat .msg:last-child')
          .scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    );

    

    setTimeout(() => {
      mp.events.triggerServer('dialog:answer', this.state.askid, id);
    }, 500);
    setTimeout(() => {
      if(this.state.counter == 0){
        mp.trigger("npc:close");
      }
    }, 1500);
  }

  render() {
    const { role, name, messages, answers } = this.state;
    return (
      <>
        <i className="dark-right"></i>
        <div className="npc-wrap">
          <div className="npc-who">{role}</div>
          <div className="npc-name">{name}</div>
          <div className="npc-chat">
            {messages.map((msg, id) =>
              msg ? (
                <div className={!msg.me ? 'npc-message msg' : 'my-message msg'}>>{Parser(msg.text)}</div>
              ) : (
                ''
              )
            )}
          </div>
          <div className="my-answers">
            {answers.map((ans, id) => (
              <button className="primary-button" onClick={(e) => this.answer(e, id)}>
                <span>{ans}</span>
              </button>
            ))}
          </div>
        </div>
      </>
    );
  }
}

export default Npc;
