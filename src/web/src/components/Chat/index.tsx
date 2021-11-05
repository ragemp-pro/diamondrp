import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import rpc from 'rage-rpc';

import { setChatActive } from '../../actions/gui';

interface Chat {
  label: string[];
  messageList: any;
  inputChat: any;
}
interface ChatProps {
  gui: string;
  binder: any;
  setChatActive(active: boolean): void;
}
interface ChatState {
  canActivate: boolean;
  active: boolean;
  show: boolean;
  value: string;
  messages: string[];
  historyMessages: string[];
  labelPosition: number;
  historyPosition: number;
  heightChat: number;
  fontChat: number;
}

class Chat extends Component<ChatProps, ChatState> {
  constructor(props: ChatProps) {
    super(props);

    this.state = {
      canActivate: true,
      active: false,
      show: true,
      value: '',
      messages: [],
      historyMessages: [],
      labelPosition: -1,
      historyPosition: -1,
      heightChat: 30,
      fontChat: 16,
    };

    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    mp.events.register('outputChatBox', (text: string) => {
      window.chatAPI.push(text)
    })
    window.chatAPI.push = this.insertMessageToChat.bind(this);
    window.chatAPI.clear = this.clearChat.bind(this);
    window.chatAPI.show = this.showChat.bind(this);
    window.chatAPI.activate = this.activeInput.bind(this);
    window.chatAPI.send = this.sendMessage.bind(this);
    window.chatAPI.value = this.valueInput.bind(this);

    this.label = ['/me ', '/do ', '/try '];

    mp.events.register('cef:chat:can_activate', (toggle: boolean) => {
      this.setState({ canActivate: toggle });
    });
    mp.events.register('cef:chat:params', (data: { heightChat: number, fontChat: number}) => {
      this.setState({ heightChat: data.heightChat, fontChat: data.fontChat });
    });
  }
  componentDidMount() {
    document.addEventListener('keyup', this.handleKeyUp);
    document.addEventListener('keydown', this.handleKeyDown);
  }
  componentWillUnmount() {
    document.removeEventListener('keyup', this.handleKeyUp);
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  insertMessageToChat(str: string) {
    // if (str.includes('Anti-cheat Guard') && (str.includes('TELEPORT') || str.includes('VEHICLE_BOOST'))) return;
    str = unescape(str);
    str = str.replace(/\n/g, " ")
    const entityMap: {
      [x: string]: string;
    } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;',
      '`': '&#x60;',
      '=': '&#x3D;'
    };
    
    let textResult = String(str).replace(/[&<>"'`=\/]/gi, (s) => {
      return entityMap[s];
    }).split('').reduce((str, s) => {
      return str + (/[a-zA-z0-9а-яА-ЯЁё\!\@\#\$\%\^\&\*\(\)\{\}\,\.\/\_\+\№\;\:\?\\\<\>\`\-]/gi.test(s) ? s : ' ');
    }, '');
		
		var matchColors = /!\{#\w*\}/gi;
		var match = textResult.match(matchColors);
		if (match !== null) {

			for(let i = 0; i < match.length; i++) {
				let clr = match[i].replace(match[i], match[i].replace('!{', '').replace('}', ''));
					textResult = textResult.replace(match[i], '<span style="color: ' + clr + '">');
			}
			
			for(let i = 0; i < match.length; i++) {
				textResult += '</span>';
			}
		}
		
		matchColors = /!\{\w*\}/gi;
		match = textResult.match(matchColors);
		if (match !== null) {

			for(let i = 0; i < match.length; i++) {
				let clr = match[i].replace(match[i], match[i].replace('!{', '').replace('}', ''));
					textResult = textResult.replace(match[i], '<span style="color: #' + clr + '">');
			}
			
			for(let i = 0; i < match.length; i++) {
				textResult += '</span>';
			}
    }

    this.addMessage(textResult);
    const scrollHeight = this.messageList ? this.messageList.scrollHeight : 0;
    const height = this.messageList ? this.messageList.clientHeight : 0;
    const maxScrollTop = scrollHeight - height;
    if(this.messageList) this.messageList.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
  }

  sendMessage(value: string) {
    value = value.trim();
    if (value.length > 0) {
      this.addHistoryMessage(value);
      if (value[0] === '/') {
        value = value.substr(1);
        if (value.length > 0) mp.invoke('command', value);
      } else {
        mp.invoke('chatMessage', value);
      }
    }
    this.valueInput('');
  }

  clearChat() {
    this.setState({ messages: [] });
  }

  showChat(show: boolean) {
    this.setState({ show });
  }

  activeInput(active: boolean) {
    if (!this.state.show) return;
    mp.trigger('setChatActiveInput', active ? true : false);
    if (this.state.active !== active) {
      mp.invoke('focus', active);
    }
    this.props.setChatActive(active);
    this.setState({
      active,
      historyPosition: -1,
    });
  }

  valueInput(value: string) {
    this.setState({
      value,
    });
  }

  addMessage(message: string) {
    this.setState(({ messages }) => {
      messages.push(message);
      if (messages.length > 100) messages.splice(1, 1);
      return {
        messages,
      };
    });
  }

  addHistoryMessage(message: string) {
    this.setState(({ historyMessages }) => {
      historyMessages.unshift(message);
      if (historyMessages.length > 100) historyMessages.pop();
      return {
        historyMessages,
      };
    });
  }

  updateHistoryPosition(historyPosition: number) {
    this.setState({ historyPosition });
  }

  updateLabelPosition(labelPosition: number) {
    this.setState({ labelPosition });
  }

  handleKeyDown(e: any) {
    if (e.keyCode == 84 && !this.state.active && this.state.canActivate) {
      if (this.props.gui == '/' || this.props.gui == null) {
        e.preventDefault();
        this.activeInput(true);
      }
    } else if (e.keyCode === 9 && this.state.active) {
      e.preventDefault();
      if (this.state.labelPosition === this.label.length - 1) {
        this.updateLabelPosition(-1);
        this.valueInput('');
      } else {
        this.updateLabelPosition(this.state.labelPosition + 1);
        this.valueInput(this.label[this.state.labelPosition]);
      }
    }
  }

  handleKeyUp(event: any) {
    if (event.keyCode === 13 && this.state.active) {
      event.preventDefault();
      this.sendMessage(this.inputChat.value);
      this.activeInput(false);
    } else if (event.keyCode === 27 && this.state.active) {
      event.preventDefault();
      this.activeInput(false);
    } else if (event.keyCode === 40 && this.state.active && this.state.historyPosition > -1) {
      if (this.state.historyPosition === 0) {
        this.updateHistoryPosition(-1);
        this.valueInput('');
      } else {
        this.updateHistoryPosition(this.state.historyPosition - 1);
        this.valueInput(this.state.historyMessages[this.state.historyPosition]);
      }
    } else if (
      event.keyCode === 38 &&
      this.state.active &&
      this.state.historyPosition < this.state.historyMessages.length - 1
    ) {
      this.updateHistoryPosition(this.state.historyPosition + 1);
      this.valueInput(this.state.historyMessages[this.state.historyPosition]);
    }
  }

  render() {
    return (
      <>
        <div className="main-chat-wrap" style={{ zIndex: this.state.active ? 9999 : 0 }}>
          <div
            className="chat-posts"
            style={{ overflow: this.state.active ? 'auto' : 'hidden', height: `${this.state.heightChat}vh`, fontSize: `${this.state.fontChat}px` }}
            ref={(div) => (this.messageList = div)}
          >
            {this.state.show
              ? this.state.messages
                  .slice()
                  .reverse()
                  .map((item, key) => (
                    <p
                      className="chat-post say"
                      key={key}
                      dangerouslySetInnerHTML={{
                        __html: item,
                      }}
                    ></p>
                  ))
              : ''}
          </div>
          {this.state.active ? (
            <div className="chat-hidden">
              <div className="chat-hud-wrap posrev">
                <div className="chat-entered">
                  [{this.state.value[0] == '/' ? 'Команда' : 'Сказать'}]:
                </div>
                <input
                  type="text"
                  className="chat-hud-input"
                  ref={(input) => {
                    if (input) {
                      this.inputChat = input;
                      input.focus();
                    }
                  }}
                  value={this.state.value}
                  onChange={(e) => this.valueInput(e.target.value)}
                  placeholder="Сообщение"
                />
              </div>
            </div>
          ) : (
            ''
          )}
        </div>
      </>
    );
  }
}

const mapStateToProps = (state: any) => ({
  gui: state.gui.open,
  binder: state.gui.binder,
});
const mapDispatchToProps = (dispatch: any) => bindActionCreators({
  setChatActive
}, dispatch)

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Chat);
