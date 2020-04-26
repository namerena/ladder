import * as React from 'react';
import {Input, Tabs} from 'antd';
import {ChangeEvent, KeyboardEvent, SyntheticEvent} from 'react';
import {RankView} from './rank-view';
import {UserView} from './user-view';
const {TabPane} = Tabs;

interface State {
  host: string;
  searched?: string;
  tab: string;
}
export class App extends React.PureComponent<any, any> {
  state: State = {host: 'http://localhost', tab: '1'};
  onHostChange = (e: KeyboardEvent<HTMLInputElement>) => {
    let host = (e.target as HTMLInputElement).value;
    if (!host.startsWith('http')) {
      host = 'http://' + host;
    }
    this.setState({host});
  };
  onSearch = (str: string) => {
    this.setState({searched: str, tab: '2'});
  };
  changeTab = (tab: string) => {
    this.setState({tab, searched: null});
  };
  render(): React.ReactNode {
    let {host, searched, tab} = this.state;
    return (
      <>
        <div className="horizontal margin-v">
          服务器地址：
          <Input defaultValue={host} onPressEnter={this.onHostChange} />
        </div>
        <Tabs activeKey={tab} onChange={this.changeTab}>
          <TabPane tab="排名" key="1">
            <RankView host={host} onSearch={this.onSearch} />
          </TabPane>
          <TabPane tab="查询" key="2">
            <UserView host={host} searched={searched} />
          </TabPane>
          <TabPane tab="登入" key="3">
            Content of Tab Pane 2
          </TabPane>
        </Tabs>
      </>
    );
  }
}
