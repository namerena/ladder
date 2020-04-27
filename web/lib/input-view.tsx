import * as React from 'react';
import Axios from 'axios';
import {Alert, Button, Card, Input, Spin, Radio} from 'antd';
import {ChangeEvent} from 'react';
import {getUTC8Str, TEAM} from '../../server/lib/util';
import {validateNameChange} from '../../server/lib/validator';

const TextArea = Input.TextArea;

interface Props {
  host: string;
}

interface State {
  clan: string;
  names: string;
  password: string;
  confirmPassword: string;
  create: boolean;
  error?: string;
}
export class InputView extends React.PureComponent<Props, State> {
  state: State = {clan: '', names: '', password: '', confirmPassword: '', create: true};

  onSubmit = async () => {
    let {host} = this.props;
    let {clan, names, password, confirmPassword, create} = this.state;
    if (create) {
      if (password !== confirmPassword) {
        this.setState({error: '密码不匹配'});
        return;
      }
    }

    try {
      let data = {clan, names, password, create};
      let result = validateNameChange(data);
      if (typeof result === 'string') {
        this.setState({error: result});
        return;
      }
      let response = (await Axios.post(`${host}/update`, data)).data;
      if (response) {
        this.setState({error: response});
      } else {
        this.setState({error: '提交成功'});
      }
    } catch (e) {
      this.setState({error: String(e)});
    }
  };
  render(): React.ReactNode {
    let {create, error} = this.state;
    return (
      <div>
        <div className="horizontal margin-v">
          <div className="form-label" />
          <Radio.Group
            defaultValue="create"
            buttonStyle="solid"
            onChange={(e) => this.setState({create: e.target.value === 'create'})}
          >
            <Radio.Button value="create">新建战队</Radio.Button>
            <Radio.Button value="update">更新战队</Radio.Button>
          </Radio.Group>
        </div>
        <div className="horizontal margin-v">
          <div className="form-label">战队名：</div>
          <Input onChange={(e) => this.setState({clan: e.target.value})} />
        </div>
        <div className="horizontal margin-v">
          <div className="form-label">密码：</div>
          <Input.Password onChange={(e) => this.setState({password: e.target.value})} />
        </div>
        {create ? (
          <div className="horizontal margin-v">
            <div className="form-label">确认密码：</div>
            <Input.Password onChange={(e) => this.setState({confirmPassword: e.target.value})} />
          </div>
        ) : null}
        <div className="horizontal margin-v">
          <div className="form-label">名字：</div>
          <TextArea
            rows={8}
            placeholder={'最少输入5行名字\n\n战队和名字不可以包括以下字符：\n+ @ \\ / ? % * " | : < >'}
            onChange={(e) => this.setState({names: e.target.value})}
          />
        </div>
        {error ? <Alert message={error} type={error === '提交成功' ? 'success' : 'error'} showIcon /> : null}
        <div className="horizontal margin-v">
          <div className="form-label" />
          <Button type="primary" onClick={this.onSubmit}>
            提交
          </Button>
        </div>
      </div>
    );
  }
}
