import * as React from 'react';
import {Base64} from 'js-base64';

export function RankButton(props: {
  c: string;
  n: string;
  s: number;
  label?: string;
  color?: string;
  onSearch?: (s: string) => void;
}) {
  let {c, n, s, onSearch, color, label} = props;
  if (!label) {
    label = c;
  }
  let names = n.split('\n').map((str: string) => `${str.trimLeft()}@${c}`);
  let base64 = Base64.encodeURI(`此处替换成你的战队名\n\n${names.join('\n')}`);

  let nameClicked = onSearch
    ? () => {
        onSearch(c);
      }
    : null;

  let style = {color};

  return (
    <div className="horizontal">
      <div className="clan-name" title={`积分：${s}`} onClick={nameClicked} style={style}>
        {label}
      </div>
      <a target="_blank" href={`https://deepmess.com/namerena/#n=${base64}`} title="挑战" className="battle-icon">
        {c === 'Rinick' ? (
          <img src="https://deepmess.com/namerena/namerena.png" style={{width: 20, height: 20}} />
        ) : (
          '⚔️'
        )}
      </a>
    </div>
  );
}
