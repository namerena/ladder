import * as React from 'react';
import Axios from 'axios';
import {Alert, Spin} from 'antd';
import {TEAM, TEAMS} from '../../server/lib/util';
import {RankButton} from './shared';

interface Props {
  host: string;
  onSearch: (s: string) => void;
}

interface State {
  ranks?: any;
  error?: string;
}

export class RankView extends React.PureComponent<Props, State> {
  state: State = {};
  cachedHost: string;
  render(): React.ReactNode {
    let {host, onSearch} = this.props;
    let {ranks, error} = this.state;
    if (host !== this.cachedHost) {
      this.reload();
      return <Spin />;
    }
    if (error) {
      return <Alert message={error} type="error" showIcon />;
    }
    if (!ranks) {
      return null;
    }

    let indexes: React.ReactNode[] = [
      <span key="head" className="table-header">
        排名
      </span>,
    ];
    let rankNodes: {[key: string]: React.ReactNode[]} = {
      '1': [
        <span key="head" className="table-header">
          1人组
        </span>,
      ],
      '2': [
        <span key="head" className="table-header">
          2人组
        </span>,
      ],
      '5': [
        <span key="head" className="table-header">
          5人组
        </span>,
      ],
    };
    for (let t of TEAMS) {
      let nodes = rankNodes[t];
      for (let data of ranks[t]) {
        nodes.push(<RankButton key={data.c} onSearch={onSearch} {...data} />);
      }
    }
    let indexSize = Math.max(rankNodes['1'].length, rankNodes['2'].length, rankNodes['5'].length);
    for (let i = 1; i < indexSize; ++i) {
      indexes.push(<div key={i}>{i}</div>);
    }

    return (
      <>
        <div className="table-main">
          <div className="table-column indxe-column">{indexes}</div>
          <div className="table-column" style={{flex: 1}}>
            {rankNodes['1']}
          </div>
          <div className="table-column" style={{flex: 1}}>
            {rankNodes['2']}
          </div>
          <div className="table-column" style={{flex: 1}}>
            {rankNodes['5']}
          </div>
        </div>
        <div>服务器状态：</div>
        <pre>{ranks.lastMessages.join('\n')}</pre>
      </>
    );
  }

  async reload() {
    let {host} = this.props;
    this.cachedHost = host;
    try {
      let result = (await Axios.get(`${host}/index`)).data;
      this.setState({ranks: result, error: null});
    } catch (e) {
      this.setState({error: String(e), ranks: null});
    }
  }
}
