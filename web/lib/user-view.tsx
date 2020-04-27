import * as React from 'react';
import Axios from 'axios';
import {Alert, Button, Card, Input, Spin} from 'antd';
import {ChangeEvent} from 'react';
import {getUTC8Str, TEAM} from '../../server/lib/util';
import {RankButton} from './shared';

interface Props {
  host: string;
  searched: string;
}

interface State {
  searchFromProp?: string;
  searching: string;
  searched?: string;
}
const gridStyle: React.CSSProperties = {
  width: '50%',
  whiteSpace: 'pre',
};

export class UserView extends React.PureComponent<Props, State> {
  static getDerivedStateFromProps(props: Props, state: State) {
    let {searched} = props;
    let {searchFromProp} = state;
    if (searched && searched !== searchFromProp) {
      return {searched, searching: searched, searchFromProp: searched};
    }

    return null;
  }
  state: State = {searching: '', searched: ''};

  onSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({searching: e.target.value});
  };
  onSearch = () => {
    let {searching} = this.state;
    this.setState({searched: searching});
  };
  onReload = () => {
    this.searchResult.clear();
    this.forceUpdate();
  };

  searchResult = new Map<string, any>();
  render(): React.ReactNode {
    let {searching, searched} = this.state;
    return (
      <div>
        <div className="horizontal margin-v">
          查询战队：
          <Input value={searching} onChange={this.onSearchChange} onPressEnter={this.onSearch} />
          <Button onClick={this.onReload}>刷新</Button>
        </div>
        {this.renderResult()}
      </div>
    );
  }
  renderResult() {
    let {searching, searched} = this.state;

    if (!this.searchResult.has(searched)) {
      this.reload();
      return <Spin />;
    }
    let data = this.searchResult.get(searched);
    if (!data) {
      return <Spin />;
    }

    if (typeof data === 'string') {
      return <Alert message={data} type="error" showIcon />;
    }

    return (
      <div>
        <Alert
          className="margin-v"
          message={` 战队：${data.clan}`}
          description={`最近更新时间：${getUTC8Str(data.lastChangeTime)}`}
          type="info"
        />
        {this.renderTeam(data, '1')}
        {this.renderTeam(data, '2')}
        {this.renderTeam(data, '5')}
      </div>
    );
  }

  async reload() {
    let {host} = this.props;
    let {searched} = this.state;
    this.searchResult.set(searched, null);
    try {
      let result = (await Axios.get(`${host}/get?clan=${encodeURIComponent(searched)}`)).data;
      if (result) {
        this.searchResult.set(searched, result);
      } else {
        this.searchResult.set(searched, '战队不存在');
      }
    } catch (e) {
      this.searchResult.set(searched, String(e));
    }
    this.forceUpdate();
  }

  renderTeam(data: any, team: TEAM) {
    let teamData = data[team];
    let rankNodes: React.ReactNode[] = [];
    for (let rankData of teamData.ranks) {
      let [rank, clan] = rankData;
      let onNameClick = () => {
        this.setState({searched: clan, searching: clan});
      };
      if (clan === data.clan) {
        rankNodes.push(
          <div className="horizontal" key={clan}>
            <div className="rank-index">{rank + 1}</div>
            <div className="rank-name-self">{clan}</div>
          </div>
        );
      } else {
        rankNodes.push(
          <div className="horizontal" key={clan}>
            <div className="rank-index">{rank + 1}</div>
            <div className="rank-name" onClick={onNameClick}>
              {clan}
            </div>
          </div>
        );
      }
    }
    return (
      <Card
        className="margin-v"
        title={<RankButton c={data.clan} n={teamData.names} label={`${team}人组`} s={teamData.score} />}
      >
        <Card.Grid hoverable={false} style={gridStyle}>
          {teamData.names}
        </Card.Grid>
        <Card.Grid hoverable={false} style={gridStyle}>
          {rankNodes}
        </Card.Grid>
      </Card>
    );
  }
}
