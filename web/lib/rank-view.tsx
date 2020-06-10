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
      '1a': [
        <span key="head" className="table-header">
          1人组A
        </span>,
      ],
      '1b': [
        <span key="head" className="table-header">
          1人组B
        </span>,
      ],
      '2': [
        <span key="head" className="table-header">
          2人组
        </span>,
      ],
      '3': [
        <span key="head" className="table-header">
          3人组
        </span>,
      ],
      '4': [
        <span key="head" className="table-header">
          4人组
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
        if (nodes.length === 101) {
          nodes.push(<div key="...">...</div>);
        }
        nodes.push(<RankButton key={data.c} onSearch={onSearch} {...data} />);
      }
    }
    let indexSize = Math.max(
      rankNodes['1a'].length,
      rankNodes['1b'].length,
      rankNodes['2'].length,
      rankNodes['3'].length,
      rankNodes['4'].length,
      rankNodes['5'].length
    );
    for (let i = 1; i < indexSize; ++i) {
      if (i <= 100) {
        indexes.push(<div key={i}>{i}</div>);
      } else if (i > 101) {
        indexes.push(<div key={i}>-{indexSize - i}</div>);
      } else {
        indexes.push(<div key="...">...</div>);
      }
    }

    return (
      <>
        <div className="table-main">
          <div className="table-column indxe-column">{indexes}</div>
          <div className="table-column" style={{flex: 1}}>
            {rankNodes['1a']}
          </div>
          <div className="table-column" style={{flex: 1}}>
            {rankNodes['1b']}
          </div>
          <div className="table-column" style={{flex: 1}}>
            {rankNodes['2']}
          </div>
          <div className="table-column" style={{flex: 1}}>
            {rankNodes['3']}
          </div>
          <div className="table-column" style={{flex: 1}}>
            {rankNodes['4']}
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
      this.analyzeNames(result);
      this.setState({ranks: result, error: null});
    } catch (e) {
      this.setState({error: String(e), ranks: null});
    }
  }

  // 给名字上色
  analyzeNames(ranks: any) {
    if (!ranks) {
      return;
    }
    // 统计名字
    let names = new Map<string, number>();
    let ranksums = new Map<string, number>();

    for (let t of TEAMS) {
      for (let i = 0; i < ranks[t].length; ++i) {
        let data = ranks[t][i];
        let {c, n} = data;
        let namecount = names.get(c) || 0;
        namecount++;
        names.set(c, namecount);

        let ranksum = ranksums.get(c) || 0;
        if (i < 100) {
          ranksum += i;
        } else {
          ranksum += 109 - i;
        }
        ranksums.set(c, ranksum);
      }
    }
    for (let t of TEAMS) {
      for (let data of ranks[t]) {
        let {c} = data;
        let nameCount = names.get(c);
        if (nameCount === 6) {
          let ranksum = ranksums.get(c);
          if (ranksum < 255) {
            data['color'] = `#${(255 - ranksum).toString(16).padStart(2, '0')}0000`;
          }
        }
      }
    }
  }
}

const COLORS = ['#d62', '#f00', '#f0f'];
