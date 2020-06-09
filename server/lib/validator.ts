import validate = WebAssembly.validate;

const invalidClanChar = /[\u0000-\u001F+@\\\/?%*"|:<>]/;
const invalidNameChar = /[\u0000-\u001F+@"]/;

function tooLong(str: string) {
  if (str.length > 20) {
    return true;
  }
  let doubles = 0;
  for (let i = 0; i < str.length; ++i) {
    if (str.charCodeAt(i) > 255) {
      ++doubles;
    }
  }
  if (doubles + str.length > 20) {
    return true;
  }
  return false;
}

export function validateNameChange(
  data: any
): {clan?: string; names?: string[][]; password?: string; create?: boolean} | string {
  if (!data || data.constructor !== Object) {
    return {};
  }
  let {names: namestr, clan, password, create} = data;
  if (
    typeof namestr !== 'string' ||
    typeof clan !== 'string' ||
    typeof password !== 'string' ||
    typeof create !== 'boolean' ||
    password.length < 1
  ) {
    return '输入格式错误';
  }
  clan = clan.trim();
  if (clan.length === 0 || invalidClanChar.test(clan) || clan === '!' || tooLong(clan)) {
    return '输入战队名错误';
  }
  let names = namestr.split('\n').map((s: string) => s.trim());
  for (let name of names) {
    if (tooLong(name) || invalidNameChar.test(name)) {
      return `输入名字错误：${name}`;
    }
  }
  let uniqueNames = names.filter((s: string) => s.length);
  let uniqueNameSet = new Set(uniqueNames);
  if (uniqueNames.length !== uniqueNameSet.size) {
    return '输入名字重复';
  }

  let output: string[][] = [];
  const groupSizes = [1, 1, 2, 3, 4, 5];
  let i = 0;
  for (let gsize of groupSizes) {
    let group: string[] = [];
    for (let j = 0; j < gsize && i < names.length; ++i, ++j) {
      let name = names[i];
      if (name.length) {
        // 名字加上空格前缀，方便战队编组
        group.push(` ${name}`);
      }
    }
    if (group.length === gsize) {
      output.push(group);
    } else {
      output.push([]);
    }
  }
  return {clan, names: output, password, create};
}
