import * as React from 'react';
import {Base64} from 'js-base64';

export function RankButton(props: {c: string; n: string; s: number; label?: string; onSearch?: (s: string) => void}) {
  let {c, n, s, onSearch, label} = props;
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

  return (
    <div className="horizontal">
      <div className="clan-name" title={`积分：${s}`} onClick={nameClicked}>
        {label}
      </div>
      <a target="_blank" href={`//www.deepmess.com/namerena/#n=${base64}`} title="挑战" className="battle-icon">
        ⚔
      </a>
    </div>
  );
}
