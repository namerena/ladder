import * as React from 'react';
import Axios from 'axios';
import {Alert, Button, Card, Input, Spin} from 'antd';
import {ChangeEvent} from 'react';
import {getUTC8Str, TEAM} from '../../server/lib/util';
import {RankButton} from './shared';
import {Base64} from 'js-base64';

interface Props {
  host: string;
  searched: string;
}

interface State {
  searchFromProp?: string;
  typing: string;
  currentClan?: string;
  history?: TEAM;
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
      return {currentClan: searched, typing: searched, searchFromProp: searched, history: null} as State;
    }

    return null;
  }
  state: State = {typing: '', currentClan: ''};

  onSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({typing: e.target.value});
  };
  onSearch = () => {
    let {typing} = this.state;
    this.setState({currentClan: typing, history: null});
  };
  onRefresh = () => {
    this.searchResult.clear();
    this.historyResult.clear();
    this.forceUpdate();
  };

  searchResult = new Map<string, any>();
  historyResult = new Map<string, any>();
  render(): React.ReactNode {
    let {typing, currentClan} = this.state;
    return (
      <div>
        <div className="horizontal margin-v">
          查询战队：
          <Input value={typing} onChange={this.onSearchChange} onPressEnter={this.onSearch} />
          <Button onClick={this.onSearch}>查询</Button>
          <Button onClick={this.onRefresh}>刷新</Button>
        </div>
        {this.renderResult()}
      </div>
    );
  }
  renderResult() {
    let {typing, currentClan} = this.state;

    if (!this.searchResult.has(currentClan)) {
      this.reload();
      return <Spin />;
    }
    let data = this.searchResult.get(currentClan);
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
        <div className="horizontal" style={{alignItems: 'stretch'}}>
          {this.renderTeam(data, '1')}
          {this.renderTeam(data, '2')}
          {this.renderTeam(data, '5')}
        </div>
        {this.renderHistory()}
      </div>
    );
  }

  async reload() {
    let {host} = this.props;
    let {currentClan} = this.state;
    this.searchResult.set(currentClan, null);

    try {
      if (currentClan) {
        let result = (await Axios.get(`${host}/get?clan=${encodeURIComponent(currentClan)}`)).data;
        if (result) {
          this.searchResult.set(currentClan, result);
        } else {
          this.searchResult.set(currentClan, '战队不存在');
        }
      } else {
        this.searchResult.set(currentClan, '请输入战队名');
      }
    } catch (e) {
      this.searchResult.set(currentClan, String(e));
    }
    this.forceUpdate();
  }

  renderTeam(data: any, team: TEAM) {
    let teamData = data[team];
    let rankNodes: React.ReactNode[] = [];
    for (let rankData of teamData.ranks) {
      let [rank, clan] = rankData;
      let onNameClick = () => {
        this.setState({currentClan: clan, typing: clan});
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
        <pre>{teamData.names}</pre>
        <div>排名</div>
        {rankNodes}
        <Button className="br-float-button" onClick={() => this.setState({history: team})}>
          战斗记录
        </Button>
      </Card>
    );
  }

  renderHistory() {
    let {currentClan, history} = this.state;
    if (currentClan && history) {
      let historyKey = `${currentClan}@@${history}`;
      if (this.historyResult.has(historyKey)) {
        let data = this.historyResult.get(historyKey);
        if (data) {
          let cards: React.ReactNode[] = [];
          delete data.clan;
          let keys = Object.keys(data);
          keys.sort();
          for (let key of keys) {
            let timeRecord = data[key];
            let timeNames: string = timeRecord.names;
            let battles: React.ReactNode[] = [];
            for (let battleData of timeRecord.battles) {
              // {clan: "半人马座", names: " ξ900星↵ α371星", rank: 16, win: true}
              battles.push(
                <HistoryButton
                  c0={currentClan}
                  n0={timeNames}
                  c1={battleData.clan}
                  n1={battleData.names}
                  rank1={battleData.rank}
                  seed={key}
                  win={battleData.win}
                />
              );
            }
            cards.push(
              <Card key={key} size="small" title={key}>
                <div>排名：{timeRecord.rank}</div>
                <div>出场：{timeNames.split('\n').join()}</div>
                {battles}
              </Card>
            );
          }
          return cards;
        }
      } else {
        this.loadHistory(currentClan, history, historyKey);
        return <Spin />;
      }
    }
    return null;
  }
  async loadHistory(clan: string, history: TEAM, historyKey: string) {
    let {host} = this.props;
    this.historyResult.set(historyKey, null);

    try {
      let result = (await Axios.get(`${host}/history?clan=${encodeURIComponent(clan)}&team=${history}`)).data;
      if (result) {
        this.historyResult.set(historyKey, result);
      } else {
        return;
      }
    } catch (e) {
      this.historyResult.set(historyKey, String(e));
    }
    this.forceUpdate();
  }
}

function HistoryButton(props: {
  c0: string;
  n0: string;
  c1: string;
  n1: string;
  rank1: number;
  seed: string;
  win: boolean;
}) {
  let {c0, n0, c1, n1, rank1, seed, win} = props;
  let names0 = n0.split('\n').map((str: string) => `${str.trimLeft()}@${c0}`);
  let names1 = n1.split('\n').map((str: string) => `${str.trimLeft()}@${c1}`);
  let base64 = Base64.encodeURI(`${names0.join('\n')}\n\n${names1.join('\n')}\n\nseed:${seed}@!`);

  return (
    <div className="horizontal history-label">
      <a target="_blank" href={`//www.deepmess.com/namerena/#n=${base64}`} title="回放" className="battle-icon">
        {win ? '✔' : '❌'}对手：{c1} ( {n1.split('\n').join()} ) 排名：{rank1}
      </a>
    </div>
  );
}
